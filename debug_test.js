const converter = require('./converter_new.js');
const toWordEquation = converter.toWordEquation;

// Debug test case 3
const input3 = '\\frac{e^{\\mu x}+x^2}{e^{-\\mu x}-x^2}';
console.log('Test 3:');
console.log('Input:', input3);
console.log('Output:', toWordEquation(input3));
console.log('Expected: (e^(μ x)+x^(2))/(e^(-μ x)-x^(2))');
console.log();

// Debug test case 2
const input2 = '\\sqrt[a]{b}';
console.log('Test 2:');
console.log('Input:', input2);
console.log('Output:', toWordEquation(input2));
console.log('Expected: √(a&b)');

