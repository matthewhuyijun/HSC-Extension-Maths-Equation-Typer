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
    
    // Force parentheses if explicitly requested (check this FIRST)
    if (forceParens) {
        return `(${content})`;
    }
    
    // Special case: single character doesn't need parentheses (even for superscripts)
    if (content.length === 1 && /[a-zA-Z0-9]/.test(content)) return content;
    
    // Special case for ┬∼ notation
    if (content.includes('┬∼')) return content;
    
    // For superscripts, add parentheses for multi-character content
    if (isSup && content.length > 1) {
        return `(${content})`;
    }
    
    // For subscripts, only add parentheses for complex content
    if (!isSup && content.length > 1) {
    return `(${content})`;
}
    
    return content;
}

    /**
     * Check if an AST node represents a "simple" expression that doesn't need parentheses
     * Simple expressions: single letters, numbers, symbols, or differential forms like dv, dt, dx, ∂u, ∂t
     * @param {Object|Array} ast - The AST node to check
     * @returns {boolean} True if the expression is simple
     */
    function isSimple(ast) {
        if (!ast) return true;
        
        // Group node: check its children recursively
        if (ast.type === 'group') {
            return isSimple(ast.children);
        }
        
        // Single text node (with or without subscripts/superscripts is OK if it's just one or two chars)
        if (ast.type === 'text') {
            const value = ast.value || '';
            if (!value) return true;
            // Simple patterns: single char, two chars, or differential like "dv", "dt", "dx"
            // Even with superscripts/subscripts, a single letter is still simple (e.g., v^2, x_1)
            if (value.length <= 2) return true;
            if (/^d[a-zA-Z]$/.test(value)) return true;
            return false;
        }
        
        // Command node (like \partial): these are simple
        if (ast.type === 'command') {
            return !ast.sub && !ast.sup; // Simple if no sub/superscripts
        }
        
        // Array of nodes: check if all nodes are simple
        if (Array.isArray(ast)) {
            if (ast.length === 0) return true;
            
            // If it's a single node in an array, check that node
            if (ast.length === 1) {
                return isSimple(ast[0]);
            }
            
            // Multiple nodes: check if it's like ∂u, ∂t, ∂x (command + single char)
            if (ast.length === 2) {
                const first = ast[0];
                const second = ast[1];
                // Pattern: \partial u (command followed by single-char text)
                if (first.type === 'command' && !first.sub && !first.sup &&
                    second.type === 'text' && second.value && second.value.length === 1 && 
                    !second.sub && !second.sup) {
                    return true;
                }
            }
            
            // Handle ∂^2 u (command with superscript + single char)
            if (ast.length === 2) {
                const first = ast[0];
                const second = ast[1];
                // Pattern: \partial^2 u (command with sup + single-char text)
                if (first.type === 'command' && first.sup && !first.sub &&
                    second.type === 'text' && second.value && second.value.length <= 2 && 
                    !second.sub && !second.sup) {
                    return true;
                }
            }
            
            // Multiple nodes: check if all are single-char text nodes (like "d", "v" as separate nodes)
            if (ast.length <= 3) {
                const allSimpleChars = ast.every(node => 
                    node.type === 'text' && 
                    node.value && 
                    node.value.length === 1 && 
                    !node.sub && 
                    !node.sup
                );
                if (allSimpleChars) {
                    const text = ast.map(n => n.value).join('');
                    // Allow: single letters, numbers, or d+letter differential forms
                    if (/^[a-zA-Z0-9]{1,2}$/.test(text) || /^d[a-zA-Z]$/.test(text)) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        return false;
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
            const nextNode = i + 1 < ast.length ? ast[i + 1] : null;
            
            // Skip space nodes around equals signs
            if (node.type === 'space') {
                // Check if previous or next node is an equals sign
                const prevIsEquals = prevNode && prevNode.type === 'text' && prevNode.value === '=';
                const nextIsEquals = nextNode && nextNode.type === 'text' && nextNode.value === '=';
                if (prevIsEquals || nextIsEquals) {
                    continue; // Skip this space
                }
            }
            
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
            
            // Add space between adjacent letters (unless already handled)
            // Note: Allow spacing logic even if printed is empty (e.g., for leftdelim nodes)
            if (i > 0 && result.length > 0) {
                const prev = result[result.length - 1];
                const curr = printed;
                // Don't add space if prev ends with space
                const prevEndsWithSpace = prev.endsWith(' ');
                const prevEndsWithLetter = /[a-zA-Zα-ω]$/.test(prev);
                const prevEndsWithClosingParen = /\)$/.test(prev);
                const currStartsWithLetter = /^[a-zA-Z]/.test(curr);
                const currStartsWithOpenParen = /^\(/.test(curr);
                // Check if current AST node is an opening parenthesis (text node with '(')
                const currIsOpenParen = node.type === 'text' && node.value === '(';
                // Check if current is a standard function (has space after function name)
                const currIsFunction = /^(sin|cos|tan|cot|sec|csc|ln|log|exp|lim|max|min|sup|inf|det|dim|ker|arg|sinh|cosh|tanh|coth|arcsin|arccos|arctan|arccot|arcsec|arccsc) /.test(curr);
                // Don't add space around equals signs
                const prevEndsWithEquals = prev.endsWith('=');
                const currStartsWithEquals = curr.startsWith('=');
                
                // Check if previous node was a fraction and current node is also a fraction
                // Two consecutive fractions should have double space
                const prevNodeWasFrac = prevNode && prevNode.type === 'frac';
                const currNodeIsFrac = node && node.type === 'frac';
                
                // Get next node for lookahead checks (用于前瞻检查)
                const nextNode = (i + 1 < ast.length) ? ast[i + 1] : null;
                
                // Also check for pattern: frac ... = frac where there's another frac before
                // This handles cases like: dv/dx  dx/dt  =v  dv/dx  =d/dx
                // But only if the current text is JUST an equals sign (not "=v" or "a=")
                let fracEqualsFragWithPriorFrac = false;
                if (prevNodeWasFrac && node.type === 'text' && node.value === '=' && 
                    i + 1 < ast.length && ast[i + 1].type === 'frac') {
                    // Pattern: frac (standalone =) frac
                    // Check if there's another frac within the previous 3 nodes
                    for (let j = i - 2; j >= Math.max(0, i - 4); j--) {
                        if (ast[j] && ast[j].type === 'frac') {
                            fracEqualsFragWithPriorFrac = true;
                            if (window.DEBUG_AST) console.log(`  Found prior frac at [${j}], adding double space before standalone equals`);
                            break;
                        }
                    }
                }
                
                if (prevNodeWasFrac && currNodeIsFrac) {
                    // Consecutive fractions: add double space
                    if (window.DEBUG_AST) console.log('  Consecutive fractions: adding double space');
                    result.push('  ');
                } else if (fracEqualsFragWithPriorFrac) {
                    // frac = frac with prior frac: add double space
                    result.push('  ');
                } else {
                    // Check if there was a negative space (\!) among recent nodes
                    // Look back at previous nodes (skip empty-printing nodes like leftdelim, rightdelim)
                    let hasRecentNegativeSpace = false;
                    for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
                        const checkNode = ast[j];
                        if (window.DEBUG_AST) {
                            console.log(`  Checking node [${j}]: type='${checkNode?.type}', value='${checkNode?.value || ''}'`);
                        }
                        if (checkNode && checkNode.type === 'space' && checkNode.value === '') {
                            hasRecentNegativeSpace = true;
                            if (window.DEBUG_AST) console.log('    → Found negative space!');
                            break;
                        }
                        // Stop if we hit something that produces meaningful output
                        if (checkNode && checkNode.type !== 'leftdelim' && checkNode.type !== 'rightdelim' && checkNode.type !== 'space') {
                            if (window.DEBUG_AST) console.log('    → Stopping, hit meaningful node');
                            break;
                        }
                    }
                    
                    // Special handling for negative space followed by fraction or letter or open paren
                    // \! produces empty string, but we want a single space after fractions when \! is present
                    // We need to check the actual previous content (before \!), not the \! itself
                    if (hasRecentNegativeSpace) {
                        // Find the last non-empty entry in result
                        let lastRealContent = '';
                        for (let j = result.length - 1; j >= 0; j--) {
                            if (result[j] && result[j].length > 0) {
                                lastRealContent = result[j];
                                break;
                            }
                        }
                        const lastEndsWithClosingParen = /\)$/.test(lastRealContent);
                        const lastIsFraction = lastRealContent.includes('/');  // Check if it's a fraction
                        
                        if (window.DEBUG_AST) {
                            console.log(`  hasRecentNegativeSpace=true`);
                            console.log(`  lastRealContent='${lastRealContent}'`);
                            console.log(`  lastEndsWithClosingParen=${lastEndsWithClosingParen}, lastIsFraction=${lastIsFraction}`);
                            console.log(`  curr='${curr}', currStartsWithLetter=${currStartsWithLetter}, currStartsWithOpenParen=${currStartsWithOpenParen}, currIsOpenParen=${currIsOpenParen}, curr.includes('/')=${curr.includes('/')}`);
                        }
                        
                        if ((lastEndsWithClosingParen || lastIsFraction) && 
                            (currStartsWithLetter || currStartsWithOpenParen || currIsOpenParen || curr.includes('/'))) {
                            if (window.DEBUG_AST) console.log('    → Adding single space for \\!');
                            result.push(' ');  // Single space: \! acts as explicit spacing marker
                        }
                    } else if (!prevEndsWithSpace && !prevEndsWithEquals && !currStartsWithEquals) {
                        // Check if previous node was a fraction
                        const prevIsFraction = prevNode && prevNode.type === 'frac';
                        
                        // Special case: fraction followed by function (e.g., 1/k ln)
                        // This needs to be checked BEFORE the !currIsFunction check
                        if (prevIsFraction && currIsFunction) {
                            if (window.DEBUG_AST) {
                                console.log('  ✓ prevIsFraction && currIsFunction (e.g., 1/k ln)');
                            }
                            result.push(' ');
                        } else if (!currIsFunction) {
                            // Add space when:
                            // 1. Previous ends with letter and current starts with letter (e.g., "ab" -> "a b")
                            // 2. Previous ends with ) and current starts with letter (e.g., "(1)/(2)e" -> "(1)/(2) e")
                            // 3. Previous ends with ) and current starts with ( (e.g., "(a)/(b)(c)/(d)" -> "(a)/(b) (c)/(d)")
                            // 4. Previous is a fraction (contains /) and current starts with ( (e.g., "d/dx(x^2)" -> "d/dx (x^2)")
                            // 5. Previous ends with superscript (e.g. "^2") and current starts with letter (e.g., "∂^2 u" -> "∂^2 u")
                            // But NOT if current is a function (functions already have trailing space)
                            // And NOT around equals signs
                            const prevEndsWithSuperscript = /\^[0-9]\s*$/.test(prev);
                            // Check if current node is a group (which typically starts with paren)
                            const currIsGroup = node && node.type === 'group';
                            // Check if current node is leftdelim (which precedes opening delimiter)
                            const currIsLeftDelim = node && node.type === 'leftdelim';
                            // Check if next node is an opening paren (to handle \left( case)
                            const nextIsOpenParen = nextNode && nextNode.type === 'text' && nextNode.value === '(';
                            
                            if (window.DEBUG_AST && (prevIsFraction || currIsGroup || currIsLeftDelim)) {
                                console.log(`  Node checks: prevNode.type=${prevNode?.type}, node.type=${node?.type}, nextNode.type=${nextNode?.type}, nextNode.value='${nextNode?.value || ''}'`);
                                console.log(`  prevIsFraction=${prevIsFraction}, currIsGroup=${currIsGroup}, currIsLeftDelim=${currIsLeftDelim}, nextIsOpenParen=${nextIsOpenParen}`);
                            }
                            
                            if (currStartsWithLetter && (prevEndsWithLetter || prevEndsWithClosingParen || prevEndsWithSuperscript)) {
                                result.push(' ');
                            } else if (prevEndsWithClosingParen && currStartsWithOpenParen) {
                                result.push(' ');
                            } else if (prev.includes('/') && (currStartsWithOpenParen || currIsGroup)) {
                                // Fraction followed by open paren or group: add space (e.g., d/dx(x^2) -> d/dx (x^2))
                                result.push(' ');
                            } else if (prevIsFraction && (currIsGroup || (currIsLeftDelim && nextIsOpenParen))) {
                                // Fraction node followed by group or by \left(: add space
                                if (window.DEBUG_AST) {
                                    console.log('  ✓ prevIsFraction && (currIsGroup || currIsLeftDelim+nextOpenParen)');
                                    console.log(`    prevIsFraction=${prevIsFraction}, currIsGroup=${currIsGroup}, currIsLeftDelim=${currIsLeftDelim}, nextIsOpenParen=${nextIsOpenParen}`);
                                }
                                result.push(' ');
                            }
                        }
                    }
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
        // Add spaces after subscript/superscript (except for sum/prod/int which handle it separately)
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
        // 提取文本内容，保持原有空格
        if (window.DEBUG_AST) {
            console.log('text_command content:', JSON.stringify(ast.content, null, 2));
        }
        const content = print(ast.content);
        return content;
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
            if (ast.sub) result += '_' + printScriptArg(ast.sub);
            if (ast.sup) result += '^' + printScriptArg(ast.sup, true);
            return result;
        }
        
        if (symbolMap[cmdName]) {
            let result = symbolMap[cmdName];
            if (ast.sub) result += '_' + printScriptArg(ast.sub);
            if (ast.sup) result += '^' + printScriptArg(ast.sup, true);
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
        
        // Strip all bracket sizing commands - Word handles sizing automatically
        const sizingCommands = [
            'big', 'Big', 'bigg', 'Bigg',           // Basic sizing
            'bigl', 'Bigl', 'biggl', 'Biggl',       // Left-specific sizing
            'bigr', 'Bigr', 'biggr', 'Biggr',       // Right-specific sizing
            'bigm', 'Bigm', 'biggm', 'Biggm'        // Middle-specific sizing
        ];
        if (sizingCommands.includes(cmdName)) return '';
        
        // Strip display style commands - Word doesn't support these
        const styleCommands = ['displaystyle', 'textstyle', 'scriptstyle', 'scriptscriptstyle'];
        if (styleCommands.includes(cmdName)) return '';
        
        // Handle escaped braces \{ and \}
        if (cmdName === '{') return '{';
        if (cmdName === '}') return '}';
        
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
        // Print numerator and denominator
        // Don't trim - let subscript/superscript spaces be preserved
        const num = print(ast.num);
        const den = print(ast.den);
        
        if (window.DEBUG_AST) {
            console.log('FRAC DEBUG:');
            console.log('  num:', JSON.stringify(num));
            console.log('  den:', JSON.stringify(den));
            console.log('  den ends with space?', den.endsWith(' '));
        }
        
        // Check if numerator and denominator are "simple" (don't need parentheses)
        const numIsSimple = isSimple(ast.num);
        const denIsSimple = isSimple(ast.den);
        
        // If both are simple, use slash notation without parentheses
        // Add space after fraction
        if (numIsSimple && denIsSimple) {
            return `${num}/${den} `;
        }
        
        // Otherwise, use parentheses for clarity
        // Add space after fraction
        return `(${num})/(${den}) `;
    }

    if (type === 'sqrt') {
        if (ast.index) {
            const idx = print(ast.index);
            const rad = print(ast.radicand);
            return `√(${idx}&${rad})`;
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
        // Only convert the "Big 5" number sets (universally recognized semantic symbols)
        // All other letters are treated as plain text (font styling ignored)
        const bigFive = {
            'C': '\u2102', // ℂ Complex numbers
            'N': '\u2115', // ℕ Natural numbers
            'Q': '\u211A', // ℚ Rational numbers
            'R': '\u211D', // ℝ Real numbers
            'Z': '\u2124', // ℤ Integers
        };
        // For consistency: only the Big 5 get Unicode conversion
        // Everything else (like \mathbb{F}, \mathbb{P}) becomes plain text
        let result = bigFive[content] || content;
        if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
        if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
        return result;
    }

    if (type === 'boxed') {
        // UnicodeMath box notation: ▭〖content〗
        const content = print(ast.content).trim();
        let result = '▭〖' + content + '〗';
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

    if (type === 'cases') {
        // Debug: log AST structure
        if (window.DEBUG_AST) {
            console.log('Cases AST children:', JSON.stringify(ast.children, null, 2));
        }
        
        const rows = [];
        
        // Process children to build rows properly
        let currentRow = [];
        let currentPart = '';
        
        for (const child of ast.children) {
            if (window.DEBUG_AST) {
                console.log('Processing child:', { type: child.type, value: child.value });
            }
            
            if (child.type === 'command' && child.value === '\\\\') {
                // Row separator found
                if (window.DEBUG_AST) console.log('✓ Found row separator');
                if (currentPart) currentRow.push(currentPart.trim());
                if (currentRow.length > 0) {
                    // 左对齐：在第一列前添加 &，列之间使用 &&
                    rows.push('&' + currentRow.join('&&'));
                }
                currentRow = [];
                currentPart = '';
            } else if (child.type === 'text' && child.value === '&') {
                // Column separator found
                if (window.DEBUG_AST) console.log('✓ Found column separator');
                if (currentPart) currentRow.push(currentPart.trim());
                currentPart = '';
            } else {
                // Regular content
                const printed = print(child);
                if (window.DEBUG_AST) console.log('Printed:', printed);
                currentPart += printed;
            }
        }
        // Handle last row
        if (currentPart) currentRow.push(currentPart.trim());
        if (currentRow.length > 0) {
            // 左对齐：在第一列前添加 &，列之间使用 &&
            rows.push('&' + currentRow.join('&&'));
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

    if (type === 'rightdot') {
        return '┤';
    }

    if (type === 'leftpipe') {
        return '|';
    }

    if (type === 'rightpipe') {
        let result = '┤|';
        if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
        if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
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

