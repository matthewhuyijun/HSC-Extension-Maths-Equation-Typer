/**
 * Application Bridge
 * 
 * This module provides a bridge between the modular JavaScript code
 * and the inline scripts in the HTML file. It exposes the converter
 * functions to the global scope for backward compatibility.
 */

import { toWordEquation, normalizeWordInput, removeWordSpaces } from './latex-converter.js';
import { normalizeLatexStr } from './latex-utils.js';

// Create a convenience function for the test suite
function convertLatexToUnicodeMath(latex) {
    return toWordEquation(latex);
}

// Expose functions to global scope for use in HTML inline scripts
window.toWordEquation = toWordEquation;
window.normalizeWordInput = normalizeWordInput;
window.removeWordSpaces = removeWordSpaces;
window.normalizeLatexStr = normalizeLatexStr;
window.convertLatexToUnicodeMath = convertLatexToUnicodeMath;

// Export for ES6 module imports
export { convertLatexToUnicodeMath, toWordEquation, normalizeWordInput, removeWordSpaces, normalizeLatexStr };

// Mark modules as loaded
window.e2ModulesLoaded = true;

// Dispatch event to notify that modules are ready
window.dispatchEvent(new Event('e2ModulesReady'));

// Log successful module loading
console.log('✅ E2 MathsTyper modules loaded successfully');
console.log('📦 Available functions: toWordEquation, normalizeWordInput, removeWordSpaces, normalizeLatexStr');

