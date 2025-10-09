/**
 * E2 MathsTyper - Main Application Module
 * 
 * This is the main entry point that exports all functionality
 * for the LaTeX to UnicodeMath converter.
 */

// Export all modules for use in the application
export { greekMap, symbolMap, standardFunctions } from './symbol-maps.js';
export { parse } from './latex-parser.js';
export { print } from './ast-printer.js';
export { postProcess, addRule, getRules, removeRule } from './postprocessor.js';
export { toWordEquation, normalizeWordInput, removeWordSpaces } from './latex-converter.js';
export { normalizeLatexStr, isEmptyLatex, extractContent } from './latex-utils.js';

// Create a global API object for easy access from HTML
if (typeof window !== 'undefined') {
    window.LatexConverter = {
        toWordEquation: async () => {
            const { toWordEquation } = await import('./latex-converter.js');
            return toWordEquation;
        },
        normalizeWordInput: async () => {
            const { normalizeWordInput } = await import('./latex-converter.js');
            return normalizeWordInput;
        },
        removeWordSpaces: async () => {
            const { removeWordSpaces } = await import('./latex-converter.js');
            return removeWordSpaces;
        },
        normalizeLatexStr: async () => {
            const { normalizeLatexStr } = await import('./latex-utils.js');
            return normalizeLatexStr;
        }
    };
}

