/**
 * LaTeX Parser - Converts LaTeX strings to Abstract Syntax Tree (AST)
 * 
 * This module implements a recursive descent parser that converts LaTeX
 * mathematical expressions into an AST representation for further processing.
 * 
 * Refactored for file:// protocol compatibility (no ES6 modules)
 */

(function() {
    'use strict';
    
    /**
     * Parse LaTeX string into an Abstract Syntax Tree
     * @param {string} latex - The LaTeX string to parse
     * @returns {Array} AST representation of the LaTeX expression
     */
    function parse(latex) {
    let pos = 0;
    const str = latex;

    function peek() {
        return str[pos];
    }

    function consume() {
        return str[pos++];
    }

    function skipWhitespace() {
        while (pos < str.length && /\s/.test(str[pos])) pos++;
    }

    /**
     * Attach subscripts and superscripts to preceding nodes
     * This converts standalone sub/sup nodes into properties of their base nodes
     */
    function attachScripts(nodes) {
        const result = [];
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.type === 'sub' || node.type === 'sup') {
                if (result.length > 0) {
                    const prev = result[result.length - 1];
                    if (!prev.sub && node.type === 'sub') {
                        prev.sub = node.arg;
                    } else if (!prev.sup && node.type === 'sup') {
                        prev.sup = node.arg;
                    } else {
                        result.push(node);
                    }
                } else {
                    result.push(node);
                }
            } else {
                result.push(node);
            }
        }
        return result;
    }

    function parseGroup() {
        if (peek() !== '{') return null;
        consume();
        const nodes = [];
        while (pos < str.length && peek() !== '}') {
            nodes.push(parseNode());
        }
        if (peek() === '}') consume();
        return { type: 'group', children: attachScripts(nodes.filter(n => n.type !== 'text' || n.value !== '')) };
    }
    
    function parseGroupOrToken() {
        // Parse either a group {...} or a single token
        // This is used for commands like \sqrt that can take either \sqrt{x} or \sqrt x
        const group = parseGroup();
        if (group) return group;
        
        // No group, so parse a single token
        const node = parseNode();
        if (node && (node.type !== 'text' || node.value !== '')) {
            return { type: 'group', children: [node] };
        }
        return null;
    }
    
    function parseTextGroup() {
        // Special parser for \text{} that preserves spaces
        if (peek() !== '{') return null;
        consume();
        let text = '';
        while (pos < str.length && peek() !== '}') {
            text += consume();
        }
        if (peek() === '}') consume();
        return { type: 'group', children: [{ type: 'text', value: text }] };
    }

    function parseBracketGroup() {
        if (peek() !== '[') return null;
        consume();
        const nodes = [];
        while (pos < str.length && peek() !== ']') {
            nodes.push(parseNode());
        }
        if (peek() === ']') consume();
        return { type: 'bracket', children: attachScripts(nodes.filter(n => n.type !== 'text' || n.value !== '')) };
    }

    function parseCommand() {
        if (peek() !== '\\') return null;
        consume();
        if (pos >= str.length) return null;
        
        if (peek() === '\\') {
            consume();
            return { type: 'command', value: '\\\\' };
        }
        
        if (!/[A-Za-z]/.test(peek())) {
            const ch = consume();
            return { type: 'command', value: '\\' + ch };
        }
        
        let name = '';
        while (pos < str.length && /[A-Za-z]/.test(peek())) {
            name += consume();
        }
        
        return { type: 'command', value: '\\' + name };
    }

    function parseNode() {
        skipWhitespace();
        if (pos >= str.length) return { type: 'text', value: '' };
        
        const ch = peek();
        
        if (ch === '\\') {
            const cmd = parseCommand();
            if (!cmd) return { type: 'text', value: '' };
            
            const cmdName = cmd.value.slice(1);
            
            if (cmdName === 'frac' || cmdName === 'tfrac' || cmdName === 'dfrac') {
                skipWhitespace();
                const num = parseGroup();
                skipWhitespace();
                const den = parseGroup();
                return { type: 'frac', num, den };
            }
            
            if (cmdName === 'sqrt') {
                skipWhitespace();
                const index = peek() === '[' ? parseBracketGroup() : null;
                skipWhitespace();
                const radicand = parseGroupOrToken();
                return { type: 'sqrt', index, radicand };
            }
            
            if (cmdName === 'sum') return { type: 'sum' };
            if (cmdName === 'prod') return { type: 'prod' };
            if (cmdName === 'int') return { type: 'int' };
            
            // Handle LaTeX spacing commands
            // In Word equations, we generally ignore fine-tuned spacing
            if (cmdName === '!') return { type: 'space', value: '' }; // negative thin space - ignore
            if (cmdName === ',') return { type: 'space', value: '' }; // thin space - ignore
            if (cmdName === ':') return { type: 'space', value: ' ' }; // medium space
            if (cmdName === ';') return { type: 'space', value: ' ' }; // thick space
            if (cmdName === 'quad') return { type: 'space', value: ' ' }; // quad space
            if (cmdName === 'qquad') return { type: 'space', value: ' ' }; // double quad space
            
            if (cmdName === 'left') {
                skipWhitespace();
                if (peek() === '.') {
                    consume();
                    return { type: 'leftdot' };
                }
                if (peek() === '|') {
                    consume();
                    return { type: 'leftpipe' };
                }
                // For other delimiters like (, [, \{, strip \left but keep the delimiter
                return { type: 'leftdelim' };
            }
            
            if (cmdName === 'right') {
                skipWhitespace();
                if (peek() === '.') {
                    consume();
                    return { type: 'rightdot' };
                }
                if (peek() === '|') {
                    consume();
                    return { type: 'rightpipe' };
                }
                // For other delimiters like ), ], \}, strip \right but keep the delimiter
                return { type: 'rightdelim' };
            }
            
            if (cmdName === 'operatorname') {
                skipWhitespace();
                const name = parseGroup();
                return { type: 'operatorname', name };
            }
            
            if (cmdName === 'underset') {
                skipWhitespace();
                const under = parseGroup();
                skipWhitespace();
                const base = parseGroup();
                return { type: 'underset', under, base };
            }
            
            if (cmdName === 'overrightarrow') {
                skipWhitespace();
                const content = parseGroupOrToken();
                return { type: 'overrightarrow', content };
            }
            
            if (cmdName === 'vec') {
                skipWhitespace();
                const content = parseGroupOrToken();
                return { type: 'vec', content };
            }
            
            if (cmdName === 'dot') {
                skipWhitespace();
                const content = parseGroupOrToken();
                return { type: 'dotaccent', content };
            }
            
            if (cmdName === 'ddot') {
                skipWhitespace();
                const content = parseGroupOrToken();
                return { type: 'ddotaccent', content };
            }
            
            if (cmdName === 'overline') {
                skipWhitespace();
                const content = parseGroupOrToken();
                return { type: 'overline', content };
            }
            
            if (cmdName === 'mathbb') {
                skipWhitespace();
                const content = parseGroupOrToken();
                return { type: 'mathbb', content };
            }
            
            if (cmdName === 'boxed') {
                skipWhitespace();
                const content = parseGroupOrToken();
                return { type: 'boxed', content };
            }
            
            // Handle \ell as a font-styled letter (script lowercase L)
            // Treat it like other font styling - convert to plain 'l'
            if (cmdName === 'ell') {
                return { type: 'text', value: 'l' };
            }
            
            // Font commands: strip all styling, return plain content
            // This ensures consistency - no silent failures where "ell" appears as text
            const fontCommands = [
                'mathbf',    // bold
                'mathrm',    // roman
                'mathit',    // italic
                'mathcal',   // calligraphic
                'mathsf',    // sans-serif
                'mathtt',    // typewriter
                'mathfrak',  // fraktur
                'boldsymbol',// bold symbol
                'bm',        // bold math
                'textbf',    // text bold
                'textit',    // text italic
                'textrm'     // text roman
            ];
            
            if (fontCommands.includes(cmdName)) {
                skipWhitespace();
                const content = parseGroup();
                // Return plain content, ignore font styling
                return content || { type: 'text', value: '' };
            }
            
            // 添加 \text{} 命令的处理
            if (cmdName === 'text') {
                skipWhitespace();
                const content = parseTextGroup();
                return { type: 'text_command', content };
            }
            
            // Handle trigonometric functions with explicit brace arguments only
            const trigFunctions = [
                'sin', 'cos', 'tan', 'csc', 'sec', 'cot',
                'sinh', 'cosh', 'tanh', 'csch', 'sech', 'coth',
                'arcsin', 'arccos', 'arctan', 'arccsc', 'arcsec', 'arccot'
            ];
            if (trigFunctions.includes(cmdName)) {
                skipWhitespace();
                
                // Only capture arguments if they're in braces {}
                if (peek() === '{') {
                    const arg = parseGroup();
                    return { type: 'trigfunc', name: cmdName, arg };
                }
                
                // Otherwise return standard command (will be handled by standard function logic)
                return cmd;
            }
            
            if (cmdName === 'begin') {
                skipWhitespace();
                const env = parseGroup();
                const envName = env && env.children && env.children[0] && env.children[0].value;
                if (envName === 'pmatrix' || envName === 'cases') {
                    const bodyNodes = [];
                    while (pos < str.length) {
                        skipWhitespace();
                        if (str.slice(pos, pos + 4) === '\\end') {
                            break;
                        }
                        bodyNodes.push(parseNode());
                    }
                    if (str.slice(pos, pos + 4) === '\\end') {
                        parseCommand();
                        skipWhitespace();
                        parseGroup();
                    }
                    // Debug: log parsed body nodes
                    if (window.DEBUG_AST) {
                        console.log(`${envName} bodyNodes:`, JSON.stringify(bodyNodes, null, 2));
                    }
                    // 修复：添加 attachScripts 以正确处理下标和上标
                    return { type: envName, children: attachScripts(bodyNodes) };
                }
            }
            
            return cmd;
        }
        
        if (ch === '_') {
            consume();
            skipWhitespace();
            const arg = peek() === '{' ? parseGroup() : parseSingleToken();
            return { type: 'sub', arg };
        }
        
        if (ch === '^') {
            consume();
            skipWhitespace();
            const arg = peek() === '{' ? parseGroup() : parseSingleToken();
            return { type: 'sup', arg };
        }
        
        if (ch === '|') {
            consume();
            return { type: 'pipe' };
        }
        
        if (ch === '.') {
            consume();
            return { type: 'dot' };
        }
        
        if (ch === '{') {
            return parseGroup();
        }
        
        if (ch === '}') {
            consume();
            return { type: 'text', value: '' };
        }
        
        if (ch === '[') {
            consume();
            return { type: 'text', value: '[' };
        }
        
        if (ch === ']') {
            consume();
            return { type: 'text', value: ']' };
        }
        
        if (ch === '&') {
            consume();
            return { type: 'text', value: '&' };
        }
        
        let text = '';
        while (pos < str.length && !/[\\{}\[\]_^|&\s]/.test(peek())) {
            text += consume();
        }
        return { type: 'text', value: text };
    }

    function parseSingleToken() {
        skipWhitespace();
        const ch = peek();
        if (ch === '\\') {
            return parseCommand();
        } else if (/[a-zA-Z0-9+\-*/=<>!]/.test(ch)) {
            return { type: 'text', value: consume() };
        }
        return { type: 'text', value: '' };
    }

    function parseSequence() {
        const nodes = [];
        while (pos < str.length) {
            const node = parseNode();
            if (node && node.type !== 'text' || node.value !== '') {
                nodes.push(node);
            }
        }
        return attachScripts(nodes);
    }

    return parseSequence();
    }
    
    // Expose to global scope
    window.LatexParser = {
        parse
    };
})();

