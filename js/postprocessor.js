/**
 * PostProcessor - Refines and polishes UnicodeMath output
 * 
 * This module applies various post-processing rules to improve the
 * quality and correctness of the generated UnicodeMath expressions.
 * 
 * REFACTORED (Issue #6): More reliable handling of integrals and other expressions
 */

/**
 * Post-processing rules for specific expression patterns
 */
const rules = [
    {
        name: 'integral-formatting',
        description: 'Format integrals with proper spacing and lenticular brackets',
        // Match: ∫ (optional subscript) ^ (superscript) integrand d(variable)
        // Handles both parenthesized and non-parenthesized subscripts/superscripts
        pattern: /∫(_(?:\([^)]+\)|[^\s^]+))?\^((?:\([^)]+\)|[^\s]+))\s*([^d]*?)\s*d([a-zA-Z])/gi,
        replace: (match, sub, sup, integrand, variable) => {
            const lower = sub || '';
            integrand = integrand.trim();
            // Only wrap non-empty integrands
            if (integrand) {
                return `∫${lower}^${sup} 〖${integrand}〗 d${variable}`;
            } else {
                return `∫${lower}^${sup} d${variable}`;
            }
        }
    },
    {
        name: 'integral-no-limits',
        description: 'Format indefinite integrals (no limits)',
        pattern: /∫\s+([^d]+?)\s*d([a-zA-Z])/gi,
        replace: (match, integrand, variable) => {
            integrand = integrand.trim();
            // Only wrap if not already wrapped
            if (!integrand.startsWith('〖')) {
                return `∫ 〖${integrand}〗 d${variable}`;
            }
            return match;
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
        name: 'sum-spacing',
        description: 'Add space after summation with limits',
        pattern: /(∑_\([^)]+\)\^(\([^)]+\)|\d+))([a-zA-Z])/gi,
        replace: '$1 $3'
    },
    {
        name: 'product-spacing',
        description: 'Add space after product with limits',
        pattern: /(∏_\([^)]+\)\^(\([^)]+\)|\d+))([a-zA-Z])/gi,
        replace: '$1 $3'
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
    }
];

/**
 * Apply all post-processing rules to the text
 * @param {string} text - The UnicodeMath text to process
 * @returns {string} Processed text
 */
export function postProcess(text) {
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
export function addRule(rule) {
    if (!rule.name || !rule.pattern || !rule.replace) {
        throw new Error('Rule must have name, pattern, and replace properties');
    }
    rules.push(rule);
}

/**
 * Get all registered rules (for debugging/inspection)
 * @returns {Array} Array of rule objects
 */
export function getRules() {
    return [...rules]; // Return a copy to prevent external modification
}

/**
 * Remove a rule by name
 * @param {string} name - Name of the rule to remove
 * @returns {boolean} True if rule was found and removed
 */
export function removeRule(name) {
    const index = rules.findIndex(r => r.name === name);
    if (index !== -1) {
        rules.splice(index, 1);
        return true;
    }
    return false;
}

