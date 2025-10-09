#!/usr/bin/env node
/**
 * Node.js Test for Modular Converter
 * 
 * This tests the converter modules in a Node.js environment
 * Note: Requires Node.js with ES modules support (v14+)
 */

import { toWordEquation } from './js/latex-converter.js';
import { postProcess } from './js/postprocessor.js';

console.log('🧪 Testing E2 MathsTyper Modules\n');

const tests = [
    {
        name: 'Simple Fraction',
        input: '\\frac{1}{2}',
        expected: '(1)/(2)'
    },
    {
        name: 'Square Root',
        input: '\\sqrt{x}',
        expected: '√(x)'
    },
    {
        name: 'Integral with Limits',
        input: '\\int_{0}^{1} x dx',
        expected: '∫_(0)^(1)'
    },
    {
        name: 'Greek Letters',
        input: '\\alpha + \\beta',
        expected: 'α+β'
    },
    {
        name: 'Summation',
        input: '\\sum_{i=1}^{n} i',
        expected: '∑_(i=1)^(n)'
    }
];

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
    try {
        const result = toWordEquation(test.input);
        const success = result.includes(test.expected);
        
        if (success) {
            console.log(`✓ Test ${index + 1}: ${test.name}`);
            console.log(`  Input:  ${test.input}`);
            console.log(`  Output: ${result}`);
            passed++;
        } else {
            console.log(`✗ Test ${index + 1}: ${test.name}`);
            console.log(`  Input:    ${test.input}`);
            console.log(`  Expected: ${test.expected}`);
            console.log(`  Got:      ${result}`);
            failed++;
        }
        console.log('');
    } catch (error) {
        console.log(`✗ Test ${index + 1}: ${test.name} - ERROR`);
        console.log(`  ${error.message}`);
        console.log('');
        failed++;
    }
});

console.log('─'.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(failed === 0 ? '🎉 All tests passed!' : '❌ Some tests failed');

process.exit(failed === 0 ? 0 : 1);

