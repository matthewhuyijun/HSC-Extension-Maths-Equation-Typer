/**
 * PostProcessor - Refines and polishes UnicodeMath output
 * 
 * This module applies various post-processing rules to improve the
 * quality and correctness of the generated UnicodeMath expressions.
 * 
 * REFACTORED (Issue #6): More reliable handling of integrals and other expressions
 * Refactored for file:// protocol compatibility (no ES6 modules)
 */

(function() {
    'use strict';
    
    /**
     * Helper function to strip parentheses from bounds
     */
    function stripParens(input = '') {
    const trimmed = input.trim();
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        return trimmed.slice(1, -1).trim();
    }
    return trimmed;
}

/**
 * Helper function to ensure parentheses around bounds
 */
function ensureParens(token = '') {
    const inner = stripParens(token);
    return inner ? `(${inner})` : '()';
}

/**
 * Helper function to strip box markers
 */
function stripBox(segment = '') {
    return segment.replace(/▒/g, '').replace(/[〖〗]/g, '').trim();
}

/**
 * Helper function to wrap content in lenticular brackets
 */
function wrapBox(segment = '') {
    return `〖${segment}〗`;
}

    /**
     * Post-processing rules for specific expression patterns
     */
    const rules = [
    {
        name: 'double-space-around-text-words',
        description: 'Add double spaces around text words for better Word spacing',
        pattern: / ([a-zA-Z]{2,}) /g,
        replace: '  $1  '
    },
    {
        name: 'remove-other-double-spaces',
        description: 'Remove double spaces except around text words',
        pattern: /([^a-zA-Z]) {2,}([^a-zA-Z])/g,
        replace: '$1 $2'
    },
    {
        name: 'remove-commas-in-brackets',
        description: 'Remove commas inside square brackets (LaTeX optional parameter artifacts)',
        pattern: /\[([^\]]+?),\s*\]/g,
        replace: '[$1]'
    },
    {
        name: 'remove-brackets-after-integral-symbol',
        description: 'Remove square brackets after integral symbol',
        pattern: /▒\s*\[([^\]]+?)\]/g,
        replace: '▒$1'
    },
    {
        name: 'remove-brackets-before-differential',
        description: 'Remove square brackets before differential',
        pattern: /\[([^\]]+?)\]\s+(d[a-zA-Z])/g,
        replace: '$1 $2'
    },
    {
        name: 'clean-trailing-commas',
        description: 'Remove trailing commas before spaces or differentials',
        pattern: /,\s*(d[a-zA-Z])/g,
        replace: ' $1'
    },
    {
        name: 'integral-with-limits-formatting',
        description: 'Format definite integrals with ▒ and lenticular brackets: ∫_(b)^(a)▒〖f(x)〗 dx',
        // Match: ∫ with limits followed by integrand and differential
        // Use greedy match and look for differential at the END (with optional whitespace before it)
        pattern: /∫_(\([^)]+\)|[^\s^]+)\^(\([^)]+\)|[^\s]+?)\s*▒?\s*:?\s*(.+?)\s+d([a-zA-Z])(?=\s|$)/g,
        replace: (match, lower, upper, integrand, variable) => {
            const lowerClean = stripParens(lower.trim());
            const upperClean = stripParens(upper.trim());
            let integrandClean = integrand.trim()
                .replace(/^▒+/, '')
                .replace(/▒+$/, '')
                .replace(/^:+/, '')
                .replace(/^〖/, '')
                .replace(/〗$/, '')
                .replace(/^\[+/, '')  // Remove all leading brackets
                .replace(/\]+$/, '')  // Remove all trailing brackets
                .replace(/,+\s*$/, '') // Remove trailing commas
                .replace(/\[([^\]]+),\]/g, '$1'); // Remove [content,] patterns
            const diff = variable.trim();
            
            if (!integrandClean) return match; // Don't transform if no integrand
            
            // Wrap bounds in parentheses like sum/prod
            return `∫_(${lowerClean})^(${upperClean})▒〖${integrandClean}〗 d${diff}`;
        }
    },
    {
        name: 'integral-indefinite-formatting',
        description: 'Format indefinite integrals: ∫▒〖f(x)〗 dx',
        // Match: ∫ without limits (no _ after ∫) followed by integrand and differential
        pattern: /∫(?!_)\s*▒?\s*:?\s*(.+?)\s*d\s*([a-zA-Z])/g,
        replace: (match, integrand, variable) => {
            let integrandClean = integrand.trim()
                .replace(/^▒+/, '')
                .replace(/▒+$/, '')
                .replace(/^:+/, '')
                .replace(/^〖/, '')
                .replace(/〗$/, '')
                .replace(/^\[+/, '')  // Remove all leading brackets
                .replace(/\]+$/, '')  // Remove all trailing brackets
                .replace(/,+\s*$/, '') // Remove trailing commas
                .replace(/\[([^\]]+),\]/g, '$1'); // Remove [content,] patterns
            const diff = variable.trim();
            
            if (!integrandClean) return match; // Don't transform if no integrand
            
            return `∫▒〖${integrandClean}〗 d${diff}`;
        }
    },
    {
        name: 'sum-formatting',
        description: 'Format summation with ▒: ∑_(n=3)^4▒n or ∑_(p∈ℙ)▒(1/p)',
        // Match: ∑ followed by subscript, optional superscript, and term
        pattern: /∑_(\([^)]+\)|[^\s^]+)(?:\^(\([^)]+\)|\d+|[a-zA-Z]))?\s*▒?\s*:?\s*([^∑∏]+?)(?=\s*(?:[∑∏]|$))/g,
        replace: (match, lower, upper, term) => {
            const lowerClean = ensureParens(stripParens(lower.trim()));
            const termClean = term.trim().replace(/^▒+/, '').replace(/▒+$/, '').replace(/^:+/, '');
            
            if (!termClean) return match; // Don't transform if no term
            
            if (upper) {
                const upperClean = stripParens(upper.trim());
                return `∑_${lowerClean}^${upperClean}▒${termClean}`;
            } else {
                return `∑_${lowerClean}▒${termClean}`;
            }
        }
    },
    {
        name: 'product-formatting',
        description: 'Format product with ▒: ∏_(n=3)^5▒n or ∏_(p∈ℙ)▒(1-1/p)',
        // Match: ∏ followed by subscript, optional superscript, and term
        pattern: /∏_(\([^)]+\)|[^\s^]+)(?:\^(\([^)]+\)|\d+|[a-zA-Z]))?\s*▒?\s*:?\s*([^∑∏]+?)(?=\s*(?:[∑∏]|$))/g,
        replace: (match, lower, upper, term) => {
            const lowerClean = ensureParens(stripParens(lower.trim()));
            const termClean = term.trim().replace(/^▒+/, '').replace(/▒+$/, '').replace(/^:+/, '');
            
            if (!termClean) return match; // Don't transform if no term
            
            if (upper) {
                const upperClean = stripParens(upper.trim());
                return `∏_${lowerClean}^${upperClean}▒${termClean}`;
            } else {
                return `∏_${lowerClean}▒${termClean}`;
            }
        }
    },
    {
        name: 'delimiter-spacing',
        description: 'Normalize spacing around delimiters',
        pattern: /├\s*/g,
        replace: '├ '
    },
    {
        name: 'right-pipe-spacing',
        description: 'Remove extra spacing before right pipe delimiter',
        pattern: /\s*┤\|/g,
        replace: '┤|'
    },
    {
        name: 'projection-spacing',
        description: 'Add proper spacing in projection notation',
        pattern: /proj_([A-Z])┬∼\s*([A-Z])┬∼/g,
        replace: 'proj_$1┬∼   $2┬∼'
    },
    {
        name: 'nested-parentheses',
        description: 'Simplify unnecessary nested parentheses in simple cases',
        pattern: /\(\(([a-zA-Z0-9])\)\)/g,
        replace: '($1)'
    },
    {
        name: 'limit-formatting',
        description: 'Format limit expressions: lim┬(h→0) expression',
        // Match: lim with subscript/superscript followed by ▒ and the expression up to = or end
        pattern: /lim(_\([^)]+\)|_[^\s^]+)?(\^\([^)]+\)|\^[^\s]+)?\s*▒?\s*(.+?)(?=\s*=|$)/g,
        replace: (match, sub, sup, expression) => {
            const subPart = sub || '';
            const supPart = sup || '';
            
            // Extract the subscript content (remove _ and outer parentheses if present)
            let subscript = '';
            if (subPart) {
                subscript = subPart.replace(/^_\(/, '').replace(/\)$/, '').replace(/^_/, '');
            }
            
            const exprClean = expression.trim()
                .replace(/^▒+/, '')
                .replace(/▒+$/, '')
                .replace(/^〖/, '')
                .replace(/〗$/, '');
            
            if (!exprClean) return match; // Don't transform if no expression
            
            // Use ┬ format with space and bracket: lim┬(subscript) 〖expression〗
            if (subscript) {
                return `lim┬(${subscript}) 〖${exprClean}〗`;
            }
            return `lim 〖${exprClean}〗`; // No subscript case
        }
    }
];

    /**
     * Apply all post-processing rules to the text
     * @param {string} text - The UnicodeMath text to process
     * @returns {string} Processed text
     */
    function postProcess(text) {
        let result = text;
        
        // Apply each rule in sequence
        for (const rule of rules) {
            try {
                result = result.replace(rule.pattern, rule.replace);
            } catch (error) {
                console.warn(`Post-processing rule '${rule.name}' failed:`, error);
                // Continue with other rules even if one fails
            }
        }
        
        return result;
    }

    /**
     * Add a custom post-processing rule
     * @param {Object} rule - Rule object with name, description, pattern, and replace
     */
    function addRule(rule) {
        if (!rule.name || !rule.pattern || !rule.replace) {
            throw new Error('Rule must have name, pattern, and replace properties');
        }
        rules.push(rule);
    }

    /**
     * Get all registered rules (for debugging/inspection)
     * @returns {Array} Array of rule objects
     */
    function getRules() {
        return [...rules]; // Return a copy to prevent external modification
    }

    /**
     * Remove a rule by name
     * @param {string} name - Name of the rule to remove
     * @returns {boolean} True if rule was found and removed
     */
    function removeRule(name) {
        const index = rules.findIndex(r => r.name === name);
        if (index !== -1) {
            rules.splice(index, 1);
            return true;
        }
        return false;
    }
    
    // Expose to global scope
    window.PostProcessor = {
        postProcess,
        addRule,
        getRules,
        removeRule
    };
})();

