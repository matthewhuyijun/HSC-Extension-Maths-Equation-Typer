/**
 * MathML Normalizer - Converts piecewise definitions to stretchy braces
 * 
 * This module detects piecewise definitions written with a non-stretchy left brace
 * `<mo>{</mo>` next to an `<mtable>` and converts them into a robust, auto-stretching
 * form using `<mfenced open="{" close="">…</mfenced>`.
 * 
 * Usage:
 *   const result = MathMLNormalizer.normalizePiecewise(mathmlString);
 *   console.log(result.mathml); // transformed MathML
 *   console.log(result.didTransform); // true if changes were made
 */

(function() {
    'use strict';
    
    /**
     * Parse MathML string into a DOM document
     * @param {string} mathmlString - MathML string to parse
     * @returns {Document} Parsed XML document
     */
    function parseMathML(mathmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(mathmlString, 'application/xml');
        
        // Check for parsing errors
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Failed to parse MathML: ' + parserError.textContent);
        }
        
        return doc;
    }
    
    /**
     * Serialize DOM document back to MathML string
     * @param {Document} doc - XML document
     * @returns {string} Serialized MathML string
     */
    function serializeMathML(doc) {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(doc);
    }
    
    /**
     * Check if a node is whitespace or comment
     * @param {Node} node - Node to check
     * @returns {boolean} True if node is ignorable whitespace/comment
     */
    function isIgnorable(node) {
        if (node.nodeType === Node.COMMENT_NODE) {
            return true;
        }
        if (node.nodeType === Node.TEXT_NODE) {
            return /^\s*$/.test(node.textContent);
        }
        return false;
    }
    
    /**
     * Get next non-ignorable sibling
     * @param {Node} node - Starting node
     * @returns {Node|null} Next significant sibling
     */
    function nextSignificantSibling(node) {
        let current = node.nextSibling;
        while (current && isIgnorable(current)) {
            current = current.nextSibling;
        }
        return current;
    }
    
    /**
     * Check if node is a left brace operator that needs normalization
     * @param {Node} node - Node to check
     * @returns {boolean} True if node is <mo>{</mo> without proper attributes
     */
    function isLeftBrace(node) {
        if (!node || node.nodeName !== 'mo') {
            return false;
        }
        const text = node.textContent.trim();
        if (text !== '{') {
            return false;
        }
        
        // Skip if already normalized (has stretchy, fence, and symmetric attributes)
        if (node.getAttribute('stretchy') === 'true' && 
            node.getAttribute('fence') === 'true' && 
            node.getAttribute('symmetric') === 'true') {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if node is a closing/empty mo (typically used as right fence)
     * @param {Node} node - Node to check
     * @returns {boolean} True if node appears to be a closing fence
     */
    function isClosingFence(node) {
        if (!node || node.nodeName !== 'mo') {
            return false;
        }
        const text = node.textContent.trim();
        // Empty mo or closing fence markers
        return text === '' || text === '}' || 
               node.getAttribute('fence') === 'true' ||
               node.getAttribute('stretchy') === 'true';
    }
    
    /**
     * Check if pattern is already wrapped in mfenced
     * @param {Element} mrow - The mrow element to check
     * @returns {boolean} True if already has mfenced wrapper
     */
    function hasExistingMfenced(mrow) {
        // Check if this mrow contains only an mfenced
        const children = Array.from(mrow.childNodes).filter(n => !isIgnorable(n));
        if (children.length === 1 && children[0].nodeName === 'mfenced') {
            const mfenced = children[0];
            if (mfenced.getAttribute('open') === '{' && 
                (mfenced.getAttribute('close') === '' || !mfenced.hasAttribute('close'))) {
                // Check if it contains an mtable
                const innerChildren = Array.from(mfenced.childNodes).filter(n => !isIgnorable(n));
                if (innerChildren.length === 1 && innerChildren[0].nodeName === 'mtable') {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Find and transform piecewise patterns in a node
     * @param {Element} element - Element to search
     * @returns {boolean} True if any transformations were made
     */
    function transformPiecewise(element) {
        let didTransform = false;
        
        // Process all mrow elements (and the root math element)
        const candidates = [element];
        if (element.nodeName === 'math') {
            candidates.push(...element.querySelectorAll('mrow'));
        } else if (element.nodeName === 'mrow') {
            candidates.push(...element.querySelectorAll('mrow'));
        }
        
        for (const container of candidates) {
            // Skip if already has correct mfenced structure
            if (hasExistingMfenced(container)) {
                continue;
            }
            
            // Get all significant children
            const children = Array.from(container.childNodes);
            
            for (let i = 0; i < children.length; i++) {
                const node = children[i];
                
                // Skip ignorable nodes
                if (isIgnorable(node)) {
                    continue;
                }
                
                // Look for pattern: <mo>{</mo> <mtable>…</mtable> [optional <mo>]
                if (isLeftBrace(node)) {
                    const nextNode = nextSignificantSibling(node);
                    
                    if (nextNode && nextNode.nodeName === 'mtable') {
                        // Found a candidate! Check for optional closing fence
                        const afterTable = nextSignificantSibling(nextNode);
                        const hasClosingFence = afterTable && isClosingFence(afterTable);
                        
                        // Create a proper structure: <mrow><mo stretchy="true">{</mo><mtable>...</mtable></mrow>
                        const doc = node.ownerDocument;
                        const mathmlNS = 'http://www.w3.org/1998/Math/MathML';
                        
                        // Create wrapper mrow
                        const mrow = doc.createElementNS(mathmlNS, 'mrow');
                        
                        // Create opening brace mo (with stretchy attribute for proper sizing)
                        const openingMo = doc.createElementNS(mathmlNS, 'mo');
                        openingMo.textContent = '{';
                        openingMo.setAttribute('stretchy', 'true');
                        openingMo.setAttribute('fence', 'true');
                        openingMo.setAttribute('symmetric', 'true');
                        
                        // Clone the mtable
                        const mtableClone = nextNode.cloneNode(true);
                        
                        // Assemble: mrow contains mo and mtable
                        mrow.appendChild(openingMo);
                        mrow.appendChild(mtableClone);
                        
                        // Insert the new structure before the opening brace
                        container.insertBefore(mrow, node);
                        
                        // Remove the original nodes
                        container.removeChild(node); // Remove opening brace
                        container.removeChild(nextNode); // Remove mtable
                        
                        if (hasClosingFence) {
                            container.removeChild(afterTable); // Remove closing fence
                        }
                        
                        didTransform = true;
                        
                        // Restart search in this container since we modified it
                        break;
                    }
                }
            }
        }
        
        return didTransform;
    }
    
    /**
     * Normalize piecewise definitions in MathML
     * @param {string} mathmlString - Input MathML string
     * @returns {Object} Result with {mathml: string, didTransform: boolean}
     */
    function normalizePiecewise(mathmlString) {
        try {
            // Parse the MathML
            const doc = parseMathML(mathmlString);
            
            // Find the root math element
            const mathElement = doc.querySelector('math') || doc.documentElement;
            
            // Transform piecewise patterns
            const didTransform = transformPiecewise(mathElement);
            
            // Serialize back to string
            const resultString = serializeMathML(doc);
            
            return {
                mathml: resultString,
                didTransform: didTransform
            };
        } catch (error) {
            console.error('MathML normalization error:', error);
            return {
                mathml: mathmlString,
                didTransform: false,
                error: error.message
            };
        }
    }
    
    /**
     * Apply normalization to a DOM element containing MathML
     * @param {Element} element - DOM element containing MathML
     * @returns {boolean} True if transformations were made
     */
    function normalizeElement(element) {
        if (!element) return false;
        
        // If it's a math element, transform it directly
        if (element.nodeName === 'math') {
            return transformPiecewise(element);
        }
        
        // Otherwise, find and transform all math elements within
        let didTransform = false;
        const mathElements = element.querySelectorAll('math');
        for (const mathEl of mathElements) {
            if (transformPiecewise(mathEl)) {
                didTransform = true;
            }
        }
        
        return didTransform;
    }
    
    // Expose to global scope
    window.MathMLNormalizer = {
        normalizePiecewise,
        normalizeElement,
        version: '1.0.0'
    };
    
    console.log('MathML Normalizer loaded (v1.0.0)');
})();

