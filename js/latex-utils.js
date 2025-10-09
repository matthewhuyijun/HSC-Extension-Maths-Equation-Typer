/**
 * LaTeX Utility Functions
 * 
 * Helper functions for LaTeX manipulation and cleanup
 */

/**
 * Normalize LaTeX string by removing empty structures
 * This helps clean up the editor when users delete content
 * @param {string} latex - The LaTeX string to normalize
 * @returns {string} Normalized LaTeX
 */
export function normalizeLatexStr(latex) {
    let L = latex;
    
    try {
        const EMPTY_SLOT = String.raw`\s*(?:\\placeholder\{\})?\s*`;
        const EMPTY_BRACE = String.raw`\{${EMPTY_SLOT}\}`;
        
        // Remove empty fractions
        L = L.replace(new RegExp(String.raw`\\frac${EMPTY_BRACE}${EMPTY_BRACE}`, "g"), "");
        
        // Remove empty square roots
        L = L.replace(new RegExp(String.raw`\\sqrt${EMPTY_BRACE}`, "g"), "");
        L = L.replace(new RegExp(String.raw`\\sqrt\[${EMPTY_SLOT}\]${EMPTY_BRACE}`, "g"), "");
        
        // Remove empty dot/ddot
        L = L.replace(new RegExp(String.raw`\\(dot|ddot)${EMPTY_BRACE}`, "g"), "");
        
        // Remove empty delimiters
        const rm = (open, close) => new RegExp(String.raw`\\left\s*${open}${EMPTY_SLOT}\\right\s*${close}`, 'g');
        L = L.replace(rm('\\(', '\\)'), "");
        L = L.replace(rm('\\[', '\\]'), "");
        L = L.replace(rm('\\{', '\\\\}'), "");
        L = L.replace(rm('\\|', '\\|'), "");
        
        // Remove empty integrals with limits
        L = L.replace(new RegExp(String.raw`\\int_${EMPTY_BRACE}\^${EMPTY_BRACE}${EMPTY_SLOT}(?:d[a-zA-Z]+)?`, "g"), "");
        
        // Remove empty sums/products
        L = L.replace(new RegExp(String.raw`\\(sum|prod)_${EMPTY_BRACE}\^${EMPTY_BRACE}${EMPTY_SLOT}`, "g"), "");
        L = L.replace(new RegExp(String.raw`\\(sum|prod)_\{n=${EMPTY_SLOT}\}\^${EMPTY_BRACE}${EMPTY_SLOT}`, "g"), "");
        
        // Remove empty indefinite integrals
        L = L.replace(new RegExp(String.raw`\\int\s*${EMPTY_SLOT}(?:d[a-zA-Z]+)?(?![_^])`, "g"), "");
        
        // Remove empty limits
        L = L.replace(new RegExp(String.raw`\\lim_\{x\\to\s*${EMPTY_SLOT}\}${EMPTY_SLOT}`, "g"), "");
        L = L.replace(new RegExp(String.raw`\\lim_${EMPTY_BRACE}${EMPTY_SLOT}`, "g"), "");
        
        // Remove empty matrices
        L = L.replace(new RegExp(String.raw`\\begin\{pmatrix\}(?:${EMPTY_SLOT}|&|\\\\|\s)*\\end\{pmatrix\}`, "g"), '');
    } catch (e) {
        console.warn('normalizeLatexStr normalization failed', e);
    }
    
    return L;
}

/**
 * Check if a LaTeX string is effectively empty
 * @param {string} latex - The LaTeX string to check
 * @returns {boolean} True if the string is empty or contains only whitespace/placeholders
 */
export function isEmptyLatex(latex) {
    if (!latex) return true;
    const normalized = normalizeLatexStr(latex);
    return normalized.trim().length === 0;
}

/**
 * Extract the main content from a LaTeX expression
 * Removes outer delimiters if they wrap the entire expression
 * @param {string} latex - The LaTeX expression
 * @returns {string} Content without outer delimiters
 */
export function extractContent(latex) {
    let result = latex.trim();
    
    // Remove outer \left( ... \right) if present
    if (result.startsWith('\\left(') && result.endsWith('\\right)')) {
        result = result.slice(6, -7).trim();
    }
    
    // Remove outer \left[ ... \right] if present
    if (result.startsWith('\\left[') && result.endsWith('\\right]')) {
        result = result.slice(6, -7).trim();
    }
    
    return result;
}

