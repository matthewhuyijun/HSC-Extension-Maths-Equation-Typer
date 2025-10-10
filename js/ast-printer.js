/**
 * AST Printer - Converts Abstract Syntax Tree to UnicodeMath
 * 
 * This module traverses an AST and converts it to UnicodeMath format
 * suitable for Microsoft Word equations.
 */

import { greekMap, symbolMap, standardFunctions } from './symbol-maps.js';

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
export function print(ast, context = {}) {
    if (Array.isArray(ast)) {
        const parts = ast.map(node => print(node, context));
        const result = [];
        for (let i = 0; i < parts.length; i++) {
            if (i > 0 && parts[i] && parts[i-1]) {
                const prev = parts[i-1];
                const curr = parts[i];
                const prevEndsWithLetter = /[a-zA-Zα-ω]$/.test(prev);
                const currStartsWithLetter = /^[a-zA-Z]/.test(curr);
                if (prevEndsWithLetter && currStartsWithLetter) {
                    result.push(' ');
                }
            }
            result.push(parts[i]);
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

    if (type === 'command') {
        const cmd = ast.value;
        const cmdName = cmd.slice(1);
        
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
            let result = cmdName;
            if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
            if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
            return result;
        }
        
        if (cmdName === 'left' || cmdName === 'right') return '';
        if (cmdName === '\\') return '';
        
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
        return `(${num})/(${den})`;
    }

    if (type === 'sqrt') {
        if (ast.index) {
            const idx = print(ast.index);
            const rad = print(ast.radicand);
            return `√(${idx}&${rad})`;
        } else {
            const rad = print(ast.radicand);
            return `√(${rad})`;
        }
    }

    if (type === 'sum' || type === 'prod' || type === 'int') {
        const sym = type === 'sum' ? '∑' : type === 'prod' ? '∏' : '∫';
        let result = sym;
        // Always use parentheses for both sub and sup in sum/prod/int
        if (ast.sub) result += '_' + printScriptArg(ast.sub, false, true);
        if (ast.sup) result += '^' + printScriptArg(ast.sup, false, true);
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

