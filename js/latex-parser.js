/**
 * LaTeX Parser - Converts LaTeX strings to Abstract Syntax Tree (AST)
 * 
 * This module implements a recursive descent parser that converts LaTeX
 * mathematical expressions into an AST representation for further processing.
 */

/**
 * Parse LaTeX string into an Abstract Syntax Tree
 * @param {string} latex - The LaTeX string to parse
 * @returns {Array} AST representation of the LaTeX expression
 */
export function parse(latex) {
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
            
            if (cmdName === 'frac') {
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
                const radicand = parseGroup();
                return { type: 'sqrt', index, radicand };
            }
            
            if (cmdName === 'sum') return { type: 'sum' };
            if (cmdName === 'prod') return { type: 'prod' };
            if (cmdName === 'int') return { type: 'int' };
            
            // Handle \: as a space command (medium math space)
            if (cmdName === ':') return { type: 'space', value: ' ' };
            
            if (cmdName === 'left') {
                skipWhitespace();
                if (peek() === '.') {
                    consume();
                    return { type: 'leftdot' };
                }
                return { type: 'leftdelim' };
            }
            
            if (cmdName === 'right') {
                skipWhitespace();
                if (peek() === '|') {
                    consume();
                    return { type: 'rightpipe' };
                }
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
                const content = parseGroup();
                return { type: 'overrightarrow', content };
            }
            
            if (cmdName === 'begin') {
                skipWhitespace();
                const env = parseGroup();
                if (env && env.children && env.children[0] && env.children[0].value === 'pmatrix') {
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
                    return { type: 'pmatrix', children: bodyNodes };
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
        
        let text = '';
        while (pos < str.length && !/[\\{}\[\]_^|\s]/.test(peek())) {
            text += consume();
        }
        return { type: 'text', value: text };
    }

    function parseSingleToken() {
        skipWhitespace();
        const ch = peek();
        if (ch === '\\') {
            return parseCommand();
        } else if (/[a-zA-Z0-9]/.test(ch)) {
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

