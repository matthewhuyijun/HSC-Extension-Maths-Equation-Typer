/**
 * Test Bundle - Non-module wrapper for test pages
 * This file imports the ES6 modules and exposes them to window
 */

import { toWordEquation } from './latex-converter.js';

// Expose to window
window.toWordEquation = toWordEquation;

// Signal that the converter is ready
console.log('✅ Converter loaded and ready');
window.converterReady = true;
window.dispatchEvent(new Event('converterReady'));

