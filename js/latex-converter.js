/**
 * LaTeX to UnicodeMath Converter
 * 
 * Main module that orchestrates the conversion from LaTeX to UnicodeMath
 * format suitable for Microsoft Word equations.
 */

import { parse } from './latex-parser.js';
import { print } from './ast-printer.js';
import { postProcess } from './postprocessor.js';

/**
 * Convert LaTeX expression to Word equation format (UnicodeMath)
 * @param {string} latex - The LaTeX expression to convert
 * @returns {string} UnicodeMath representation
 */
export function toWordEquation(latex) {
    try {
        // Step 1: Parse LaTeX to AST
        const ast = parse(latex);
        
        // Step 2: Print AST to UnicodeMath
        let result = print(ast);
        console.log('Before postprocess:', result);
        
        // Step 3: Apply post-processing refinements
        result = postProcess(result);
        console.log('After postprocess:', result);
        
        return result;
    } catch (e) {
        console.error('LaTeX parsing error:', e);
        // Fallback: return original LaTeX if conversion fails
        return latex;
    }
}

/**
 * Normalize Word equation format input to clean UnicodeMath/LaTeX
 * Useful for handling pasted Word equation content
 * @param {string} text - Text that may contain Word equation formatting
 * @returns {string} Normalized text
 */
export function normalizeWordInput(text) {
    let result = String(text ?? '');
    
    // 1. Replace lenticular brackets 〖〗 with parentheses ()
    result = result.replace(/〖/g, '(');
    result = result.replace(/〗/g, ')');
    
    // 2. Replace n-ary operator marker ▒ (U+2592) with space
    result = result.replace(/▒/g, ' ');
    
    // 3. Remove function application character (U+2061)
    result = result.replace(/\u2061/g, '');
    
    // 4. Clean up delimiter patterns ├ ┤ (often appear around integrals)
    result = result.replace(/├/g, '');
    result = result.replace(/┤/g, '');
    
    // 5. Normalize extra spaces
    result = result.replace(/\s+/g, ' ').trim();
    
    return result;
}

/**
 * Remove \: spacing that MathLive adds for Word compatibility
 * This spacing should not appear in standard LaTeX
 * @param {string} latex - LaTeX string that may contain \: spacing
 * @returns {string} LaTeX with \: spacing removed
 */
export function removeWordSpaces(latex) {
    let result = latex;
    let iterations = 0;
    const maxIterations = 10;
    
    while (iterations < maxIterations && result.includes('\\:')) {
        const before = result;
        // Remove \: after integral/sum/product operators (with or without limits)
        result = result
            .replace(/(\\int(?:[_^]\{[^}]*\})*)\s*\\:/g, '$1')
            .replace(/(\\sum(?:[_^]\{[^}]*\})*)\s*\\:/g, '$1')
            .replace(/(\\prod(?:[_^]\{[^}]*\})*)\s*\\:/g, '$1');
        
        // If nothing changed, remove all remaining \: 
        if (result === before) {
            result = result.replace(/\\:/g, '');
            break;
        }
        iterations++;
    }
    
    return result;
}

