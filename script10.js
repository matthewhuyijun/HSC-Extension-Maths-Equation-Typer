
        // Enable AST debugging (set to false in production)
        window.DEBUG_AST = false;
        
        
        /**
         * Fixes n-ary operators in MathML to ensure proper display in Microsoft Word
         * Uses regex patterns to wrap operands in <mrow> tags immediately after operators and their limits
         * @param {string} mathmlString - The MathML string to fix
         * @returns {string} Fixed MathML string
         */
        window.fixNaryOperatorsMathML = function(mathmlString) {
            if (!mathmlString || typeof mathmlString !== 'string') {
                return mathmlString;
            }
            
            try {
                let output = mathmlString;
                
                // 1. Summation (∑, U+2211) with <munderover>
                // Support hex, decimal, and literal encodings
                output = output.replace(
                    /(<munderover>\s*<mo[^>]*>\s*(?:&#x2211;|&#8721;|∑)\s*<\/mo>.*?<\/munderover>\s*)(?!<mrow>)/gs,
                    '$1<mrow>\n  <!-- summand -->\n</mrow>'
                );
                
                // Summation with <munder> (lower limit only)
                output = output.replace(
                    /(<munder>\s*<mo[^>]*>\s*(?:&#x2211;|&#8721;|∑)\s*<\/mo>.*?<\/munder>\s*)(?!<mrow>)/gs,
                    '$1<mrow>\n  <!-- summand -->\n</mrow>'
                );
                
                // 2. Integral (∫, U+222B) with <msubsup>
                // Ensure <msubsup> integrals are followed by a <mrow> block
                output = output.replace(
                    /(<msubsup>\s*<mo[^>]*>\s*(?:&#x222B;|&#8747;|∫)\s*<\/mo>.*?<\/msubsup>\s*)(?!<mrow>)/gs,
                    '$1<mrow>\n  <!-- integrand -->\n</mrow>'
                );
                
                // Integral without limits (standalone <mo>)
                output = output.replace(
                    /(<mo[^>]*>\s*(?:&#x222B;|&#8747;|∫)\s*<\/mo>\s*)(?!<mrow>)/gs,
                    '$1<mrow>\n  <!-- integrand -->\n</mrow>'
                );
                
                // Cleanup: if the standalone-integral rule above inserted an integrand <mrow>
                // inside an <msubsup> block (i.e., right after the integral <mo>), remove it.
                // We only want the operand wrapper AFTER the </msubsup> container, not inside it.
                output = output.replace(
                    /(<msubsup>\s*<mo[^>]*>\s*(?:&#x222B;|&#8747;|∫)\s*<\/mo>)\s*<mrow>\s*<!-- integrand -->\s*<\/mrow>/gs,
                    '$1'
                );
                
                // 3. Product (∏, U+220F) with <munderover>
                // Same wrapping rule as summation
                output = output.replace(
                    /(<munderover>\s*<mo[^>]*>\s*(?:&#x220F;|&#8719;|∏)\s*<\/mo>.*?<\/munderover>\s*)(?!<mrow>)/gs,
                    '$1<mrow>\n  <!-- multiplicand -->\n</mrow>'
                );
                
                // Product with <munder> (lower limit only)
                output = output.replace(
                    /(<munder>\s*<mo[^>]*>\s*(?:&#x220F;|&#8719;|∏)\s*<\/mo>.*?<\/munder>\s*)(?!<mrow>)/gs,
                    '$1<mrow>\n  <!-- multiplicand -->\n</mrow>'
                );
                
                return output;
                
            } catch (error) {
                console.error('Error fixing n-ary operators in MathML:', error);
                return mathmlString; // Return original on error
            }
        };

        /**
         * Fixes arrow accents in MathML for Word compatibility
         * Ensures <mover> elements with arrows have accent="true" and normalized arrow symbols
         * @param {string} mathmlString - The MathML string to fix
         * @returns {string} Fixed MathML string with proper arrow accents
         */
        window.fixArrowAccentsMathML = function(mathmlString) {
            if (!mathmlString || typeof mathmlString !== 'string') {
                return mathmlString;
            }
            
            try {
                // Parse MathML string into DOM
                const parser = new DOMParser();
                const doc = parser.parseFromString(mathmlString, 'application/xml');
                
                // Check for parsing errors
                if (doc.querySelector('parsererror')) {
                    console.warn('MathML parsing error in fixArrowAccentsMathML, returning original string');
                    return mathmlString;
                }
                
                const mathElement = doc.querySelector('math');
                if (!mathElement) {
                    return mathmlString;
                }
                
                // Arrow symbols to detect (various Unicode representations)
                const rightArrows = [
                    '→',           // U+2192 Rightwards Arrow
                    '\u2192',      // U+2192
                    '&#x2192;',    // HTML entity
                    '&#8594;',     // Decimal entity
                    '⟶',           // U+27F6 Long Rightwards Arrow
                    '\u27F6'       // U+27F6
                ];
                
                const leftArrows = [
                    '←',           // U+2190 Leftwards Arrow
                    '\u2190',      // U+2190
                    '&#x2190;',    // HTML entity
                    '&#8592;',     // Decimal entity
                    '⟵',           // U+27F5 Long Leftwards Arrow
                    '\u27F5'       // U+27F5
                ];
                
                // Find all <mover> elements
                const moverElements = mathElement.querySelectorAll('mover');
                
                moverElements.forEach(mover => {
                    // Get the base element (first child) and the operator element (second child)
                    const baseElement = mover.children[0];
                    const operatorElement = mover.children[1];
                    
                    if (!baseElement || !operatorElement) {
                        return; // Skip if structure is invalid
                    }
                    
                    // Check if the operator is an arrow
                    const operatorText = operatorElement.textContent.trim();
                    const isRightArrow = rightArrows.some(arrow => 
                        operatorText === arrow || 
                        operatorText.includes('→') || 
                        operatorText.includes('\u2192')
                    );
                    const isLeftArrow = leftArrows.some(arrow => 
                        operatorText === arrow || 
                        operatorText.includes('←') || 
                        operatorText.includes('\u2190')
                    );
                    
                    if (isRightArrow || isLeftArrow) {
                        // Add accent="true" attribute if not present
                        if (!mover.hasAttribute('accent')) {
                            mover.setAttribute('accent', 'true');
                        } else if (mover.getAttribute('accent') !== 'true') {
                            // Update to true if set to something else
                            mover.setAttribute('accent', 'true');
                        }
                        
                        // Normalize the arrow symbol to standard Unicode
                        if (operatorElement.tagName === 'mo') {
                            if (isRightArrow) {
                                // Use long rightwards arrow (U+27F6) for \overrightarrow
                                // This provides better stretching across multi-character bases
                                operatorElement.textContent = '⟶'; // U+27F6
                            } else if (isLeftArrow) {
                                // Use long leftwards arrow (U+27F5) for \overleftarrow
                                operatorElement.textContent = '⟵'; // U+27F5
                            }
                        }
                        
                        // Ensure base is wrapped in <mrow> if it contains multiple <mi> elements
                        // This ensures proper alignment across all characters
                        if (baseElement.tagName !== 'mrow' && baseElement.children.length > 1) {
                            const mrow = doc.createElement('mrow');
                            // Move all children of base into mrow
                            while (baseElement.firstChild) {
                                mrow.appendChild(baseElement.firstChild);
                            }
                            baseElement.appendChild(mrow);
                        }
                    }
                });
                
                // Serialize back to string
                const serializer = new XMLSerializer();
                const fixedMathML = serializer.serializeToString(mathElement);
                
                // Add namespace if missing
                if (!fixedMathML.includes('xmlns=')) {
                    return fixedMathML.replace('<math>', '<math xmlns="http://www.w3.org/1998/Math/MathML">');
                }
                
                return fixedMathML;
                
            } catch (error) {
                console.error('Error fixing arrow accents in MathML:', error);
                return mathmlString; // Return original on error
            }
        };

        /**
         * Converts overbar notation in MathML to Unicode combining overline format
         * Replaces <mover> elements with combining overline (U+0305) for Word compatibility
         * @param {string} mathmlString - The MathML string to fix
         * @returns {string} Fixed MathML string with combining overlines
         */
        window.fixOverbarMathML = function(mathmlString) {
            if (!mathmlString || typeof mathmlString !== 'string') {
                return mathmlString;
            }
            
            try {
                // Parse MathML string into DOM
                const parser = new DOMParser();
                const doc = parser.parseFromString(mathmlString, 'application/xml');
                
                // Check for parsing errors
                if (doc.querySelector('parsererror')) {
                    console.warn('MathML parsing error in fixOverbarMathML, returning original string');
                    return mathmlString;
                }
                
                const mathElement = doc.querySelector('math');
                if (!mathElement) {
                    return mathmlString;
                }
                
                // Find all <mover> elements
                const moverElements = mathElement.querySelectorAll('mover');
                
                moverElements.forEach(mover => {
                    // Check if this is an overbar (accent="true")
                    const isAccent = mover.getAttribute('accent') === 'true';
                    
                    // Get the base element (first child) and the accent element (second child)
                    const baseElement = mover.children[0];
                    const accentElement = mover.children[1];
                    
                    if (!baseElement || !accentElement) {
                        return; // Skip if structure is invalid
                    }
                    
                    // Check if the accent is an arrow (skip these - they're handled by fixArrowAccentsMathML)
                    const accentText = accentElement.textContent.trim();
                    
                    // Check for all possible arrow representations (including HTML entities)
                    const rightArrowSymbols = ['→', '\u2192', '⟶', '\u27F6', '&#x2192;', '&#8594;', '&#x27F6;', '&#10230;'];
                    const leftArrowSymbols = ['←', '\u2190', '⟵', '\u27F5', '&#x2190;', '&#8592;', '&#x27F5;', '&#10229;'];
                    
                    const isRightArrow = rightArrowSymbols.some(arrow => 
                        accentText === arrow || accentText.includes(arrow) || accentText.includes('→') || accentText.includes('⟶')
                    );
                    const isLeftArrow = leftArrowSymbols.some(arrow => 
                        accentText === arrow || accentText.includes(arrow) || accentText.includes('←') || accentText.includes('⟵')
                    );
                    
                    if (isRightArrow || isLeftArrow) {
                        console.log(`✓ Skipping arrow accent: "${accentText}" (handled by fixArrowAccentsMathML)`);
                        return; // Skip arrow accents - they should remain as <mover> elements
                    }
                    
                    // Check if the accent is an overbar (¯ or ‾)
                    const isOverbar = accentText === '¯' ||       // U+00AF (Macron)
                                     accentText === '\u00AF' ||   // U+00AF
                                     accentText === '‾' ||         // U+203E (Overline)
                                     accentText === '\u203E' ||   // U+203E
                                     accentText === '―' ||         // U+2015 (Horizontal bar)
                                     accentText === '\u2015' ||   // U+2015
                                     accentElement.tagName === 'mo' && (
                                         accentElement.textContent.trim() === '¯' ||
                                         accentElement.textContent.trim() === '\u00AF'
                                     );
                    
                    // Only convert if it's an overbar accent
                    if (isAccent && isOverbar) {
                        // Get the base content (should be a single character for best results)
                        const baseText = baseElement.textContent.trim();
                        
                        // Check if base is a single character (Latin or Greek)
                        if (baseText.length === 1) {
                            // Create a new <mi> element with combining overline
                            const miElement = doc.createElement('mi');
                            miElement.textContent = baseText + '\u0305'; // Add combining overline
                            
                            // Replace the <mover> with the <mi>
                            mover.parentNode.replaceChild(miElement, mover);
                        } else {
                            // Multi-character base: keep mover, but normalize accent for Word
                            let macronMo = accentElement;
                            if (accentElement.tagName !== 'mo') {
                                macronMo = doc.createElement('mo');
                                macronMo.textContent = '\u00AF';
                                mover.replaceChild(macronMo, accentElement);
                            } else {
                                macronMo.textContent = '\u00AF';
                            }
                            macronMo.setAttribute('stretchy', 'true');
                            if (macronMo.hasAttribute('accent')) {
                                macronMo.removeAttribute('accent');
                            }
                            mover.setAttribute('accent', 'true');
                        }
                    }
                });
                
                // Serialize back to string
                const serializer = new XMLSerializer();
                const fixedMathML = serializer.serializeToString(mathElement);
                
                // Add namespace if missing
                if (!fixedMathML.includes('xmlns=')) {
                    return fixedMathML.replace('<math>', '<math xmlns="http://www.w3.org/1998/Math/MathML">');
                }
                
                return fixedMathML;
                
            } catch (error) {
                console.error('Error fixing overbar in MathML:', error);
                return mathmlString; // Return original on error
            }
        };

        // MathML Normalizer: piecewise brace → mfenced(open="{" close="")
        window.MathMLNormalizer = window.MathMLNormalizer || {};
        window.MathMLNormalizer.normalizePiecewise = function(mathmlString) {
            if (!mathmlString || typeof mathmlString !== 'string') {
                return { mathml: mathmlString, didTransform: false };
            }
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(mathmlString, 'application/xml');
                if (doc.querySelector('parsererror')) {
                    console.warn('MathML parsing error in normalizePiecewise, returning original string');
                    return { mathml: mathmlString, didTransform: false };
                }
                const math = doc.querySelector('math');
                if (!math) {
                    return { mathml: mathmlString, didTransform: false };
                }

                let didTransform = false;

                function isEl(n, name) {
                    return n && n.nodeType === 1 && n.localName === name;
                }
                function isBraceMo(n) {
                    return isEl(n, 'mo') && ((n.textContent || '').trim() === '{');
                }
                function alreadyMfencedOpenLeft(el) {
                    return isEl(el, 'mfenced') && el.getAttribute('open') === '{' && (el.getAttribute('close') || '') === '';
                }
                function nextElementSiblingSkippingNonElements(nodes, startIdx) {
                    for (let j = startIdx + 1; j < nodes.length; j++) {
                        const n = nodes[j];
                        if (n.nodeType === 1) return { node: n, index: j };
                    }
                    return { node: null, index: -1 };
                }
                function normalizeContainer(container) {
                    const kids = Array.from(container.childNodes);
                    for (let i = 0; i < kids.length; i++) {
                        const k = kids[i];

                        // Recurse into nested containers first
                        if (isEl(k, 'mrow') || isEl(k, 'math')) {
                            normalizeContainer(k);
                        }

                        if (!isBraceMo(k)) continue;

                        // Find next element child (skip text/comments)
                        const { node: nextEl, index: nextIdx } = nextElementSiblingSkippingNonElements(kids, i);
                        if (!nextEl || !isEl(nextEl, 'mtable')) continue;

                        // Avoid double-wrapping if the container itself is the mfenced already
                        if (alreadyMfencedOpenLeft(container)) continue;

                        // Optional trailing <mo> after the table
                        const { node: maybeClose, index: closeIdx } = nextElementSiblingSkippingNonElements(kids, nextIdx);
                        const hasTrailingMo = !!maybeClose && isEl(maybeClose, 'mo');

                        // Build mfenced and move the existing <mtable> into it
                        const mf = doc.createElementNS('http://www.w3.org/1998/Math/MathML', 'mfenced');
                        mf.setAttribute('open', '{');
                        mf.setAttribute('close', '');
                        mf.appendChild(nextEl); // move node, not clone, to preserve attributes/children

                        // Replace opening brace with mfenced
                        container.replaceChild(mf, k);

                        // Remove the optional trailing closing <mo>
                        if (hasTrailingMo && maybeClose.parentNode === container) {
                            container.removeChild(maybeClose);
                        }

                        // Update snapshot and restart scan for idempotency and cascading cases
                        didTransform = true;
                        return normalizeContainer(container);
                    }
                }

                // Walk all mrow and math containers
                normalizeContainer(math);

                const serializer = new XMLSerializer();
                let out = serializer.serializeToString(math);
                if (!out.includes('xmlns=')) {
                    out = out.replace('<math>', '<math xmlns="http://www.w3.org/1998/Math/MathML">');
                }
                return { mathml: out, didTransform };
            } catch (e) {
                console.error('Error in normalizePiecewise:', e);
                return { mathml: mathmlString, didTransform: false };
            }
        };

        // Convert single-letter overbars (LaTeX and MathML) to Word-friendly macron accents
        function convertOverlines(input) {
          if (!input) return input;
          let out = input;
          // Word compatibility: swap accent-based bars for stretchy macron form
          const BAR_ENTITY_PATTERN = '(?:&#x2015;|&#8213;|&#x203E;|&#8254;|&#xAF;|&#x00AF;|&#x0305;|—|‾|¯)';
          out = out.replace(
            new RegExp(String.raw`<mo\b[^>]*\baccent\s*=\s*["'](?:true|1)["'][^>]*>\s*${BAR_ENTITY_PATTERN}\s*</mo>`, 'g'),
            '<mo stretchy="true">&#xAF;</mo>'
          );
          // 1) LaTeX forms \bar{X}, \overline{X} for single symbol
          const toMover = (symbol) => `<mover accent="true"><mi>${symbol}</mi><mo stretchy="true">&#xAF;</mo></mover>`;
          out = out.replace(/\\bar\{\s*([A-Za-z\u0370-\u03FF])\s*\}/g, (_, sym) => toMover(sym));
          out = out.replace(/\\overline\{\s*([A-Za-z\u0370-\u03FF])\s*\}/g, (_, sym) => toMover(sym));
          // Entities inside braces
          out = out.replace(/\\bar\{\s*(&#[xX][0-9A-Fa-f]+;|&[A-Za-z]+;)\s*\}/g, (_, entity) => toMover(entity));
          out = out.replace(/\\overline\{\s*(&#[xX][0-9A-Fa-f]+;|&[A-Za-z]+;)\s*\}/g, (_, entity) => toMover(entity));
          // 2) Normalize existing mover accents to ensure accent="true"
          out = out.replace(/<mover\b([^>]*)>/g, (match, attrs = '') => {
            let updated = attrs;
            if (!/\baccent\s*=/.test(updated)) {
              updated = `${updated.trim()} accent="true"`.trim();
            } else {
              updated = updated.replace(/\baccent\s*=\s*["'][^"']*["']/, 'accent="true"');
            }
            return `<mover ${updated}>`;
          });
          return out;
        }

        // LaTeX to MathML conversion using MathJax, then n-ary normalization (∫, ∑, ∏)
        window.convertLatexToMathML = async function(latex) {
            if (!window.MathJax || !window.MathJax.tex2mml) {
                console.warn('MathJax tex2mml not available yet');
                return '';
            }
            try {
                const mathml = window.MathJax.tex2mml(latex, {
                    display: false,
                    em: 16,
                    ex: 8,
                    containerWidth: 80 * 16
                });
                // Post-process n-ary operators for Word compatibility
                if (window.NaryOperatorNormalizer && typeof window.NaryOperatorNormalizer.normalizeMathML === 'function') {
                    const { mathml: fixed } = window.NaryOperatorNormalizer.normalizeMathML(mathml);
                    return fixed || mathml;
                }
                return mathml;
            } catch (error) {
                console.error('MathML conversion error:', error);
                return '';
            }
        };
        
        // Debug test for \overrightarrow conversion
        window.testOverrightarrow = async function() {
            console.log('🧪 Testing \\overrightarrow MathML Conversion\n');
            
            const testCases = [
                { latex: '\\overrightarrow{AB}', desc: 'Two-letter base (AB)' },
                { latex: '\\overrightarrow{x}', desc: 'Single letter base (x)' },
                { latex: '\\overrightarrow{CD}', desc: 'Another two-letter base (CD)' },
                { latex: '\\overrightarrow{EFG}', desc: 'Three-letter base (EFG)' },
                { latex: '\\dot{x}', desc: 'Dot accent (for comparison)' },
                { latex: '\\ddot{x}', desc: 'Double dot accent (for comparison)' },
            ];
            
            for (const test of testCases) {
                console.log(`\n📝 Test: ${test.desc}`);
                console.log(`   LaTeX Input:  ${test.latex}`);
                
                try {
                    const mathml = await window.convertLatexToMathML(test.latex);
                    console.log(`   MathML Output:\n${mathml}`);
                    
                    // Check for long rightwards arrow (U+27F6)
                    if (test.latex.includes('overrightarrow')) {
                        if (mathml.includes('⟶') || mathml.includes('&#x27F6;') || mathml.includes('&#10230;')) {
                            console.log('   ✅ PASS - Contains long rightwards arrow (U+27F6)');
                        } else if (mathml.includes('→') || mathml.includes('&#x2192;')) {
                            console.log('   ⚠️  WARNING - Contains short arrow (U+2192) instead of long arrow (U+27F6)');
                        } else {
                            console.log('   ❌ FAIL - No arrow symbol found');
                        }
                        
                        // Check for <mover> structure
                        if (mathml.includes('<mover')) {
                            console.log('   ✅ PASS - Uses <mover> element');
                        } else {
                            console.log('   ❌ FAIL - Missing <mover> element');
                        }
                        
                        // Check for accent="true"
                        if (mathml.includes('accent="true"')) {
                            console.log('   ✅ PASS - Has accent="true" attribute');
                        } else {
                            console.log('   ⚠️  INFO - Missing accent="true" attribute (may be optional)');
                        }
                    }
                } catch (error) {
                    console.log(`   ❌ ERROR: ${error.message}`);
                }
            }
            
            console.log('\n✨ Test complete!\n');
        };

        // Rewire Word-specific MathML helpers to external module (keeps backward compatibility)
        window.fixNaryOperatorsMathML = function(s){
            return (window.WordMathML && typeof window.WordMathML.fixNaryOperatorsMathML==='function') ? window.WordMathML.fixNaryOperatorsMathML(s) : s;
        };
        window.fixArrowAccentsMathML = function(s){
            return (window.WordMathML && typeof window.WordMathML.fixArrowAccentsMathML==='function') ? window.WordMathML.fixArrowAccentsMathML(s) : s;
        };
        window.fixOverbarMathML = function(s){
            return (window.WordMathML && typeof window.WordMathML.fixOverbarMathML==='function') ? window.WordMathML.fixOverbarMathML(s) : s;
        };
        window.convertOverlines = function(s){
            return (window.WordMathML && typeof window.WordMathML.convertOverlines==='function') ? window.WordMathML.convertOverlines(s) : s;
        };
        
        
        // Debug test for overbar combining conversion
        window.debugOverbar = async function() {
            console.log('🧪 Testing overbar combining conversion:');
            console.log('');
            
            const testCases = [
                { latex: '\\bar{z}', desc: 'Simple bar (Latin)', expectCombining: true },
                { latex: '\\overline{z}', desc: 'Overline (Latin)', expectCombining: true },
                { latex: '\\bar{x}', desc: 'Bar on x', expectCombining: true },
                { latex: '\\bar{\\theta}', desc: 'Bar on Greek theta (θ)', expectCombining: true },
                { latex: '\\overline{A}', desc: 'Overline on uppercase A', expectCombining: true },
                { latex: '\\bar{z} + \\bar{w}', desc: 'Multiple bars', expectCombining: true },
                { latex: 'z = \\bar{z}', desc: 'Bar in equation', expectCombining: true },
                { latex: '\\overrightarrow{AB}', desc: 'Arrow accent (should NOT convert)', expectCombining: false }
            ];
            
            for (const test of testCases) {
                console.log(`\n📝 Test: ${test.desc}`);
                console.log(`   Input:  ${test.latex}`);
                
                try {
                    const mathml = await window.convertLatexToMathML(test.latex);
                    console.log(`   Output: ${mathml}`);
                    
                    const hasCombining = mathml.includes('\u0305') || mathml.includes('&#x0305;') || mathml.includes('&#x305;');
                    const hasMover = mathml.includes('<mover');
                    
                    if (test.expectCombining) {
                        // Should be converted to combining overline
                        if (hasCombining && !hasMover) {
                            console.log('   ✅ PASS - Contains combining overline (no <mover>)');
                        } else if (hasMover) {
                            console.log('   ❌ FAIL - Still contains <mover> element');
                        } else {
                            console.log('   ⚠️  WARN - No overbar found');
                        }
                    } else {
                        // Should NOT be converted (arrows should stay as <mover>)
                        if (hasMover && !hasCombining) {
                            console.log('   ✅ PASS - Correctly preserved as <mover> (arrow accent)');
                        } else if (hasCombining) {
                            console.log('   ❌ FAIL - Incorrectly converted to combining overline');
                        } else {
                            console.log('   ⚠️  WARN - No accent found');
                        }
                    }
                } catch (error) {
                    console.error('   ❌ ERROR:', error);
                }
            }
            
            console.log('\n' + '='.repeat(60));
            console.log('📊 Summary:');
            console.log('✅ Combining overline format: character + U+0305');
            console.log('❌ Avoid: <mover> elements (unreliable in Word)');
            console.log('');
        };
        
        // Helper function to remove spacing commands for clean LaTeX
        window.removeWordSpaces = function(latex) {
            // Remove Word-specific spacing commands like \:
            return latex.replace(/\\:/g, '');
        };
        
        console.log('✅ MathML converter ready (using MathJax)');
        
        // Trigger initial sync if math field has content
        setTimeout(() => {
            const mf2 = document.getElementById('mf2');
            if (mf2 && mf2.getValue && mf2.getValue()) {
                console.log('🔄 Triggering initial sync with content:', mf2.getValue());
                if (typeof syncFromMathLive === 'function') {
                    syncFromMathLive();
                }
            }
        }, 100);
    });
    