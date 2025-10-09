// AST-based LaTeX to Word UnicodeMath converter
function toWordEquation(latex) {
    // Symbol mapping tables
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

    const symbolMap = {
        infty: '∞', pm: '±', mp: '∓', times: '×', div: '÷',
        ast: '∗', star: '⋆', bullet: '•', circ: '∘',
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

    // Parser
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

        // Attach subscripts and superscripts to preceding nodes
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
            consume(); // {
            const nodes = [];
            while (pos < str.length && peek() !== '}') {
                nodes.push(parseNode());
            }
            if (peek() === '}') consume(); // }
            return { type: 'group', children: attachScripts(nodes.filter(n => n.type !== 'text' || n.value !== '')) };
        }

        function parseBracketGroup() {
            if (peek() !== '[') return null;
            consume(); // [
            const nodes = [];
            while (pos < str.length && peek() !== ']') {
                nodes.push(parseNode());
            }
            if (peek() === ']') consume(); // ]
            return { type: 'bracket', children: attachScripts(nodes.filter(n => n.type !== 'text' || n.value !== '')) };
        }

        function parseCommand() {
            if (peek() !== '\\') return null;
            consume(); // \
            if (pos >= str.length) return null;
            
            // Handle \\ as a special case
            if (peek() === '\\') {
                consume();
                return { type: 'command', value: '\\\\' };
            }
            
            // Handle single char escapes
            if (!/[A-Za-z]/.test(peek())) {
                const ch = consume();
                return { type: 'command', value: '\\' + ch };
            }
            
            // Parse command name
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
            
            // Commands
            if (ch === '\\') {
                const cmd = parseCommand();
                if (!cmd) return { type: 'text', value: '' };
                
                const cmdName = cmd.value.slice(1);
                
                // \frac{num}{den}
                if (cmdName === 'frac') {
                    skipWhitespace();
                    const num = parseGroup();
                    skipWhitespace();
                    const den = parseGroup();
                    return { type: 'frac', num, den };
                }
                
                // \sqrt[index]{radicand}
                if (cmdName === 'sqrt') {
                    skipWhitespace();
                    const index = peek() === '[' ? parseBracketGroup() : null;
                    skipWhitespace();
                    const radicand = parseGroup();
                    return { type: 'sqrt', index, radicand };
                }
                
                // \sum, \prod, \int
                if (cmdName === 'sum') return { type: 'sum' };
                if (cmdName === 'prod') return { type: 'prod' };
                if (cmdName === 'int') return { type: 'int' };
                
                // \left
                if (cmdName === 'left') {
                    skipWhitespace();
                    if (peek() === '.') {
                        consume();
                        return { type: 'leftdot' };
                    }
                    return { type: 'leftdelim' };
                }
                
                // \right
                if (cmdName === 'right') {
                    skipWhitespace();
                    if (peek() === '|') {
                        consume();
                        return { type: 'rightpipe' };
                    }
                    return { type: 'rightdelim' };
                }
                
                // \operatorname{name}
                if (cmdName === 'operatorname') {
                    skipWhitespace();
                    const name = parseGroup();
                    return { type: 'operatorname', name };
                }
                
                // \underset{under}{base}
                if (cmdName === 'underset') {
                    skipWhitespace();
                    const under = parseGroup();
                    skipWhitespace();
                    const base = parseGroup();
                    return { type: 'underset', under, base };
                }
                
                // \overrightarrow{content}
                if (cmdName === 'overrightarrow') {
                    skipWhitespace();
                    const content = parseGroup();
                    return { type: 'overrightarrow', content };
                }
                
                // \begin{pmatrix}...\end{pmatrix}
                if (cmdName === 'begin') {
                    skipWhitespace();
                    const env = parseGroup();
                    if (env && env.children && env.children[0] && env.children[0].value === 'pmatrix') {
                        // Parse body until \end
                        const bodyNodes = [];
                        while (pos < str.length) {
                            skipWhitespace();
                            if (str.slice(pos, pos + 4) === '\\end') {
                                break;
                            }
                            bodyNodes.push(parseNode());
                        }
                        // Consume \end{pmatrix}
                        if (str.slice(pos, pos + 4) === '\\end') {
                            parseCommand(); // \end
                            skipWhitespace();
                            parseGroup(); // {pmatrix}
                        }
                        return { type: 'pmatrix', children: bodyNodes };
                    }
                }
                
                return cmd;
            }
            
            // Subscript
            if (ch === '_') {
                consume();
                skipWhitespace();
                const arg = peek() === '{' ? parseGroup() : parseSingleToken();
                return { type: 'sub', arg };
            }
            
            // Superscript
            if (ch === '^') {
                consume();
                skipWhitespace();
                const arg = peek() === '{' ? parseGroup() : parseSingleToken();
                return { type: 'sup', arg };
            }
            
            // Pipe
            if (ch === '|') {
                consume();
                return { type: 'pipe' };
            }
            
            // Dot
            if (ch === '.') {
                consume();
                return { type: 'dot' };
            }
            
            // Group
            if (ch === '{') {
                return parseGroup();
            }
            
            // Skip closing braces
            if (ch === '}') {
                consume();
                return { type: 'text', value: '' };
            }
            
            // Text
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

    // Printer (AST → UnicodeMath)
    function print(ast, context = {}) {
        if (Array.isArray(ast)) {
            // Add spaces between consecutive elements where needed
            const parts = ast.map(node => print(node, context));
            const result = [];
            for (let i = 0; i < parts.length; i++) {
                if (i > 0 && parts[i] && parts[i-1]) {
                    // Add space between greek/symbol and text, or between two text nodes
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
            if (ast.sub) result += '_' + printScriptArg(ast.sub);
            if (ast.sup) result += '^' + printScriptArg(ast.sup, true);
            return result;
        }

        if (type === 'command') {
            const cmd = ast.value;
            const cmdName = cmd.slice(1);
            
            // Greek letters
            if (greekMap[cmdName]) {
                let result = greekMap[cmdName];
                if (ast.sub) result += '_' + printScriptArg(ast.sub);
                if (ast.sup) result += '^' + printScriptArg(ast.sup, true);
                return result;
            }
            
            // Symbols
            if (symbolMap[cmdName]) {
                let result = symbolMap[cmdName];
                if (ast.sub) result += '_' + printScriptArg(ast.sub);
                if (ast.sup) result += '^' + printScriptArg(ast.sup, true);
                return result;
            }
            
            // Functions
            if (/^(sin|cos|tan|csc|sec|cot|log|ln|exp|max|min|mod)$/.test(cmdName)) {
                let result = cmdName;
                if (ast.sub) result += '_' + printScriptArg(ast.sub);
                if (ast.sup) result += '^' + printScriptArg(ast.sup, true);
                return result;
            }
            
            // Ignore left/right
            if (cmdName === 'left' || cmdName === 'right') return '';
            if (cmdName === '\\') return ''; // \\ in pmatrix
            
            let result = cmdName;
            if (ast.sub) result += '_' + printScriptArg(ast.sub);
            if (ast.sup) result += '^' + printScriptArg(ast.sup, true);
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
            if (ast.sub) result += '_' + printScriptArg(ast.sub);
            if (ast.sup) result += '^' + printScriptArg(ast.sup, type !== 'int');
            return result;
        }

        if (type === 'operatorname') {
            let result = print(ast.name);
            if (ast.sub) {
                const subContent = print(ast.sub);
                result += '_' + (subContent.includes('┬∼') ? subContent : printScriptArg(ast.sub));
            }
            if (ast.sup) {
                result += '^' + printScriptArg(ast.sup, true);
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
            // Extract rows from children
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
            if (ast.sub) result += printScriptArg(ast.sub);
            if (ast.sup) result += '^' + printScriptArg(ast.sup, false);
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

    function printScriptArg(arg, isSup = false) {
        if (!arg) return '';
        const content = print(arg).trim();
        // Always wrap superscripts in parens
        if (isSup) {
            return `(${content})`;
        }
        // Subscripts: don't wrap tilde notation or single chars
        if (content.includes('┬∼')) return content;
        if (content.length === 1 && /[a-zA-Z0-9]/.test(content)) return content;
        return `(${content})`;
    }

    // Post-process
    function postProcess(text) {
        // Handle integrals: ∫_b^a f(x) dx → ∫_b^a 〖f(x)〗 dx
        text = text.replace(/∫(_[^\s^]+)?\^([^\s]+)\s+([^d]+?)\s*d([a-z])/gi, (m, sub, sup, integrand, variable) => {
            const lower = sub || '';
            integrand = integrand.trim();
            return `∫${lower}^${sup} 〖${integrand}〗 d${variable}`;
        });
        
        // Add space between evaluation bar components
        text = text.replace(/├\s*/g, '├ ');
        text = text.replace(/\s*┤\|/g, '┤|');
        
        // Add space after summation/product
        text = text.replace(/(∑_\([^)]+\)\^\(\d+\))([a-z])/gi, '$1 $2');
        text = text.replace(/(∏_\([^)]+\)\^\(\d+\))([a-z])/gi, '$1 $2');
        
        // Handle proj with exactly 3 spaces
        text = text.replace(/proj_([A-Z])┬∼\s*([A-Z])┬∼/g, 'proj_$1┬∼   $2┬∼');
        
        return text;
    }

    // Main conversion
    try {
        const ast = parse(latex);
        let result = print(ast);
        result = postProcess(result);
        return result;
    } catch (e) {
        console.error('LaTeX parsing error:', e);
        return latex;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { toWordEquation };
}
