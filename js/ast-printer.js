/**
 * AST Printer - Converts Abstract Syntax Tree to UnicodeMath
 * 
 * This module traverses an AST and converts it to UnicodeMath format
 * suitable for Microsoft Word equations.
 * 
 * Refactored for file:// protocol compatibility (no ES6 modules)
 */

(function() {
    'use strict';
    
    // Get dependencies from global scope
    const { greekMap, symbolMap, standardFunctions } = window.SymbolMaps;
    
    /**
     * Check if a command is a trigonometric function
     * @param {string} cmdName - The command name (without backslash)
     * @returns {boolean} True if it's a trig function
     */
    function isTrigFunction(cmdName) {
    const trigFunctions = [
        'sin', 'cos', 'tan', 'csc', 'sec', 'cot',
        'sinh', 'cosh', 'tanh', 'csch', 'sech', 'coth',
        'arcsin', 'arccos', 'arctan', 'arccsc', 'arcsec', 'arccot'
    ];
    return trigFunctions.includes(cmdName);
}

/**
 * Print script argument (subscript or superscript)
 * @param {Object} arg - The AST node for the script
 * @param {boolean} isSup - Whether this is a superscript (affects parenthesization)
 * @param {boolean} forceParens - Force parentheses even for single characters
 * @returns {string} Formatted script string
 */
function printScriptArg(arg, isSup = false, forceParens = false) {
    if (!arg) return '';
    const content = print(arg).trim();
    if (isSup || forceParens) {
        return `(${content})`;
    }
    if (content.includes('┬∼')) return content;
    if (content.length === 1 && /[a-zA-Z0-9]/.test(content)) return content;
    return `(${content})`;
}

    /**
     * Convert AST to UnicodeMath string
     * @param {Object|Array} ast - The AST node or array of nodes
     * @param {Object} context - Contextual information for printing
     * @returns {string} UnicodeMath representation
     */
    function print(ast, context = {}) {
    if (Array.isArray(ast)) {
        const result = [];
        for (let i = 0; i < ast.length; i++) {
            const node = ast[i];
            const prevNode = i > 0 ? ast[i-1] : null;
            
            // Check if previous node is a trig function and current is a group
            if (prevNode && prevNode.type === 'command' && 
                isTrigFunction(prevNode.value.slice(1)) && 
                node.type === 'group') {
                // Add function application character before the argument
                const content = print(node.children, context);
                // Use function application character (U+2061) for proper rendering
                result.push('\u2061' + content);
                continue;
            }
            
            const printed = print(node, context);
            
            // Add space between adjacent letters (unless handled by trig function above)
            if (i > 0 && printed && result.length > 0) {
                const prev = result[result.length - 1];
                const curr = printed;
                const prevEndsWithLetter = /[a-zA-Zα-ω]$/.test(prev);
                const currStartsWithLetter = /^[a-zA-Z]/.test(curr);
                if (prevEndsWithLetter && currStartsWithLetter) {
                    result.push(' ');
                }
            }
            result.push(printed);
        }
        return result.join('');
    }

    if (!ast || typeof ast !== 'object') return '';

    const type = ast.type;

    if (type === 'text') {
        let result = ast.value || '';
        if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
        if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
        return result;
    }

    if (type === 'space') {
        // Convert LaTeX space commands to regular space for Word
        // Use ?? instead of || to preserve empty strings from \!
        return ast.value ?? '\u0020';
    }

    // 添加 \text{} 命令的打印处理
    if (type === 'text_command') {
        // 提取文本内容并在两侧添加单空格（LaTeX中）
        const content = print(ast.content);
        return ' ' + content + ' ';
    }

    if (type === 'command') {
        const cmd = ast.value;
        const cmdName = cmd.slice(1);
        
        // Handle placeholder
        if (cmdName === 'placeholder') {
            return '▒';
        }
        
        // Handle limit operator specially (no space after subscript)
        if (cmdName === 'lim') {
            let result = 'lim';
            if (ast.sub) result += '_' + printScriptArg(ast.sub);
            if (ast.sup) result += '^' + printScriptArg(ast.sup, true);
            result += '▒';  // Add placeholder after limit
            return result;
        }
        
        if (greekMap[cmdName]) {
            let result = greekMap[cmdName];
            if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
            if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
            return result;
        }
        
        if (symbolMap[cmdName]) {
            let result = symbolMap[cmdName];
            if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
            if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
            return result;
        }
        
        if (standardFunctions.includes(cmdName)) {
            let result = cmdName + ' ';  // Add space after function name
            if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
            if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
            return result;
        }
        
        if (cmdName === 'left' || cmdName === 'right') return '';
        if (cmdName === '\\') return '';
        
        // Handle \: as a space command (medium math space)
        if (cmdName === ':') return ' ';
        
        let result = cmdName;
        if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
        if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
        return result;
    }

    if (type === 'group') {
        return print(ast.children, context);
    }

    if (type === 'bracket') {
        return print(ast.children, context);
    }

    if (type === 'frac') {
        const num = print(ast.num);
        const den = print(ast.den);
        return `(${num})/(${den}) `;
    }

    if (type === 'sqrt') {
        if (ast.index) {
            const idx = print(ast.index);
            const rad = print(ast.radicand);
            return `√(${idx}&${rad}) `;
        } else {
            const rad = print(ast.radicand);
            return `√(${rad}) `;
        }
    }

    if (type === 'sum' || type === 'prod' || type === 'int') {
        const sym = type === 'sum' ? '∑' : type === 'prod' ? '∏' : '∫';
        let result = sym;
        // Always use parentheses for both sub and sup in sum/prod/int
        if (ast.sub) result += '_' + printScriptArg(ast.sub, false, true);
        if (ast.sup) result += '^' + printScriptArg(ast.sup, false, true);
        result += '▒';  // Add placeholder after limits for the integrand/summand
        return result;
    }

    if (type === 'operatorname') {
        let result = print(ast.name);
        if (ast.sub) {
            const subContent = print(ast.sub);
            result += '_' + (subContent.includes('┬∼') ? subContent : printScriptArg(ast.sub)) + ' ';
        }
        if (ast.sup) {
            result += '^' + printScriptArg(ast.sup, true) + ' ';
        }
        return result;
    }

    if (type === 'underset') {
        const under = print(ast.under);
        const base = print(ast.base);
        if (under === '∼' || under === 'sim') {
            return `${base}┬∼`;
        }
        return base;
    }

    if (type === 'overrightarrow') {
        const content = print(ast.content);
        return `(${content})⃗`;
    }

    if (type === 'vec') {
        const content = print(ast.content);
        let result = `${content}\u20D7`;
        if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
        if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
        return result;
    }

    if (type === 'dotaccent') {
        const content = print(ast.content);
        let result = `${content}\u0307`;
        if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
        if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
        return result;
    }

    if (type === 'ddotaccent') {
        const content = print(ast.content);
        let result = `${content}\u0308`;
        if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
        if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
        return result;
    }

    if (type === 'overline') {
        const content = print(ast.content);
        let result = `${content}\u0305`;
        if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
        if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
        return result;
    }

    if (type === 'mathbb') {
        const content = print(ast.content).trim();
        // Map common blackboard bold letters to Unicode
        const mathbbMap = {
            'C': '\u2102', // ℂ Complex numbers
            'N': '\u2115', // ℕ Natural numbers
            'Q': '\u211A', // ℚ Rational numbers
            'R': '\u211D', // ℝ Real numbers
            'Z': '\u2124', // ℤ Integers
            'P': '\u2119', // ℙ Projective space / Primes
            'H': '\u210D', // ℍ Quaternions
        };
        let result = mathbbMap[content] || content;
        if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
        if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
        return result;
    }

    if (type === 'trigfunc') {
        const funcName = ast.name;
        const argContent = ast.arg ? print(ast.arg) : '';
        // Convert braces to lenticular brackets for Word
        let result = argContent ? `${funcName}〖${argContent}〗` : funcName;
        if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
        if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
        return result;
    }

    if (type === 'pmatrix') {
        const rows = [];
        let currentRow = '';
        for (const child of ast.children) {
            if (child.type === 'command' && child.value === '\\\\') {
                if (currentRow) rows.push(currentRow.trim());
                currentRow = '';
            } else {
                currentRow += print(child);
            }
        }
        if (currentRow.trim()) rows.push(currentRow.trim());
        return rows.length ? `(■(${rows.join('@')}))` : '(■())';
    }

    if (type === 'bmatrix') {
        const rows = [];
        let currentRow = '';
        for (const child of ast.children) {
            if (child.type === 'command' && child.value === '\\\\') {
                if (currentRow) rows.push(currentRow.trim());
                currentRow = '';
            } else {
                currentRow += print(child);
            }
        }
        if (currentRow.trim()) rows.push(currentRow.trim());
        return rows.length ? `[■(${rows.join('@')})]` : '[■()]';
    }

    if (type === 'cases') {
        const rows = [];
        for (const child of ast.children) {
            if (child.type === 'command' && child.value === '\\\\') {
                // Row separator - do nothing, we handle in else
            } else if (child.type === 'text' && child.value === '&') {
                // Column separator - do nothing for cases (we handle differently)
            } else {
                // For cases environment, we need to process each row
                // The format is: value & condition
                let rowContent = '';
                let parts = [];
                let currentPart = '';
                
                // We need to look at the full row structure
                // This is tricky because the AST is flattened
                // Let's build the row content and then split by &
            }
        }
        
        // Process children to build rows properly
        let currentRow = [];
        let currentPart = '';
        
        for (const child of ast.children) {
            if (child.type === 'command' && child.value === '\\\\') {
                if (currentPart) currentRow.push(currentPart.trim());
                if (currentRow.length > 0) {
                    // Format: value, &condition becomes: value&condition
                    rows.push(currentRow.join('&'));
                }
                currentRow = [];
                currentPart = '';
            } else if (child.type === 'text' && child.value === '&') {
                if (currentPart) currentRow.push(currentPart.trim());
                currentPart = '';
            } else {
                currentPart += print(child);
            }
        }
        // Handle last row
        if (currentPart) currentRow.push(currentPart.trim());
        if (currentRow.length > 0) {
            rows.push(currentRow.join('&'));
        }
        
        // UnicodeMath format for piecewise: {█(row1@row2@row3)┤
        return rows.length ? `{█(${rows.join('@')})┤` : '{█()┤';
    }

    if (type === 'leftdelim' || type === 'rightdelim') {
        return '';
    }

    if (type === 'leftdot') {
        return '├';
    }

    if (type === 'rightpipe') {
        let result = '┤|';
        if (ast.sub) result += printScriptArg(ast.sub) + ' ';
        if (ast.sup) result += '^' + printScriptArg(ast.sup, false) + ' ';
        return result;
    }

    if (type === 'pipe') {
        return '|';
    }

    if (type === 'dot') {
        return '';
    }

    return '';
    }
    
    // Expose to global scope
    window.ASTPrinter = {
        print
    };
})();

