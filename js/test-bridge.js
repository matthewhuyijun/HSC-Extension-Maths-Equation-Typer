/**
 * Test Bridge
 * 
 * This module provides access to converter functions for the test page.
 * Unlike app-bridge.js, this doesn't use ES6 imports and works with regular script tags.
 */

// Wait for all dependencies to be available
(function() {
    'use strict';
    
    // Check if the main converter function is available (from latex-converter.js)
    if (typeof window.convertLatexToUnicodeMath === 'undefined') {
        console.error('❌ convertLatexToUnicodeMath not found! Make sure latex-converter.js is loaded first.');
        return;
    }
    
    // Alias for convenience
    window.toWordEquation = window.convertLatexToUnicodeMath;
    
    console.log('✅ Test bridge loaded successfully');
    console.log('📦 toWordEquation function is available');
})();

