/**
 * Application Bridge
 * 
 * This module provides a bridge between the modular JavaScript code
 * and the inline scripts in the HTML file. It exposes the converter
 * functions to the global scope for backward compatibility.
 */

import { toWordEquation, normalizeWordInput, removeWordSpaces } from './latex-converter.js';
import { normalizeLatexStr } from './latex-utils.js';

// Expose functions to global scope for use in HTML inline scripts
window.toWordEquation = toWordEquation;
window.normalizeWordInput = normalizeWordInput;
window.removeWordSpaces = removeWordSpaces;
window.normalizeLatexStr = normalizeLatexStr;

// Log successful module loading
console.log('✅ E2 MathsTyper modules loaded successfully');
console.log('📦 Available functions: toWordEquation, normalizeWordInput, removeWordSpaces, normalizeLatexStr');

