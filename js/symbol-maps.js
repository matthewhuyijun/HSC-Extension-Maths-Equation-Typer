/**
 * Symbol Mapping Tables for LaTeX to UnicodeMath Conversion
 * 
 * This module contains the mapping tables for converting LaTeX symbols
 * to their Unicode equivalents for Word equation format.
 * 
 * Refactored for file:// protocol compatibility (no ES6 modules)
 */

(function() {
    'use strict';
    
    // Greek letter mappings
    const greekMap = {
        alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ',
        epsilon: 'ε', varepsilon: 'ε', vartheta: 'ϑ', theta: 'θ', Theta: 'Θ',
        kappa: 'κ', lambda: 'λ', Lambda: 'Λ', mu: 'μ', nu: 'ν',
        xi: 'ξ', Xi: 'Ξ', pi: 'π', Pi: 'Π', rho: 'ρ',
        sigma: 'σ', Sigma: 'Σ', tau: 'τ', upsilon: 'υ', Upsilon: 'Υ',
        phi: 'φ', Phi: 'Φ', varphi: 'ϕ', chi: 'χ', psi: 'ψ',
        Psi: 'Ψ', Gamma: 'Γ', Beta: 'Β', Alpha: 'Α', Mu: 'Μ',
        Rho: 'Ρ', Tau: 'Τ', omega: 'ω', Omega: 'Ω', zeta: 'ζ', eta: 'η'
    };

    // Mathematical symbol mappings
    const symbolMap = {
        infty: '∞', pm: '±', mp: '∓', times: '×', div: '÷',
        ast: '∗', star: '⋆', bullet: '•', circ: '∘', cdot: '·',
        to: '→', rightarrow: '→', longrightarrow: '→',
        leftarrow: '←', longleftarrow: '←', leftrightarrow: '↔',
        Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔',
        uparrow: '↑', downarrow: '↓', mapsto: '↦',
        geq: '≥', geqslant: '≥', leq: '≤', leqslant: '≤',
        neq: '≠', approx: '≈', equiv: '≡', sim: '∼', simeq: '≃', cong: '≅',
        propto: '∝', 'in': '∈', notin: '∉', ni: '∋',
        subset: '⊂', supset: '⊃', subseteq: '⊆', supseteq: '⊇',
        cup: '∪', cap: '∩', setminus: '∖',
        forall: '∀', exists: '∃', land: '∧', lor: '∨', neg: '¬',
        cdots: '⋯', ldots: '…', vdots: '⋮', ddots: '⋱',
        angle: '∠', perp: '⊥', parallel: '∥', triangle: '△',
        langle: '⟨', rangle: '⟩', lfloor: '⌊', rfloor: '⌋',
        lceil: '⌈', rceil: '⌉', emptyset: '∅', prime: '′'
    };

    // Standard mathematical function names
    const standardFunctions = [
        'sin', 'cos', 'tan', 'csc', 'sec', 'cot',
        'log', 'ln', 'exp', 'max', 'min', 'mod'
    ];
    
    // Expose to global scope
    window.SymbolMaps = {
        greekMap,
        symbolMap,
        standardFunctions
    };
})();

