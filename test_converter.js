// Test the new AST-based converter
const converter = require('./converter_new.js');
const toWordEquation = converter.toWordEquation;

// Test cases from requirements
const tests = [
    ['\\sqrt{x}', '√(x)'],
    ['\\sqrt[a]{b}', '√(a&b)'],
    ['\\frac{e^{\\mu x}+x^2}{e^{-\\mu x}-x^2}', '(e^(μ x)+x^(2))/(e^(-μ x)-x^(2))'],
    ['\\sum_{n=1}^3 n', '∑_(n=1)^(3) n'],
    ['\\prod_{n=2}^3 n', '∏_(n=2)^(3) n'],
    ['\\int_{b}^{a} f(x) dx', '∫_b^a 〖f(x)〗 dx'],
    ['\\left.f(x)\\right|_{b}^{a}', '├ f(x)┤|b^a'],
    ['\\operatorname{proj}_{\\underset{\\sim}{A}}\\underset{\\sim}{B}', 'proj_A┬∼   B┬∼'],
    ['\\overrightarrow{AB}', '(AB)⃗'],
    ['\\begin{pmatrix}a\\\\ b\\end{pmatrix}', '(■(a@b))'],
    ['\\begin{pmatrix}a\\\\ b\\\\ c\\end{pmatrix}', '(■(a@b@c))']
];

console.log('Running test cases...\n');

let passed = 0;
let failed = 0;

tests.forEach(([input, expected], i) => {
    const result = toWordEquation(input);
    const success = result === expected;
    
    if (success) {
        console.log(`✓ Test ${i + 1} passed`);
        passed++;
    } else {
        console.log(`✗ Test ${i + 1} failed`);
        console.log(`  Input:    ${input}`);
        console.log(`  Expected: ${expected}`);
        console.log(`  Got:      ${result}`);
        failed++;
    }
});

console.log(`\n${passed} passed, ${failed} failed out of ${tests.length} tests`);

