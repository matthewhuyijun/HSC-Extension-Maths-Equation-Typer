(function() {
  const saved = localStorage.getItem('theme-preference') || 'system';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = saved === 'system' ? (prefersDark ? 'dark' : 'light') : saved;
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.style.colorScheme = resolved;
})();

      // Append our fix to the existing callback
      const _prevWhenReady = window.whenMathJaxReady || function(){};
      window.whenMathJaxReady = function () {
        _prevWhenReady();
        fixNaryOperands();
        // Render preview if there's content queued
        if (window._previewPendingLaTeX !== undefined) {
          renderPreview(window._previewPendingLaTeX);
          delete window._previewPendingLaTeX;
        }
      };

      function fixNaryOperands(root = document) {
        const MML = "http://www.w3.org/1998/Math/MathML";
        // All MathML <math> elements
        const maths = root.querySelectorAll('math');

        maths.forEach(math => {
          // For each operator pattern, ensure the immediate operand is an <mrow>
          wrapAfterLimits(math, 'munderover', '&#x2211;'); // ∑
          wrapAfterLimits(math, 'munder',     '&#x2211;'); // ∑ (lower only)
          wrapAfterLimits(math, 'munderover', '&#x220F;'); // ∏
          wrapIntegral(math);                                 // ∫ with/without limits
        });

        function isWhitespace(node) {
          return node && node.nodeType === Node.TEXT_NODE && !node.nodeValue.trim();
        }

        // Generic wrapper for ∑ and ∏ after <munderover>/<munder>
        function wrapAfterLimits(math, limitsTag, entity) {
          const limits = math.getElementsByTagName(limitsTag);
          for (const lim of limits) {
            const mo = lim.querySelector('mo');
            if (!mo || mo.innerHTML.trim() !== entity) continue;

            // Find the first meaningful sibling after limitsTag
            let after = lim.nextSibling;
            while (isWhitespace(after)) after = after.nextSibling;

            // If already <mrow>, nothing to do
            if (after && after.nodeType === 1 && after.localName === 'mrow') continue;

            // Wrap the single following node (if any) into <mrow>
            const mrow = document.createElementNS(MML, 'mrow');
            if (after) {
              math.insertBefore(mrow, after);
              mrow.appendChild(after);
            } else {
              // No operand present: create empty mrow placeholder
              math.appendChild(mrow);
            }
          }
        }

        // Integrals: either <msubsup><mo>&#x222B;</mo>…</msubsup> or bare <mo>&#x222B;</mo>
        function wrapIntegral(math) {
          // Case 1: with limits
          const withLimits = math.getElementsByTagName('msubsup');
          for (const box of withLimits) {
            const mo = box.querySelector('mo');
            if (!mo || mo.innerHTML.trim() !== '&#x222B;') continue;

            let after = box.nextSibling;
            while (isWhitespace(after)) after = after.nextSibling;
            if (after && after.nodeType === 1 && after.localName === 'mrow') continue;

            const mrow = document.createElementNS(MML, 'mrow');
            if (after) {
              math.insertBefore(mrow, after);
              mrow.appendChild(after);
            } else {
              math.appendChild(mrow);
            }
          }

          // Case 2: without limits (bare ∫)
          const mos = math.getElementsByTagName('mo');
          for (const mo of mos) {
            if (mo.innerHTML.trim() !== '&#x222B;') continue;
            // Only handle if next isn’t already mrow
            let after = mo.nextSibling;
            while (isWhitespace(after)) after = after.nextSibling;
            if (!after) continue;
            if (after.nodeType === 1 && after.localName === 'mrow') continue;

            const mrow = document.createElementNS(MML, 'mrow');
            mo.parentNode.insertBefore(mrow, after);
            mrow.appendChild(after);
          }
        }
      }

    (function(){
      const html = document.documentElement;
      const opts = document.querySelectorAll('.theme-opt');
      const THEME_STORAGE_KEY = 'theme-preference';
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
      const MESSAGE_SOURCE = 'mathstyper-theme';
      let currentMode = 'system';
      let flushTimer = null;
      
      const resolveTheme = (mode)=>{
        if(mode === 'system'){
          return prefersDarkScheme.matches ? 'dark' : 'light';
        }
        return mode === 'dark' ? 'dark' : 'light';
      };
      
      // Theme broadcaster – no iframe, inline sections use CSS variables
      window.__broadcastLatexIframeTheme = (mode)=>{ currentMode = mode; if (typeof window.__syncAceTheme === "function") window.__syncAceTheme(); };

      
      // Remove tooltips from all MathLive keyboard buttons
      window.addEventListener('load', () => {
        // Function to remove title attributes
        const removeTooltips = () => {
          // Remove from all elements with title attribute
          document.querySelectorAll('[title]').forEach(el => {
            // Only remove from MathLive keyboard elements
            if (el.closest('.MLK__keyboard') || el.classList.contains('MLK__keycap') || 
                el.closest('math-field') || el.tagName === 'MATH-FIELD') {
              el.removeAttribute('title');
            }
          });
        };
        
        // Run immediately
        removeTooltips();
        
        // Set up mutation observer to catch dynamically added elements
        const observer = new MutationObserver(() => {
          removeTooltips();
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['title']
        });
        
        // Also run periodically as a backup
        setInterval(removeTooltips, 500);
      });
      
      const apply = (mode)=>{
        opts.forEach(o=>o.classList.toggle('is-active', o.dataset.theme===mode));
        const resolved = resolveTheme(mode);
        html.setAttribute('data-theme', resolved);
        html.style.colorScheme = resolved;
        localStorage.setItem(THEME_STORAGE_KEY, mode);
        window.__broadcastLatexIframeTheme(mode);
      };
      
      const saved = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
      apply(saved);
      
      opts.forEach(btn => btn.addEventListener('click', ()=> apply(btn.dataset.theme)));
      
      const handleSystemChange = () => {
        const current = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
        if(current === 'system'){ apply('system'); }
      };
      if(typeof prefersDarkScheme.addEventListener === 'function'){
        prefersDarkScheme.addEventListener('change', handleSystemChange);
      } else if(typeof prefersDarkScheme.addListener === 'function'){
        prefersDarkScheme.addListener(handleSystemChange);
      }
    })();

    // Global helper function to initialize Lucide icons
    window.initLucideIcons = function() {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        try {
          window.lucide.createIcons({
            attrs: {
              'stroke-width': 2,
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            }
          });
          console.log('✅ Lucide icons initialized successfully');
        } catch (e) {
          console.error('❌ Lucide icons initialization failed:', e);
        }
      } else {
        console.warn('⚠️ Lucide library not loaded yet');
      }
    };

    document.addEventListener('DOMContentLoaded', () => {
      // Initialize Lucide icons on page load
      setTimeout(() => {
        window.initLucideIcons();
      }, 100); // Small delay to ensure Lucide is fully loaded
      
      const broadcast = window.__broadcastLatexIframeTheme;
      if (typeof broadcast === 'function') {
        const storedMode = localStorage.getItem('theme-preference') || 'system';
        broadcast(storedMode);
      }
    });

         function mjxTypeset(el, tries=0){
             if(!window.MathJax){ 
                 if(tries<200) { 
                     setTimeout(()=>mjxTypeset(el,tries+1),25); 
                     return; 
                 } else { 
                     console.warn('MathJax not available after 200 attempts');
                     return; 
                 } 
             }
             const MJ=window.MathJax;
             try {
                 if(MJ && typeof MJ.typeset==='function') { 
                     MJ.typeset([el]); 
                 } else if(MJ && typeof MJ.typesetPromise==='function') { 
                     MJ.typesetPromise([el]); 
                 } else if(tries<200) { 
                     setTimeout(()=>mjxTypeset(el,tries+1),25); 
                 }
             } catch(e) {
                 console.warn('MathJax typeset failed', e);
             }
         }

         /* Bidirectional sync between math-field and textarea/preview */
        const mf2=document.getElementById('mf2');
        let syncInProgress = false; // Prevent circular updates
        let lastRenderedReloadTs = 0;
        let lastRawClearTs = 0;
        let rawInputPreferred = false;
        let lastRawSelection = { start: 0, end: 0 };
        
        function getLatex(){
            try {
                return mf2 && typeof mf2.getValue === 'function' ? mf2.getValue('latex') : '';
            } catch (e) {
                return '';
            }
        }

        function isEffectivelyEmptyLatex(latex) {
            if (!latex || (typeof latex === 'string' && latex.trim() === '')) {
                return true;
            }
            let normalized = latex;
            if (typeof normalizeLatexStr === 'function') {
                try {
                    normalized = normalizeLatexStr(latex);
                } catch (_) {}
            }
            if (typeof normalized !== 'string') return false;
            const stripped = normalized.replace(/\s+/g, '');
            return stripped.length === 0;
        }

        function reloadRenderedInputField() {
            if (!mf2) return;
            const now = Date.now();
            if (now - lastRenderedReloadTs < 75) {
                return;
            }
            lastRenderedReloadTs = now;

            try {
                mf2.setValue('');
                if (typeof mf2.executeCommand === 'function') {
                    try { mf2.executeCommand('clearSelection'); } catch (_) {}
                }
                if (typeof scheduleMathFieldHeightRefresh === 'function') {
                    scheduleMathFieldHeightRefresh();
                }
                requestAnimationFrame(focusMathFieldIfAllowed);
            } catch (err) {
                console.warn('Failed to reload rendered input field:', err);
            }
        }

        /* ---------- Ace Editor for Raw LaTeX + Preview ---------- */
        let aceEditor = null;
        const previewBox = document.getElementById('latex-preview-box');
        let previewRenderTimeout = null;

        function initAceEditor() {
            const aceDiv = document.getElementById('ace-editor');
            if (!aceDiv || typeof ace === 'undefined') {
                console.warn('Ace Editor not available');
                return;
            }
            try {
            aceEditor = ace.edit('ace-editor', {
                mode: 'ace/mode/latex',
                fontSize: 15,
                showPrintMargin: false,
                showGutter: false,
                wrap: true,
                tabSize: 4,
                useSoftTabs: true,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                minLines: 5,
                maxLines: 25,
            });
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            aceEditor.setTheme(isDark ? 'ace/theme/monokai' : 'ace/theme/textmate');
            aceEditor.container.style.borderRadius = '8px';
            aceEditor.container.style.border = '1px solid var(--color-border)';
            aceEditor.container.style.fontFamily = "'JetBrains Mono', 'Fira Code', monospace";
            aceEditor.container.style.marginTop = '6px';
            applyAceTheme();
            } catch (e) {
                console.error('Ace Editor initialization failed:', e);
            }
        }

        function applyAceTheme() {
            if (!aceEditor) return;
            const dark = document.documentElement.getAttribute('data-theme') === 'dark';
            aceEditor.setTheme(dark ? 'ace/theme/monokai' : 'ace/theme/textmate');
            const bg = dark ? '#1f2937' : '#ffffff';
            // Override Monokai background to match site theme
            let styleEl = document.getElementById('ace-bg-fix');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'ace-bg-fix';
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = `
                #ace-editor.ace_editor, #ace-editor .ace_scroller, #ace-editor .ace_content {
                    background: ${bg} !important;
                }
            `;
        }
        window.__syncAceTheme = applyAceTheme;

        function clearRawLatexInput() {
            const now = Date.now();
            if (now - lastRawClearTs < 75) return;
            lastRawClearTs = now;
            if (aceEditor) {
                aceEditor.setValue('', -1);
                renderPreview('');
            }
        }

        function syncFromMathLive() {
            if (syncInProgress) return;
            syncInProgress = true;
            const rawLatex = getLatex();
            const isEmpty = isEffectivelyEmptyLatex(rawLatex);
            const latexToSend = isEmpty ? '' : rawLatex;
            if (isEmpty) { clearRawLatexInput(); }
            if (aceEditor && aceEditor.getValue() !== latexToSend) {
                aceEditor.setValue(latexToSend, -1);
                renderPreview(latexToSend);
            }
            setTimeout(() => { syncInProgress = false; }, 50);
        }

        function syncFromTextArea() {
            if (syncInProgress) return;
            syncInProgress = true;
            const latex = aceEditor ? aceEditor.getValue() : '';
            if (mf2 && typeof latex === 'string') {
                try {
                    mf2.setValue(latex);
                    if (isEffectivelyEmptyLatex(latex)) { reloadRenderedInputField(); }
                    scheduleMathFieldHeightRefresh();
                } catch (e) { console.warn('Failed to update math-field:', e); }
            }
            setTimeout(() => { syncInProgress = false; }, 50);
        }

        if (mf2) {
            mf2.addEventListener('input', syncFromMathLive);
            mf2.addEventListener('focus', () => { rawInputPreferred = false; });
        }

        function tryInitAceEditor() {
            if (typeof ace !== 'undefined' && document.getElementById('ace-editor')) {
                initAceEditor();
                if (aceEditor) {
                    aceEditor.on('change', () => {
                        if (!syncInProgress) {
                            syncFromTextArea();
                            renderPreview(aceEditor.getValue());
                        }
                    });
                    aceEditor.on('focus', () => {
                        rawInputPreferred = true;
                    });
                    // Initial sync from MathLive if it has content
                    try {
                        const mfLatex = getLatex();
                        if (mfLatex && !isEffectivelyEmptyLatex(mfLatex)) {
                            aceEditor.setValue(mfLatex, -1);
                            renderPreview(mfLatex);
                        }
                    } catch (e) {
                        console.warn('Initial sync from MathLive failed:', e);
                    }
                }
                return true;
            }
            return false;
        }
        if (!tryInitAceEditor()) {
            let aceAttempts = 0;
            const aceInterval = setInterval(() => {
                aceAttempts++;
                if (tryInitAceEditor() || aceAttempts > 100) {
                    clearInterval(aceInterval);
                }
            }, 50);
        }

        // Preview rendering
        const EMPTY_MESSAGE = '';
        const ERROR_MESSAGE = '<span style="color: #e74c3c;">Unable to render this LaTeX yet. Check for missing braces or arguments.</span>';

        const stripDelimiters = (latex) => {
            let trimmed = latex.trim();
            if (!trimmed) return { latex: '', display: true };
            const startsWith = (delim) => trimmed.startsWith(delim);
            const endsWith = (delim) => trimmed.endsWith(delim);
            if (startsWith('\\[') && endsWith('\\]')) return { latex: trimmed.slice(2, -2).trim(), display: true };
            if (startsWith('457') && endsWith('457')) return { latex: trimmed.slice(2, -2).trim(), display: true };
            if (startsWith('\\(') && endsWith('\\)')) return { latex: trimmed.slice(2, -2).trim(), display: false };
            if (startsWith('$') && endsWith('$') && trimmed.length > 1) return { latex: trimmed.slice(1, -1).trim(), display: false };
            return { latex: trimmed, display: true };
        };

        const enhanceEmptyArguments = (latex) => {
            return latex
                .replace(/\frac\s*\{\s*\}\s*\{\s*\}/g, '\frac{\color{#b0b0b0}{\square}}{\color{#b0b0b0}{\square}}')
                .replace(/\frac\s*\{\s*\}/g, '\frac{\color{#b0b0b0}{\square}}')
                .replace(/\sqrt\s*\{\s*\}/g, '\sqrt{\color{#b0b0b0}{\square}}')
                .replace(/\sqrt\s*\[\s*\]\s*\{\s*\}/g, '\sqrt[\color{#b0b0b0}{\square}]{\color{#b0b0b0}{\square}}');
        };

        function renderPreview(latex) {
            if (!previewBox) return;
            previewBox.innerHTML = '';
            if (!latex || latex.trim() === '') { previewBox.innerHTML = EMPTY_MESSAGE; return; }
            const { latex: strippedLatex } = stripDelimiters(latex);
            const latexForRender = enhanceEmptyArguments(strippedLatex);
            if (!latexForRender) { previewBox.innerHTML = EMPTY_MESSAGE; return; }

            const renderWithMathJax = () => {
                try {
                    const MJ = window.MathJax;
                    if (!MJ) return false;
                    const options = typeof MJ.getMetricsFor === 'function' ? MJ.getMetricsFor(previewBox) : {};
                    const baseScale = 0.88;
                    options.scale = typeof options.scale === 'number' ? options.scale * baseScale : baseScale;
                    options.display = true;
                    if (typeof MJ.texReset === 'function') MJ.texReset();
                    const attachRenderedNode = (node) => {
                        if (!node) return;
                        const element = node.firstElementChild || node;
                        if (!element) return;
                        if (element.setAttribute) element.setAttribute('display', 'block');
                        element.style.margin = '0 auto';
                        element.style.display = 'block';
                        element.style.width = 'auto';
                        element.style.maxWidth = '100%';
                        previewBox.appendChild(element);
                    };
                    if (typeof MJ.tex2svgPromise === 'function') {
                        return MJ.tex2svgPromise(latexForRender, options).then((node) => {
                            previewBox.innerHTML = '';
                            attachRenderedNode(node);
                        });
                    }
                    if (typeof MJ.tex2svg === 'function') {
                        const node = MJ.tex2svg(latexForRender, options);
                        attachRenderedNode(node);
                        return Promise.resolve();
                    }
                    return false;
                } catch (err) {
                    console.warn('MathJax rendering error:', err);
                    return Promise.reject(err);
                }
            };

            const fallbackRender = () => {
                const safe = latexForRender.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                previewBox.innerHTML = `<div style="color: #888; font-size: 14px; text-align: center;">\\[${safe}\\]</div>`;
            };

            const renderer = renderWithMathJax();
            if (renderer && typeof renderer.then === 'function') {
                renderer.catch(() => { previewBox.innerHTML = ERROR_MESSAGE; });
            } else if (renderer === false) {
                fallbackRender();
            }
        }

        const schedulePreviewRender = (latex) => {
            if (previewRenderTimeout) clearTimeout(previewRenderTimeout);
            previewRenderTimeout = setTimeout(() => renderPreview(latex), 200);
        };

        function render(){ syncFromMathLive(); }

        function insertIntoRawLatexTextarea(snippet) {
            if (!aceEditor) return false;
            aceEditor.insert(snippet);
            aceEditor.focus();
            rawInputPreferred = true;
            return true;
        }

        function guardToolbarFocus(element) {
            if (!element) return;
            element.addEventListener('mousedown', (event) => {
                if (rawInputPreferred) event.preventDefault();
            });
        }

        function focusRawLatexInput() {
            if (!aceEditor) return;
            aceEditor.focus();
            rawInputPreferred = true;
        }

        function focusMathFieldIfAllowed() {
            if (!mf2 || rawInputPreferred) return;
            try { mf2.focus({ preventScroll: true }); } catch (_) {}
        }

        function insertLatex(x){
            if (rawInputPreferred && insertIntoRawLatexTextarea(x)) {
                return;
            }
            try{
                if(mf2.executeCommand){ mf2.executeCommand('insert', x); }
                else if(mf2.insert){ mf2.insert(x); }
                else { mf2.value = (mf2.value||'') + x; }
            }catch(e){}
            syncFromMathLive();
            focusMathFieldIfAllowed();
        }

        // Inline env-button handlers
        (function(){
            const arrayStarBtn = document.getElementById('array-star-btn');
            const alignBtn = document.getElementById('align-btn');
            const largeBtn = document.getElementById('large-btn');
            const clearBtn = document.getElementById('clear-latex-btn');

            if (arrayStarBtn) {
                arrayStarBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (!aceEditor) return;
                    const pos = aceEditor.getCursorPosition();
                    aceEditor.insert('\\begin{array}{c}\n  \n\\end{array}');
                    aceEditor.moveCursorTo(pos.row + 1, 2);
                    aceEditor.focus();
                    rawInputPreferred = true;
                });
            }
            if (alignBtn) {
                alignBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (!aceEditor) return;
                    const pos = aceEditor.getCursorPosition();
                    aceEditor.insert('\\begin{align*}\n  \n\\end{align*}');
                    aceEditor.moveCursorTo(pos.row + 1, 2);
                    aceEditor.focus();
                    rawInputPreferred = true;
                });
            }
            if (largeBtn) {
                largeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (!aceEditor) return;
                    aceEditor.insert('\\large ');
                    aceEditor.focus();
                    rawInputPreferred = true;
                });
            }
            if (clearBtn) {
                clearBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (!aceEditor) return;
                    aceEditor.setValue('', -1);
                    renderPreview('');
                });
            }

            // Click-to-copy labels
            const rawLabel = document.getElementById('raw-latex-label');
            if (rawLabel) {
                rawLabel.title = 'Click to copy LaTeX';
                rawLabel.addEventListener('click', () => {
                    const latex = aceEditor ? aceEditor.getValue() : '';
                    if (latex) copyToClipboard(latex, 'LaTeX');
                    else showToast('No LaTeX to copy');
                });
            }
            const previewLabel = document.getElementById('latex-preview-label');
            if (previewLabel) {
                previewLabel.title = 'Click to copy LaTeX';
                previewLabel.addEventListener('click', () => {
                    const latex = aceEditor ? aceEditor.getValue() : '';
                    if (latex) copyToClipboard(latex, 'LaTeX');
                    else showToast('No LaTeX to copy');
                });
            }
        })();

        
        /* ========== Event Listener Setup ========== */
        
        // Click on "Rendered Input (Editable)" label to copy LaTeX
        const renderedInputLabel = document.querySelector('label[for="mf2"]');
        if (renderedInputLabel) {
            renderedInputLabel.style.cursor = 'pointer';
            renderedInputLabel.addEventListener('click', () => {
                const latex = getLatex();
                if (latex) {
                    copyToClipboard(latex, 'LaTeX');
                } else {
                    showToast('No LaTeX to copy');
                }
            });
        }
        
        // MathLive input changes → sync to Raw LaTeX
        mf2.addEventListener('input', syncFromMathLive);
        
        // Note: inline textarea listener is already set up in the block above
        
        // Paste event for MathLive (rendered input)
        mf2.addEventListener('paste', () => {
            // Wait for MathLive to process the pasted content
            setTimeout(() => {
                syncFromMathLive();
                
                // Adjust height multiple times to ensure proper sizing
                if (typeof adjustMathFieldHeight === 'function') {
                    requestAnimationFrame(() => {
                        adjustMathFieldHeight();
                        setTimeout(adjustMathFieldHeight, 100);
                        setTimeout(adjustMathFieldHeight, 300);
                        setTimeout(adjustMathFieldHeight, 500);
                    });
                }
            }, 10);
        });
        
        // Click-to-copy functionality removed from Rendered Input bar
        // Only the label is clickable for copying
        
        // Listen for module loading completion and trigger initial sync
        window.addEventListener('e2ModulesReady', () => {
            console.log('🔄 Modules ready, performing initial sync');
            if (mf2 && typeof mf2.getValue === 'function' && mf2.getValue()) {
                syncFromMathLive();
            }
        });
        
        // Also try initial sync after a delay (in case modules are already loaded)
        setTimeout(() => {
            if (window.e2ModulesLoaded && mf2 && typeof mf2.getValue === 'function' && mf2.getValue()) {
                syncFromMathLive();
            }
        }, 500);

        /* ---------- Cleanup: delete object when all boxes emptied ---------- */
        function normalizeLatexStr(L) {
            try {
                const EMPTY_SLOT = String.raw`\s*`;
                const EMPTY_BRACE = String.raw`\{${EMPTY_SLOT}\}`;
                const SPACING_CMDS = String.raw`(?:\\:|\\,|\\;|\\!|\\quad|\\qquad)`;
                const EMPTY_CONTENT = String.raw`(?:${EMPTY_SLOT}|${SPACING_CMDS})*`;
                L = L.replace(new RegExp(String.raw`\\frac${EMPTY_BRACE}${EMPTY_BRACE}`, "g"), "");
                L = L.replace(new RegExp(String.raw`\\sqrt${EMPTY_BRACE}`, "g"), "");
                L = L.replace(new RegExp(String.raw`\\sqrt\[${EMPTY_SLOT}\]${EMPTY_BRACE}`, "g"), "");
                L = L.replace(new RegExp(String.raw`\\(dot|ddot)${EMPTY_BRACE}`, "g"), "");
                const rm = (open, close) => new RegExp(String.raw`\\left\s*${open}${EMPTY_SLOT}\\right\s*${close}`, 'g');
                L = L.replace(rm('\\(', '\\)'), "");
                L = L.replace(rm('\\[', '\\]'), "");
                L = L.replace(rm('\\{', '\\\\}'), "");
                L = L.replace(rm('\\|', '\\|'), "");
                L = L.replace(new RegExp(String.raw`\\int_${EMPTY_BRACE}\^${EMPTY_BRACE}${EMPTY_CONTENT}(?:d[a-zA-Z]+)?`, "g"), "");
                L = L.replace(new RegExp(String.raw`\\int\s*${EMPTY_CONTENT}(?:d[a-zA-Z]+)?(?![_^])`, "g"), "");
                L = L.replace(new RegExp(String.raw`\\lim_\{x\\to\s*${EMPTY_SLOT}\}${EMPTY_SLOT}`, "g"), "");
                L = L.replace(new RegExp(String.raw`\\lim_${EMPTY_BRACE}${EMPTY_SLOT}`, "g"), "");
                L = L.replace(new RegExp(String.raw`\\begin\{pmatrix\}(?:${EMPTY_SLOT}|&|\\\\|\s)*\\end\{pmatrix\}`, "g"), '');
                L = L.replace(new RegExp(String.raw`\\begin\{align\*?\}(?:${EMPTY_SLOT}|&|\\\\|\s)*\\end\{align\*?\}`, "g"), '');
                L = L.replace(new RegExp(String.raw`\\begin\{array\}(?:\{[^}]*\})?(?:${EMPTY_SLOT}|&|\\\\|\s)*\\end\{array\}`, "g"), '');
                L = L.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (match, body) => {
                    const stripped = body
                        .replace(new RegExp(String.raw`\\int_${EMPTY_BRACE}\^${EMPTY_BRACE}`, "g"), '')
                        .replace(new RegExp(String.raw`\\int\s*${EMPTY_SLOT}?`, "g"), '')
                        .replace(/d[a-zA-Z]+/g, '')
                        .replace(/\\:|\\,|\\;|\\!|\\quad|\\qquad/g, '')
                        .replace(/&|\\\\/g, '')
                        .replace(/\s+/g, '');
                    return stripped.length === 0 ? '' : match;
                });
            } catch (e) {
                console.warn('normalizeLatexStr normalization failed', e);
            }
            return L;
        }

        function cleanupEmptyStructures(){ try{ const b=mf2.getValue('latex')||''; if(typeof normalizeLatexStr === 'function'){ const a=normalizeLatexStr(b); if(a!==b){ mf2.setValue(a); syncFromMathLive(); } } }catch(e){console.warn('cleanup failed',e)} }
        
        function configureMathLive() {
            if (!window.MathfieldElement || !mf2) return;
            
            /* ============================================
               MATHLIVE CONFIGURATION
               Matching: https://mathlive.io/mathfield/demo/
               Documentation: https://cortexjs.io/mathlive/guides/integration/
               GitHub: https://github.com/arnog/mathlive
               ============================================ */
            
            // Core math rendering settings
            mf2.mathModeSpace = '\\:';              // Use \: for spaces in math mode
            mf2.letterShapeStyle = 'tex';           // Use TeX letter shapes (italic variables)
            mf2.smartMode = false;                  // Disable automatic text/math mode switching
            mf2.smartFence = true;                  // Auto-scale parentheses/brackets
            mf2.removeExtraneousParentheses = true; // Clean up unnecessary parentheses
            
            // Disable all built-in keypress sounds (https://mathlive.io/mathfield/guides/customizing/#sounds-and-haptic-feedback)
            mf2.keypressSound = null;
            
            // Virtual keyboard configuration
            mf2.virtualKeyboardMode = 'manual';     // Don't auto-show virtual keyboard
            
            // UI customization - disable unwanted features
            mf2.inlineShortcutToolbar = false;      // No inline shortcut suggestions
            try { mf2.menuItems = []; } catch(_) {} // Disable context menu
            
            // Disable tooltips completely
            try {
                mf2.virtualKeyboardContainer = null;
                // Override any tooltip display mechanism
                if (window.MathfieldElement) {
                    window.MathfieldElement.showTooltip = () => {};
                }
            } catch(_) {}
            
            // Keybindings - filter out text mode commands
            mf2.keybindings = [
                { key: 'Enter', command: 'complete' },
                { key: 'Return', command: 'complete' },
                { key: 'Tab', command: 'complete' },
                ...mf2.keybindings.filter(kb => 
                    kb.command !== 'applyTextMode' && 
                    kb.command !== 'toggleMathTextMode' &&
                    !((kb.key === 'Enter' || kb.key === 'Return' || kb.key === 'Tab') && kb.command === 'complete')
                )
            ];
            
            // Inline shortcuts matching MathLive demo
            // Reference: https://mathlive.io/mathfield/reference/keybindings/
            mf2.inlineShortcuts = {
                'infty': '\\infty',
                'infin': '\\infty',
                '∞': '\\infty',
                'NN': '\\mathbb{N}',
                'ZZ': '\\mathbb{Z}',
                'QQ': '\\mathbb{Q}',
                'RR': '\\mathbb{R}',
                'CC': '\\mathbb{C}',
                'PP': '\\mathbb{P}',
                'forall': '\\forall',
                'exists': '\\exists',
                '!exists': '\\nexists',
                '$': '\\char"24',
                '%': '\\%',
                '#': '\\#',
                'diamond': '\\diamond',
                'square': '\\square',
                'TT': '\\top',
                'nabla': '\\nabla',
                'grad': '\\nabla',
                'del': '\\partial',
                'partial': '\\partial',
                '∆': '\\differentialD',
                'dx': '\\differentialD x',
                'dy': '\\differentialD y',
                'dt': '\\differentialD t',
                'aleph': '\\aleph',
                'arcsin': '\\sin^{-1}\\placeholder{}',
                'arccos': '\\cos^{-1}\\placeholder{}',
                'arctan': '\\tan^{-1}\\placeholder{}',
                'arccot': '\\cot^{-1}\\placeholder{}',
                'arcsec': '\\sec^{-1}\\placeholder{}',
                'arccsc': '\\csc^{-1}\\placeholder{}',
                'sin': '\\sin\\placeholder{}',
                'sinh': '\\sinh\\placeholder{}',
                'cos': '\\cos\\placeholder{}',
                'cosh': '\\cosh\\placeholder{}',
                'tan': '\\tan\\placeholder{}',
                'tanh': '\\tanh\\placeholder{}',
                'sec': '\\sec\\placeholder{}',
                'csc': '\\csc\\placeholder{}',
                'cot': '\\cot\\placeholder{}',
                'log': '\\log_{\\placeholder{}}\\placeholder{}',
                'ln': '\\ln',
                'exp': '\\exp',
                'lim': '\\lim_{x\\to\\placeholder{}} \\placeholder{}',
                'det': '\\det',
                'mod': '\\mod',
                'max': '\\max',
                'min': '\\min',
                'erf': '\\operatorname{erf}',
                'erfc': '\\operatorname{erfc}',
                'bessel': '\\operatorname{bessel}',
                'mean': '\\operatorname{mean}',
                'median': '\\operatorname{median}',
                'fft': '\\operatorname{fft}',
                'lcm': '\\operatorname{lcm}',
                'gcd': '\\operatorname{gcd}',
                'randomReal': '\\operatorname{randomReal}',
                'randomInteger': '\\operatorname{randomInteger}',
                'Re': '\\operatorname{Re}',
                'Im': '\\operatorname{Im}',
                '!=': '\\ne',
                '>=': '\\ge',
                '<=': '\\le',
                '<<': '\\ll',
                '>>': '\\gg',
                '~~': '\\approx',
                '?=': '\\questeq',
                ':=': '\\coloneq',
                '::': '\\Colon',
                '-=': '\\equiv',
                '~=': '\\cong',
                'lt=': '\\leq',
                'gt=': '\\geq',
                '-lt': '\\prec',
                '-<=': '\\preceq',
                '->=': '\\succeq',
                'prop': '\\propto',
                '*': '\\cdot',
                '**': '\\ast',
                '***': '\\star',
                '&&': '\\land',
                'in': '\\in',
                '!in': '\\notin',
                'xx': '\\times',
                '+-': '\\pm',
                '÷': '\\div',
                '(-)': '\\odot',
                '(+)': '\\oplus',
                '(/)': '\\oslash',
                'ox': '\\otimes',
                '@': '\\circ',
                '><': '\\ltimes',
                '^^': '\\wedge',
                '^^^': '\\bigwedge',
                'vv': '\\vee',
                'vvv': '\\bigvee',
                'nn': '\\cap',
                'nnn': '\\bigcap',
                'uu': '\\cup',
                'uuu': '\\bigcup',
                'setminus': '\\backslash',
                'sub': '\\subset',
                'sup': '\\supset',
                'sube': '\\subseteq',
                'supe': '\\supseteq',
                'and': '\\land',
                'or': '\\lor',
                'not': '\\neg',
                'implies': '\\Rightarrow',
                'iff': '\\Leftrightarrow',
                '__': '\\lfloor',
                '~': '\\sim',
                'perp': '\\perp',
                '⊥': '\\perp',
                'parallel': '\\parallel',
                '∥': '\\parallel',
                '{': '\\{',
                '}': '\\}',
                '(:': '\\langle',
                ':)': '\\rangle',
                'mm': '\\operatorname{mm}',
                'cm': '\\operatorname{cm}',
                'km': '\\operatorname{km}',
                'kg': '\\operatorname{kg}',
                '>->': '\\rightarrowtail',
                '->>': '\\twoheadrightarrow',
                '>->>': '\\twoheadrightarrowtail',
                '->': '\\to',
                '->...': '\\to\\cdots',
                '-->': '\\longrightarrow',
                '<--': '\\longleftarrow',
                '=>': '\\Rightarrow',
                '==>': '\\Longrightarrow',
                '<=>': '\\Leftrightarrow',
                '<->': '\\leftrightarrow',
                'uarr': '\\uparrow',
                'darr': '\\downarrow',
                'rarr': '\\rightarrow',
                'rArr': '\\Rightarrow',
                'larr': '\\leftarrow',
                'lArr': '\\Leftarrow',
                'harr': '\\leftrightarrow',
                'hArr': '\\Leftrightarrow',
                '--': '\\vdash',
                '==': '\\models',
                'alpha': '\\alpha',
                'beta': '\\beta',
                'gamma': '\\gamma',
                'Gamma': '\\Gamma',
                'delta': '\\delta',
                'Delta': '\\Delta',
                'epsilon': '\\epsilon',
                'varepsilon': '\\varepsilon',
                'zeta': '\\zeta',
                'eta': '\\eta ',
                'theta': '\\theta',
                'vartheta': '\\vartheta',
                'Theta': '\\Theta',
                'iota': '\\iota',
                'kappa': '\\kappa',
                'lambda': '\\lambda',
                'Lambda': '\\Lambda',
                'mu': '\\mu',
                'nu': '\\nu ',
                'xi': '\\xi',
                'Xi': '\\Xi',
                'pi': '\\pi',
                'Pi': '\\Pi',
                'rho': '\\rho',
                'sigma': '\\sigma',
                'Sigma': '\\Sigma',
                'tau': '\\tau',
                'upsilon': '\\upsilon',
                'phi': '\\phi',
                'varphi': '\\varphi',
                'Phi': '\\Phi',
                'chi': '\\chi',
                'psi': '\\psi',
                'Psi': '\\Psi',
                'Ω': '\\omega',
                'Omega': '\\Omega',
                '∫': '\\int',
                'int': '\\int_{\\placeholder{}}^{\\placeholder{}}\\placeholder{}\\: dx',
                'sum': '\\sum_{n=\\placeholder{}}^{\\placeholder{}}\\placeholder{}',
                'prod': '\\prod_{n=\\placeholder{}}^{\\placeholder{}}\\placeholder{}',
                'sqrt': '\\sqrt{\\placeholder{}}',
                'neg': '\\neg',
                'liminf': '\\operatorname*{lim~inf}_{}',
                'limsup': '\\operatorname*{lim~sup}_{}',
                'argmin': '\\operatorname*{arg~min}_{}',
                'argmax': '\\operatorname*{arg~max}_{}',
                '...': '\\ldots',
                ':.': '\\therefore'
            };


            // Spacebar inserts \: to standardize math spacing
            mf2.addEventListener('keydown', (ev) => {
                if (ev.key === ' ' && !ev.altKey && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey) {
                    ev.preventDefault();
                    try {
                        if (mf2.executeCommand) {
                            mf2.executeCommand('insert', '\\:');
                        } else if (mf2.insert) {
                            mf2.insert('\\:');
                        } else {
                            const current = mf2.value || '';
                            mf2.value = current + '\\:';
                        }
                    } catch (err) {
                        console.warn('Space insert failed:', err);
                    }
                    syncFromMathLive();
                }
            });

            // Typing behavior: allow free typing like Desmos (no auto-termination interception)

            // Protect navigation into fixed subscripts like \underset{\sim}{} (only main box editable)
            mf2.addEventListener('keydown', (ev) => {
                if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(ev.key)) return;

                const position = mf2.position;
                if (!mf2.model || typeof mf2.model.getPath !== 'function') return;
                const path = mf2.model.getPath(position);
                if (path.length < 2) return;

                const parent = path[path.length - 2];
                const branch = path[path.length - 1].branch;

                let isProtected = false;
                if (parent.type === 'underset' && parent.subscript?.length > 0) {
                    const subAtom = parent.subscript[0];
                    isProtected = subAtom.command === 'sim' || subAtom.value === '~';
                }

                if (isProtected) {
                    ev.preventDefault(); // Block entry into subscript
                    if (ev.key === 'ArrowDown' || (ev.key === 'ArrowRight' && position === parent.body[parent.body.length - 1].range.end)) {
                        // Skip over subscript, move to next element after structure
                        mf2.executeCommand('moveToNext');
                    } else if (ev.key === 'ArrowUp' || (ev.key === 'ArrowLeft' && position === parent.subscript[0].range.start)) {
                        // Skip back to before structure
                        mf2.executeCommand('moveToPrevious');
                    }
                }
            });

            // Redirect selection if it lands in protected subscript
            mf2.addEventListener('selection-did-change', () => {
                try {
                    const sel = mf2.selection;
                    if (!sel.isCollapsed) return;
                    const position = sel.start;
                    const path = mf2.model.getPath(position);
                    if (path.length < 2) return;
                    const parent = path[path.length - 2];
                    const branch = path[path.length - 1].branch;
                    if (parent.type === 'underset' && branch === 'subscript' && parent.subscript?.length > 0) {
                        const subAtom = parent.subscript[0];
                        if (subAtom.command === 'sim' || subAtom.value === '~') {
                            // Redirect to end of main body
                            mf2.position = parent.body[parent.body.length - 1].range.end;
                        }
                    }
                } catch (e) {
                    console.warn('Selection change handler error:', e);
                }
            });

            // Handle deletion of atomic structures like vectors
            function tryDeleteAtomicObject(direction = 'back') {
                try {
                    const S = '\uE000'; // Sentinel
                    mf2.executeCommand('insert', S);
                    const withSentinel = mf2.getValue('latex') || '';
                    mf2.executeCommand('undo');

                    const idx = withSentinel.indexOf(S);
                    if (idx === -1) return false;

                    const left = withSentinel.slice(0, idx);
                    const right = withSentinel.slice(idx + S.length);

                    const atomicPatternEnd = /\\underset\{\\sim\}\{[a-zA-Z]\}$/;
                    const atomicPatternStart = /^\\underset\{\\sim\}\{[a-zA-Z]\}/;

                    if (direction === 'back') {
                        const match = left.match(atomicPatternEnd);
                        if (match) {
                            mf2.setValue(left.slice(0, -match[0].length) + right);
                            return true;
                        }
                    } else if (direction === 'fwd') {
                        const match = right.match(atomicPatternStart);
                        if (match) {
                            mf2.setValue(left + right.slice(match[0].length));
                            return true;
                        }
                    }
                    return false;
                } catch (e) {
                    console.warn('Atomic deletion failed:', e);
                    return false;
                }
            }

            mf2.addEventListener('beforeinput', (ev) => {
                if (ev.inputType === 'deleteContentBackward' || ev.inputType === 'deleteContentForward') {
                    if (tryDeleteAtomicObject(ev.inputType === 'deleteContentBackward' ? 'back' : 'fwd')) {
                        ev.preventDefault();
                        syncFromMathLive();
                    }
                }
            });
        }
        
        /* ---------------- Toolbar and Tabs ---------------- */
        const tabs=[{id:'calc',label:'Calculus'},{id:'powers',label:'Powers'},{id:'trigs',label:'Trigs'},{id:'sym',label:'Symbols'},{id:'vec',label:'Vectors'},{id:'greek',label:'Greek'},{id:'complex',label:'Complex'},{id:'sets',label:'Sets'},{id:'special',label:'More'}];
        const tabRowConfig={};
        const allLetters=Array.from('abcdefghijklmnopqrstuvwxyz');
        
        // LaTeX to Unicode mapping for dropdown display
        const latexToUnicode = {
            '\\theta': 'θ',
            '\\alpha': 'α',
            '\\beta': 'β',
            '\\gamma': 'γ',
            '\\delta': 'δ',
            '\\lambda': 'λ',
            '\\mu': 'μ',
            '\\sigma': 'σ',
            '\\omega': '𝜔', // U+1D70E Mathematical Italic Small Omega
            '\\Omega': 'Ω',
            '\\Delta': 'Δ',
            'z': '𝑧', // U+1D467 Mathematical Italic Small Z
            '\\placeholder{}': '\u25a1' // empty square
        };
        
        function vectorKey(b,d,c){const a=c?c.concat(allLetters.filter(e=>!c.includes(e))):allLetters.slice();return{base:b,currentVar:d,insert:`${b}{${d}}`,display:`${b}{${d}}`,options:a,isSelectable:!0}}
        
        const buttonSyncGroups = {
            derivatives: {
                groupId: 'derivatives',
                buttons: []
            },
            complex: {
                groupId: 'complex',
                buttons: []
            }
        };

        const layouts={
            calc:[
                {display:'\\int_{\\placeholder{}}^{\\placeholder{}}\\placeholder{}\\;dx',insert:'\\int_{\\placeholder{}}^{\\placeholder{}}\\placeholder{}\\: dx'},
                {display:'\\int \\placeholder{}\\;dx', insert:'\\int \\placeholder{}\\: dx'},
                {display:'\\left.\\placeholder{}\\right|_{\\placeholder{}}^{\\placeholder{}}',insert:'\\left.\\placeholder{}\\right|_{\\placeholder{}}^{\\placeholder{}}'},
                {display:'\\lim_{x\\to\\placeholder{}} \\placeholder{}',insert:'\\lim_{x\\to\\placeholder{}} \\placeholder{}'},
                {display:'\\sum_{n=\\placeholder{}}^{\\placeholder{}}\\placeholder{}',insert:'\\sum_{n=\\placeholder{}}^{\\placeholder{}}\\placeholder{}'},
                {display:'\\prod_{n=\\placeholder{}}^{\\placeholder{}}\\placeholder{}',insert:'\\prod_{n=\\placeholder{}}^{\\placeholder{}}\\placeholder{}'},
                {display:'\\frac{d}{dx}(\\placeholder{})',insert:'\\frac{d}{dx}\\left(\\placeholder{}\\right)'}
            ],
            powers:[
                {display:'{\\placeholder{}}^{\\placeholder{}}',insert:'{\\placeholder{}}^{\\placeholder{}}'},
                {display:'{\\placeholder{}}^2',insert:'{\\placeholder{}}^2'},
                {display:'e^{\\placeholder{}}',insert:'e^{\\placeholder{}}'},
                {display:'\\lvert \\placeholder{} \\rvert',insert:'\\lvert \\placeholder{} \\rvert'},
                {display:'\\sqrt{\\placeholder{}}',insert:'\\sqrt{\\placeholder{}}', hint: 'root'},
                {display:'\\sqrt[\\placeholder{}]{\\placeholder{}}',insert:'\\sqrt[\\placeholder{}]{\\placeholder{}}', hint: 'root'},
                {display:'\\ln(\\placeholder{})',insert:'\\ln(\\placeholder{})'},
                {display:'\\log_{\\placeholder{}}\\placeholder{}',insert:'\\log_{\\placeholder{}}\\placeholder{}'}
            ],
            trigs:[{display:'\\sin\\placeholder{}',insert:'\\sin\\placeholder{}'},{display:'\\cos\\placeholder{}',insert:'\\cos\\placeholder{}'},{display:'\\tan\\placeholder{}',insert:'\\tan\\placeholder{}'},{display:'\\cot\\placeholder{}',insert:'\\cot\\placeholder{}'},{display:'\\sec\\placeholder{}',insert:'\\sec\\placeholder{}'},{display:'\\csc\\placeholder{}',insert:'\\csc\\placeholder{}'},{display:'\\sin^{-1}\\placeholder{}',insert:'\\sin^{-1}\\placeholder{}'},{display:'\\cos^{-1}\\placeholder{}',insert:'\\cos^{-1}\\placeholder{}'},{display:'\\tan^{-1}\\placeholder{}',insert:'\\tan^{-1}\\placeholder{}'},{display:'\\arcsin\\placeholder{}',insert:'\\arcsin\\placeholder{}'},{display:'\\arccos\\placeholder{}',insert:'\\arccos\\placeholder{}'},{display:'\\arctan\\placeholder{}',insert:'\\arctan\\placeholder{}'}],
            sym:[
                {display:'\\geq',insert:'\\geq'},
                {display:'\\leq',insert:'\\leq'},
                {display:'\\pm', insert:'\\pm'},
                {display:'\\angle', insert: '\\angle'},
                {display:'^{\\circ}', insert:'^{\\circ}',hint:'circ'},
                {display:'\\perp', insert:'\\perp'},
                {display:'\\parallel', insert:'\\parallel'},
                {display:'\\neg',insert:'\\neg'},
                {display:'\\exists',insert:'\\exists'},
                {display:'\\forall',insert:'\\forall'},
                {display:'\\infty',insert:'\\infty'},
                {display:'\\neq',insert:'\\neq'},
                {display:'\\approx',insert:'\\approx'},
                {display:'\\equiv',insert:'\\equiv'},
                {display:'\\to',insert:'\\to'},
                {display:'\\implies',insert:'\\implies'},
                {display:'\\iff',insert:'\\iff'},
                {display:'\\sim',insert:'\\sim'}
            ],

            vec:[
                vectorKey('\\vec','v',['v','u','w','r','a']),
                vectorKey('\\bar','z',['z','w','x','y','v','u']),
                {...vectorKey('\\dot','x',['x','y','z','r','v']), syncGroup: 'derivatives'},
                {...vectorKey('\\ddot','x',['x','y','z','r','a']), syncGroup: 'derivatives'},
                {display:'\\operatorname{proj}_{\\underset{\\sim}{\\placeholder{}}}\\underset{\\sim}{\\placeholder{}}',insert:'\\operatorname{proj}_{\\underset{\\sim}{\\placeholder{}}}\\underset{\\sim}{\\placeholder{}}'},
                {
                    isSelectable: true,
                    base: '\\underset{\\sim}',
                    currentVar: '\\placeholder{}',
                    insert: '\\underset{\\sim}{\\placeholder{}}',
                    display: '\\underset{\\sim}{\\placeholder{}}',
                    options: [
                        { value: '\\placeholder{}', text: '□' },
                        'a','b','c','u','v','w','r',
                        ...allLetters.filter(l => !['a','b','c','u','v','w','r'].includes(l))
                    ]
                },
                {display:'\\underset{\\sim}{i}',insert:'\\underset{\\sim}{i}'},
                {display:'\\underset{\\sim}{j}',insert:'\\underset{\\sim}{j}'},
                {display:'\\underset{\\sim}{k}',insert:'\\underset{\\sim}{k}'},
                {display:'\\begin{pmatrix} \\placeholder{} \\\\ \\placeholder{} \\end{pmatrix}',insert:'\\begin{pmatrix} \\placeholder{} \\\\ \\placeholder{} \\end{pmatrix}'},
                {display:'\\begin{pmatrix} \\placeholder{} \\\\ \\placeholder{} \\\\ \\placeholder{} \\end{pmatrix}',insert:'\\begin{pmatrix} \\placeholder{} \\\\ \\placeholder{} \\\\ \\placeholder{} \\end{pmatrix}'},
                {display:'\\overrightarrow{\\placeholder{}}',insert:'\\overrightarrow{\\placeholder{}}'}
            ],
            greek:[{display:'\\alpha',insert:'\\alpha'},{display:'\\beta',insert:'\\beta'},{display:'\\gamma',insert:'\\gamma'},{display:'\\delta',insert:'\\delta'},{display:'\\theta',insert:'\\theta'},{display:'\\lambda',insert:'\\lambda'},{display:'\\mu',insert:'\\mu'},{display:'\\sigma',insert:'\\sigma'},{display:'\\omega',insert:'\\omega'},{display:'\\Delta',insert:'\\Delta'}],
            complex:[
                {
                    isSelectable: true,
                    keyType: 'cis',
                    currentVar: '\\theta',
                    display: '\\operatorname{cis}(\\theta)',
                    insert: '\\operatorname{cis}(\\theta)',
                    options: [
                        { value: '\\theta', text: '𝜃' },
                        { value: '\\alpha', text: '𝛼' },
                        { value: '\\beta', text: '𝛽' },
                        { value: '\\gamma', text: '𝛾' }
                    ]
                },
                {
                    isSelectable: true,
                    keyType: 'cos-isin',
                    currentVar: '\\theta',
                    display: '\\cos{\\theta}+i\\sin{\\theta}',
                    insert: '\\cos{\\theta}+i\\sin{\\theta}',
                    options: [
                        { value: '\\theta', text: '𝜃' },
                        { value: '\\alpha', text: '𝛼' },
                        { value: '\\beta', text: '𝛽' },
                        { value: '\\gamma', text: '𝛾' }
                    ]
                },
                {
                    isSelectable: true,
                    keyType: 'modulus',
                    currentVar: 'z',
                    display: '|z|',
                    insert: '|z|',
                    options: [
                        { value: 'z', text: '𝑧' },
                        { value: '\\omega', text: '𝜔' },
                        { value: '\\placeholder{}', text: '□' }
                    ],
                    syncGroup: 'complex'
                },
                {
                    isSelectable: true,
                    keyType: 'arg',
                    currentVar: 'z',
                    display: 'arg(z)',
                    insert: 'arg(z)',
                    options: [
                        { value: 'z', text: '𝑧' },
                        { value: '\\omega', text: '𝜔' },
                        { value: '\\placeholder{}', text: '□' }
                    ],
                    syncGroup: 'complex'
                },
                {
                    isSelectable: true,
                    keyType: 'conjugate',
                    currentVar: 'z',
                    display: '\\overline{z}',
                    insert: '\\overline{z}',
                    options: [
                        { value: 'z', text: '𝑧' },
                        { value: '\\omega', text: '𝜔' },
                        { value: '\\placeholder{}', text: '□' }
                    ],
                    syncGroup: 'complex'
                },
                {
                    isSelectable: true,
                    keyType: 'real',
                    currentVar: 'z',
                    display: 'Re(z)',
                    insert: 'Re(z)',
                    options: [
                        { value: 'z', text: '𝑧' },
                        { value: '\\omega', text: '𝜔' },
                        { value: '\\placeholder{}', text: '□' }
                    ],
                    syncGroup: 'complex'
                },
                {
                    isSelectable: true,
                    keyType: 'imaginary',
                    currentVar: 'z',
                    display: 'Im(z)',
                    insert: 'Im(z)',
                    options: [
                        { value: 'z', text: '𝑧' },
                        { value: '\\omega', text: '𝜔' },
                        { value: '\\placeholder{}', text: '□' }
                    ],
                    syncGroup: 'complex'
                }
                
            ],
            sets:[{display:'\\in',insert:'\\in'},{display:'\\mathbb{Z}',insert:'\\mathbb{Z}'},{display:'\\mathbb{Z}^+',insert:'\\mathbb{Z}^+'},{display:'\\mathbb{N}',insert:'\\mathbb{N}'},{display:'\\mathbb{Q}',insert:'\\mathbb{Q}'},{display:'\\mathbb{R}',insert:'\\mathbb{R}'},{display:'\\mathbb{C}',insert:'\\mathbb{C}'}],
            special:[
                {display:'\\boxed{\\placeholder{}}',insert:'\\boxed{\\placeholder{}}'},
                {display:'f(x) = \\begin{cases} \\placeholder{}, & x > \\placeholder{} \\\\ \\placeholder{}, & x \\leq \\placeholder{} \\end{cases}',insert:'f(x) = \\begin{cases} \\placeholder{}, & x > \\placeholder{} \\\\ \\placeholder{}, & x \\leq \\placeholder{} \\end{cases}'},
                {display:'f(x) = \\begin{cases} \\placeholder{}, & x > \\placeholder{} \\\\ \\placeholder{}, & x = \\placeholder{} \\\\ \\placeholder{}, & x < \\placeholder{} \\end{cases}',insert:'f(x) = \\begin{cases} \\placeholder{}, & x > \\placeholder{} \\\\ \\placeholder{}, & x = \\placeholder{} \\\\ \\placeholder{}, & x < \\placeholder{} \\end{cases}'}
            ]
        };

        // Curated layouts for toolbar
        const curatedLayouts = {
            calc: [
                { display: '\\int \\placeholder{}\\;dx', insert: '\\int \\placeholder{}\\: dx' },
                { display: '\\int_{\\placeholder{}}^{\\placeholder{}}\\placeholder{}\\;dx', insert: '\\int_{\\placeholder{}}^{\\placeholder{}}\\placeholder{}\\: dx' },
                { display: '\\left.\\placeholder{}\\right|_{\\placeholder{}}^{\\placeholder{}}', insert: '\\left.\\placeholder{}\\right|_{\\placeholder{}}^{\\placeholder{}}' },
                { display: '\\sum_{n=\\placeholder{}}^{\\placeholder{}}\\placeholder{}', insert: '\\sum_{n=\\placeholder{}}^{\\placeholder{}}\\placeholder{}' },
                { display: '\\prod_{n=\\placeholder{}}^{\\placeholder{}}\\placeholder{}', insert: '\\prod_{n=\\placeholder{}}^{\\placeholder{}}\\placeholder{}' }
            ],
            powers: [
                { display: '{\\placeholder{}}^{\\placeholder{}}', insert: '{\\placeholder{}}^{\\placeholder{}}' },
                { display: '{\\placeholder{}}^2', insert: '{\\placeholder{}}^2' },
                { display: 'e^{\\placeholder{}}', insert: 'e^{\\placeholder{}}' },
                { display: '\\lvert \\placeholder{} \\rvert', insert: '\\lvert \\placeholder{} \\rvert' },
                { display: '\\sqrt{\\placeholder{}}', insert: '\\sqrt{\\placeholder{}}' },
                { display: '\\sqrt[\\placeholder{}]{\\placeholder{}}', insert: '\\sqrt[\\placeholder{}]{\\placeholder{}}' }
            ],
            sym: [
                { display: '\\geq', insert: '\\geq' },
                { display: '\\leq', insert: '\\leq' },
                { display: '~', insert: '~', renderMode: 'text' },
                { display: '^{\\circ}', insert:'^{\\circ}', hint: 'circ' },
                { display: '\\neg', insert: '\\neg' },
                { display: '\\exists', insert: '\\exists' },
                { display: '\\forall', insert: '\\forall' },
                { display: '\\infty', insert: '\\infty' }
            ],
            vec: [
                {
                    isSelectable: true,
                    base: '\\underset{\\sim}',
                    currentVar: '\\placeholder{}',
                    insert: '\\underset{\\sim}{\\placeholder{}}',
                    display: '\\underset{\\sim}{\\placeholder{}}',
                    options: [
                        { value: '\\placeholder{}', text: '□' },
                        'a','b','c','u','v','w','r'
                    ].concat(allLetters.filter(l => !['a','b','c','u','v','w','r'].includes(l)))
                },
                { display: '\\begin{pmatrix} \\placeholder{} \\\\ \\placeholder{} \\end{pmatrix}', insert: '\\begin{pmatrix} \\placeholder{} \\\\ \\placeholder{} \\end{pmatrix}' },
                { display: '\\begin{pmatrix} \\placeholder{} \\\\ \\placeholder{} \\\\ \\placeholder{} \\end{pmatrix}', insert: '\\begin{pmatrix} \\placeholder{} \\\\ \\placeholder{} \\\\ \\placeholder{} \\end{pmatrix}' },
                { display: '\\overrightarrow{\\placeholder{}}', insert: '\\overrightarrow{\\placeholder{}}' }
            ],
            greek: [
                { display: '\\alpha', insert: '\\alpha' },
                { display: '\\beta', insert: '\\beta' },
                { display: '\\gamma', insert: '\\gamma' },
                { display: '\\theta', insert: '\\theta' },
                { display: '\\lambda', insert: '\\lambda' },
                { display: '\\mu', insert: '\\mu' },
                { display: '\\sigma', insert: '\\sigma' }
            ],
            complex: [
                {
                    isSelectable: true,
                    keyType: 'cos-isin',
                    currentVar: '\\theta',
                    display: '\\cos{\\theta}+i\\sin{\\theta}',
                    insert: '\\cos{\\theta}+i\\sin{\\theta}',
                    options: [
                        { value: '\\theta', text: '𝜃' },
                        { value: '\\alpha', text: '𝛼' },
                        { value: '\\beta', text: '𝛽' },
                        { value: '\\gamma', text: '𝛾' }
                    ].concat(allLetters)
                },
                {
                    isSelectable: true,
                    keyType: 'modulus',
                    currentVar: 'z',
                    display: '|z|',
                    insert: '|z|',
                    options: [
                        { value: 'z', text: '𝑧' },
                        { value: '\\omega', text: '𝜔' },
                        { value: '\\placeholder{}', text: '□' }
                    ].concat(allLetters.filter(l => !['z'].includes(l))),
                    syncGroup: 'complex'
                },
                {
                    isSelectable: true,
                    keyType: 'arg',
                    currentVar: 'z',
                    display: 'arg(z)',
                    insert: 'arg(z)',
                    options: [
                        { value: 'z', text: '𝑧' },
                        { value: '\\omega', text: '𝜔' },
                        { value: '\\placeholder{}', text: '□' }
                    ].concat(allLetters.filter(l => !['z'].includes(l))),
                    syncGroup: 'complex'
                },
            ],
            sets: [
                { display: '\\in', insert: '\\in' },
                { display: '\\mathbb{N}', insert: '\\mathbb{N}' },
                { display: '\\mathbb{Z}', insert: '\\mathbb{Z}' },
                { display: '\\mathbb{Q}', insert: '\\mathbb{Q}' },
                { display: '\\mathbb{R}', insert: '\\mathbb{R}' }
            ],
            special: [
                { display: '\\boxed{\\placeholder{}}', insert: '\\boxed{\\placeholder{}}' },
                { display: 'f(x) = \\begin{cases} \\placeholder{}, & x > \\placeholder{} \\\\ \\placeholder{}, & x \\leq \\placeholder{} \\end{cases}', insert: 'f(x) = \\begin{cases} \\placeholder{}, & x > \\placeholder{} \\\\ \\placeholder{}, & x \\leq \\placeholder{} \\end{cases}' },
                { display: 'f(x) = \\begin{cases} \\placeholder{}, & x > \\placeholder{} \\\\ \\placeholder{}, & x = \\placeholder{} \\\\ \\placeholder{}, & x < \\placeholder{} \\end{cases}', insert: 'f(x) = \\begin{cases} \\placeholder{}, & x > \\placeholder{} \\\\ \\placeholder{}, & x = \\placeholder{} \\\\ \\placeholder{}, & x < \\placeholder{} \\end{cases}' }
            ]
        };


        function buildTabs(){
            const tabsContainer=document.getElementById('tabs');
            tabsContainer.innerHTML='';
            tabs.forEach(tabInfo=>{
                const tabEl=document.createElement('button');
                tabEl.type='button';
                tabEl.className='tab';
                tabEl.textContent=tabInfo.label;
                tabEl.dataset.tabId=tabInfo.id;
                const activateTab = () => {
                    pinnedTabId = tabInfo.id;
                    toggleExpand(tabInfo.id);
                };

                tabEl.addEventListener('click', activateTab);
                tabEl.addEventListener('mouseenter', activateTab);
                
                tabsContainer.appendChild(tabEl);
            });
            const tabEls=Array.from(tabsContainer.querySelectorAll('.tab'));
            tabEls.forEach((tabEl,index)=>{
                tabEl.addEventListener('keydown',(event)=>handleTabKeyNavigation(event,index,tabEls));
            });
            
            // Add mouseleave functionality to hide expanded list when cursor moves away from the entire hover area
            const expArea = document.getElementById('expanded-area');
            
            // Create a single hover area that includes both tabs and expanded area
            const hoverArea = document.createElement('div');
            hoverArea.className = 'hover-area';
            hoverArea.style.position = 'relative';
            hoverArea.style.display = 'block';
            hoverArea.style.width = '100%';
            
            // Move tabs container and expanded area into the hover area
            const parent = tabsContainer.parentNode;
            parent.insertBefore(hoverArea, tabsContainer);
            hoverArea.appendChild(tabsContainer);
            hoverArea.appendChild(expArea);
            hoverArea.addEventListener('mouseleave', () => {
                if (pinnedTabId) {
                    toggleExpand(pinnedTabId);
                }
            });

            syncTabHighlight();
        }

        function handleTabKeyNavigation(event,currentIndex,tabEls){
            const { key } = event;
            if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(key)){
                event.preventDefault();
                const direction = (key==='ArrowLeft'||key==='ArrowUp') ? -1 : 1;
                const nextIndex = (currentIndex + direction + tabEls.length) % tabEls.length;
                tabEls[nextIndex].focus();
                return;
            }
            if(key===' ' || key==='Enter'){
                event.preventDefault();
                tabEls[currentIndex].click();
            }
        }

        function renderMathInPlace(element){
            if(!element || !element.dataset) return;
            const latex = element.dataset.math;
            if(!latex) return;

            const renderMode = element.dataset.renderMode || 'math';
            if(renderMode === 'text'){
                element.textContent = latex;
                element.classList.add('math-display-text');
                return;
            }

            element.classList.remove('math-display-text');

            let latexForRender = latex;
            if(latex.includes('\\placeholder')){
                // Fix stubborn boxes: keep placeholders inside \underset{\sim}{...} at text size
                latexForRender = latexForRender.replace(/\\underset\\{\\sim\\}\\{\\placeholder\\{\\}\\}/g, '\\underset{\\sim}{\\square}');
                // Force remaining placeholders to a constant size regardless of script level
                latexForRender = latexForRender.replace(/\\placeholder\{\}/g, '{\\displaystyle\\square}');
            }

            if (window.MathJax && window.MathJax.tex2svgPromise) {
                window.MathJax.tex2svgPromise(latexForRender).then(node => {
                    const svg = node.querySelector('svg');
                    if (svg) {
                        element.innerHTML = '';
                        const wrapper = document.createElement('span');
                        wrapper.className = 'math-render';
                        wrapper.appendChild(svg);
                        element.appendChild(wrapper);
                    }
                }).catch(err => console.warn('MathJax tex2svg failed:', err));
            } else {
                element.textContent = latex;
                element.classList.add('math-display-text');
            }
        }


        // Convert regular lowercase letters to Mathematical Italic Unicode characters (v2)
        function toMathItalic(char) {
            if (typeof char !== 'string' || char.length !== 1) return char;
            const code = char.charCodeAt(0);
            // Only convert basic Latin lowercase letters (a-z)
            if (code >= 0x61 && code <= 0x7A) {
                // Special case: 'h' uses Planck constant symbol for better font support
                if (char === 'h') return '\u210E'; // ℎ (Planck constant)
                // a-z: U+0061 to U+007A -> U+1D44E to U+1D467
                return String.fromCodePoint(0x1D44E + (code - 0x61));
            }
            return char;
        }

        function formatSelectOptionLabel(value, providedText){
            if(typeof providedText==='string' && providedText.trim().length>0){
                return providedText;
            }
            if(typeof value==='string'){
                // Don't convert if it's already a Unicode symbol (Greek, placeholder, etc.)
                const code = value.charCodeAt(0);
                const isBasicLatin = code >= 0x61 && code <= 0x7A; // a-z only
                
                // Convert only single lowercase Latin letters to math italic Unicode
                if (value.length === 1 && isBasicLatin) {
                    return toMathItalic(value);
                }
                return value;
            }
            return String(value);
        }

        function syncButtonGroup(groupId, newValue, sourceButton) {
            const group = buttonSyncGroups[groupId];
            if (!group) return;
            
            group.buttons.forEach(buttonData => {
                if (buttonData === sourceButton) return;
                
                buttonData.currentVar = newValue;
                
                if (buttonData.keyType === 'modulus') {
                    buttonData.insert = `|${newValue}|`;
                    buttonData.display = `|${newValue}|`;
                } else if (buttonData.keyType === 'arg') {
                    buttonData.insert = `arg(${newValue})`;
                    buttonData.display = `arg(${newValue})`;
                } else if (buttonData.keyType === 'conjugate') {
                    buttonData.insert = `\\overline{${newValue}}`;
                    buttonData.display = `\\overline{${newValue}}`;
                } else if (buttonData.keyType === 'real') {
                    buttonData.insert = `Re(${newValue})`;
                    buttonData.display = `Re(${newValue})`;
                } else if (buttonData.keyType === 'imaginary') {
                    buttonData.insert = `Im(${newValue})`;
                    buttonData.display = `Im(${newValue})`;
                } else if (buttonData.base) {
                    buttonData.insert = `${buttonData.base}{${newValue}}`;
                    buttonData.display = `${buttonData.base}{${newValue}}`;
                }
                
                const buttonElement = buttonData.element;
                if (buttonElement) {
                    const selector = buttonElement.querySelector('.selector');
                    const mathContent = buttonElement.querySelector('.math-display');
                    
                    if (selector) {
                        selector.value = newValue;
                    }
                    
                    if (mathContent) {
                        mathContent.dataset.math = buttonData.display;
                        renderMathInPlace(mathContent);
                    }
                }
            });
        }
        
        function registerButtonToSyncGroup(buttonData, element) {
            if (buttonData.syncGroup) {
                buttonData.element = element;
                buttonSyncGroups[buttonData.syncGroup].buttons.push(buttonData);
            }
        }

        function createKeyElement(d){
            if(d.isSelectable){
                const key=document.createElement('button');
                key.type='button';
                key.className='key has-selector';
                key.tabIndex=-1;

                const mathContent=document.createElement('div');
                mathContent.className='math-display';
                mathContent.dataset.math=d.display;
                // Always render with MathJax unless explicitly requested as text
                mathContent.dataset.renderMode = d.renderMode || 'math';
                const selector=document.createElement('select');
                selector.className='selector';

                d.options.forEach(opt=>{
                    const optionEl=document.createElement('option');
                    let val, txt;
                    if(typeof opt==='object' && opt.value!==undefined){
                        val = opt.value;
                        txt = opt.text;
                    } else {
                        val = opt;
                        txt = undefined;
                    }
                    optionEl.value = val;
                    optionEl.textContent = formatSelectOptionLabel(val, txt);
                    if(val === d.currentVar) optionEl.selected = true;
                    selector.appendChild(optionEl);
                });

                ['click','mousedown','touchstart'].forEach(eventType=>{
                    selector.addEventListener(eventType, event=>event.stopPropagation(), { capture:true });
                });

                selector.addEventListener('change', event=>{
                    d.currentVar=event.target.value;
                    const currentVal=d.currentVar;

                    if(d.keyType==='cis'){
                        d.insert=`\\operatorname{cis}(${currentVal})`;
                        d.display=`\\operatorname{cis}(${currentVal})`;
                    }else if(d.keyType==='cos-isin'){
                        d.insert=`\\cos(${currentVal})+i\\sin(${currentVal})`;
                        d.display=d.insert;
                    }else if(d.keyType==='modulus'){
                        d.insert=`|${currentVal}|`;
                        d.display=`|${currentVal}|`;
                    }else if(d.keyType==='arg'){
                        d.insert=`arg(${currentVal})`;
                        d.display=`arg(${currentVal})`;
                    }else if(d.keyType==='conjugate'){
                        d.insert=`\\overline{${currentVal}}`;
                        d.display=`\\overline{${currentVal}}`;
                    }else if(d.keyType==='real'){
                        d.insert=`Re(${currentVal})`;
                        d.display=`Re(${currentVal})`;
                    }else if(d.keyType==='imaginary'){
                        d.insert=`Im(${currentVal})`;
                        d.display=`Im(${currentVal})`;
                    }else{
                        d.insert=`${d.base}{${currentVal}}`;
                        d.display=`${d.base}{${currentVal}}`;
                    }
                    
                    mathContent.dataset.math=d.display;
                    if(d.renderMode){
                        mathContent.dataset.renderMode = d.renderMode;
                    }else{
                        mathContent.dataset.renderMode = 'math';
                    }
                    
                    if(d.syncGroup) {
                        syncButtonGroup(d.syncGroup, currentVal, d);
                    }
                    
                renderMathInPlace(mathContent);
                focusMathFieldIfAllowed();
                setTimeout(focusMathFieldIfAllowed, 0);
                });

                mathContent.textContent=d.display;
                guardToolbarFocus(key);
                key.addEventListener('click', event=>{ if(event.target!==selector) insertLatex(d.insert); });

                // Add hover expansion functionality
                key.addEventListener('mouseenter', () => {
                    // Find which tab this key belongs to and expand it
                    const expArea = document.getElementById('expanded-area');
                    if (expArea && expArea.getAttribute('data-tab-id')) {
                        const currentTabId = expArea.getAttribute('data-tab-id');
                        // Always expand the tab when hovering over a key
                        toggleExpand(currentTabId);
                    }
                });

                key.appendChild(mathContent);
                key.appendChild(selector);
                renderMathInPlace(mathContent);
                
                registerButtonToSyncGroup(d, key);
                
                return key;
            }

            const key=document.createElement('button');
            key.type='button';
            key.className='key';
            key.tabIndex=-1;
            const mathSpan=document.createElement('span');
            mathSpan.className='math-display';
            mathSpan.dataset.math=d.display;
            if(d.renderMode){
                mathSpan.dataset.renderMode = d.renderMode;
            }else{
                mathSpan.dataset.renderMode = 'math';
            }
            mathSpan.textContent=d.display;
            key.appendChild(mathSpan);
            guardToolbarFocus(key);
            key.addEventListener('click',()=>insertLatex(d.insert));
            
            // Add hover expansion functionality
            key.addEventListener('mouseenter', () => {
                // Find which tab this key belongs to and expand it
                const expArea = document.getElementById('expanded-area');
                if (expArea && expArea.getAttribute('data-tab-id')) {
                    const currentTabId = expArea.getAttribute('data-tab-id');
                    // Always expand the tab when hovering over a key
                    toggleExpand(currentTabId);
                }
            });
            
            renderMathInPlace(mathSpan);
            return key;
        }


        let currentExpandedTab = null;
        let pinnedTabId = null;
        function syncTabHighlight(){
            document.querySelectorAll('#tabs .tab').forEach(tabEl=>{
                const tabId=tabEl.dataset.tabId;
                const isExpanded=currentExpandedTab===tabId;
                tabEl.setAttribute('data-expanded', isExpanded ? 'true' : 'false');
            });
        }
        function toggleExpand(id) {
            const expArea = document.getElementById('expanded-area');
            if (!expArea) return;
            if (currentExpandedTab === id && expArea.childElementCount) {
                return;
            }

            expArea.innerHTML = '';
            expArea.setAttribute('data-tab-id', id);
            const layoutItems = layouts[id] ?? [];
            const rowCount = tabRowConfig[id] || 1;
            const perRow = Math.max(1, Math.ceil(layoutItems.length / rowCount) || layoutItems.length || 1);

            // Add keys directly to expanded area for horizontal grid layout
            layoutItems.forEach((item, itemIndex) => {
                const keyEl = createKeyElement(item);
                expArea.appendChild(keyEl);
            });
            const columnCount = Math.max(layoutItems.length, 1);
            expArea.style.setProperty('--expanded-columns', columnCount);
            currentExpandedTab = id;
            syncTabHighlight();
            
            // Typeset the newly created buttons with proper timing
            setTimeout(() => {
                typesetMathElements();
            }, 100);
            
            // Additional typeset after a longer delay to ensure MathJax is ready
            setTimeout(() => {
                typesetMathElements();
            }, 500);

            // Ensure math field remains active after interacting with tabs
            focusMathFieldIfAllowed();
            setTimeout(focusMathFieldIfAllowed, 0);
        }
        
        buildTabs(); // Build tabs early
        if (tabs.length) {
            pinnedTabId = tabs[0].id;
            toggleExpand(pinnedTabId);
        }

        /* ---------------- Load MathLive ---------------- */
        // Reference: https://cortexjs.io/mathlive/guides/integration/
        // Official demo: https://mathlive.io/mathfield/demo/
        async function loadMathLive(){
            const sources = {
                coreCss: ['https://unpkg.com/mathlive/dist/mathlive-fonts.css', 'https://cdn.jsdelivr.net/npm/mathlive/dist/mathlive-fonts.css'],
                css: ['https://unpkg.com/mathlive/dist/mathlive-static.css', 'https://cdn.jsdelivr.net/npm/mathlive/dist/mathlive-static.css'],
                js: ['https://unpkg.com/mathlive', 'https://cdn.jsdelivr.net/npm/mathlive']
            };
            let loaded = false;
            let coreCssLoaded = false;
            let cssLoaded = false;
            let jsLoaded = false;

            // Load core CSS
            for (const url of sources.coreCss) {
                try {
                    await new Promise((resolve, reject) => {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = url;
                        link.onload = () => resolve();
                        link.onerror = () => reject();
                        document.head.appendChild(link);
                    });
                    coreCssLoaded = true;
                    break;
                } catch (e) {
                }
            }
            if (!coreCssLoaded) {
                console.warn('Failed to load core CSS from all sources');
            }

            // Load main CSS
            for (const url of sources.css) {
                try {
                    await new Promise((resolve, reject) => {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = url;
                        link.onload = () => resolve();
                        link.onerror = () => reject();
                        document.head.appendChild(link);
                    });
                    cssLoaded = true;
                    break;
                } catch (e) {
                }
            }
            if (!cssLoaded) {
                console.warn('Failed to load main CSS from all sources');
            }

            // Load JavaScript
            for (const url of sources.js) {
                try {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = url;
                        script.defer = true;
                        script.onload = () => resolve();
                        script.onerror = () => reject();
                        document.head.appendChild(script);
                    });
                    jsLoaded = true;
                    loaded = true;
                    break;
                } catch (e) {
                }
            }
            if (!jsLoaded) {
                console.warn('Failed to load MathLive JS from all sources');
            }

            if (!loaded) {
                console.warn('MathLive failed to load completely');
            }

            return loaded;
        }

        async function waitForMathFieldDefinition(){
            try{
                if(window.customElements && typeof customElements.whenDefined==='function'){
                    await customElements.whenDefined('math-field');
                }
            }catch(e){ console.warn('math-field definition wait failed', e); }
        }

        function typesetMathElements(){
            const mathElements=document.querySelectorAll('.math-display');
            mathElements.forEach(renderMathInPlace);
        }

        (async()=>{
            const loaded=await loadMathLive();
            await waitForMathFieldDefinition();
            
            // Wait for MathJax to be ready
            if (window.MathJax && window.MathJax.startup) {
                await window.MathJax.startup.promise;
            }
            
            // Initial typeset of any existing elements
            typesetMathElements();
            
            if(loaded && window.MathfieldElement){
                configureMathLive();
                
                // Mark MathLive as ready - this will make it visible
                if (mf2) {
                    mf2.classList.add('mathlive-ready');
                    
                    // Check if we can hide the loading screen now
                    if (typeof checkAndHideLoadingScreen === 'function') {
                        checkAndHideLoadingScreen();
                    }
                }
                
                // Set initial focus to mathfield (if user not in raw input)
                focusMathFieldIfAllowed();
                
                // Note: Input event listener is already attached at line ~2820
            }
            
            // Ensure buttons are properly typeset after a short delay
            setTimeout(() => {
                typesetMathElements();
            }, 500);
            
            // Additional typeset after MathJax is fully ready
            setTimeout(() => {
                typesetMathElements();
            }, 1000);
        })();

        function showToast(msg = 'Copied!') {
          const toast = document.getElementById('toast');
          if (!toast) return;
          toast.textContent = msg;
          toast.classList.add('show');
          clearTimeout(showToast._t);
          showToast._t = setTimeout(() => toast.classList.remove('show'), 1600);
        }

        /* ---------------- Copy buttons ---------------- */
        async function getMathMLFromLatex(latex) {
          if (typeof window.convertLatexToMathML !== 'function') {
            throw new Error('MathML converter unavailable');
          }
          let mathml = await window.convertLatexToMathML(latex);
          if (!mathml) {
            throw new Error('MathML conversion produced empty output');
          }
          if (typeof window.fixNaryOperatorsMathML === 'function') {
            mathml = window.fixNaryOperatorsMathML(mathml);
          }
          if (typeof window.fixArrowAccentsMathML === 'function') {
            mathml = window.fixArrowAccentsMathML(mathml);
          }
          if (typeof window.fixOverbarMathML === 'function') {
            mathml = window.fixOverbarMathML(mathml);
          }
          return mathml.trim();
        }

        async function copyMathMLFromEditor() {
          const latex = getLatex();
          if (!latex) {
            showToast('No LaTeX to copy');
            return;
          }
          try {
            const mathml = await getMathMLFromLatex(latex);
            await copyToClipboard(mathml, 'MathML');
          } catch (error) {
            console.error('MathML copy failed:', error);
            showToast('MathML copy failed');
          }
        }

        async function copyToClipboard(a, b) {
          const label = b || 'text';
          let ok = false;
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(a);
              ok = true;
            }
          } catch (c) {
            // fall through to legacy path
          }
          if (!ok) {
            const d = document.createElement('textarea');
            d.value = a;
            d.setAttribute('readonly', '');
            d.style.position = 'fixed';
            d.style.left = '-9999px';
            document.body.appendChild(d);
            d.select();
            try {
              document.execCommand('copy');
              ok = true;
            } catch (c) {
              ok = false;
            } finally {
              document.body.removeChild(d);
            }
          }

          showToast(ok ? `Copied ${label} ✓` : 'Copy failed');
        }
        const copyButton = document.getElementById('copyBtn');
        if (copyButton) {
          copyButton.addEventListener('click', () => {
            const latex = getLatex();
            if (latex) {
              copyToClipboard(latex, 'LaTeX');
            } else {
              showToast('No LaTeX to copy');
            }
          });
          copyButton.addEventListener('mouseenter', () => {
            const expArea = document.getElementById('expanded-area');
            if (expArea && expArea.getAttribute('data-tab-id')) {
              const currentTabId = expArea.getAttribute('data-tab-id');
              toggleExpand(currentTabId);
            }
          });
        }


        // Functions Help Modal
        const functionsBtn = document.getElementById('functionsBtn');
        const functionsModal = document.getElementById('functionsModal');
        const functionsModalClose = document.getElementById('functionsModalClose');
        const functionsModalOverlay = functionsModal?.querySelector('.functions-modal-overlay');

        function openFunctionsModal() {
          if (functionsModal) {
            functionsModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            // Re-initialize lucide icons in modal
            if (typeof lucide !== 'undefined') {
              lucide.createIcons();
            }
          }
        }

        function closeFunctionsModal() {
          if (functionsModal) {
            functionsModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
          }
        }

        if (functionsBtn) {
          functionsBtn.addEventListener('click', openFunctionsModal);
        }

        if (functionsModalClose) {
          functionsModalClose.addEventListener('click', closeFunctionsModal);
        }

        if (functionsModalOverlay) {
          functionsModalOverlay.addEventListener('click', closeFunctionsModal);
        }

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && functionsModal && functionsModal.getAttribute('aria-hidden') === 'false') {
            closeFunctionsModal();
            }
        });
        
        // 插入文本到光标位置的辅助函数
        function insertAtCursor(textarea, textToInsert) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const before = text.substring(0, start);
            const after = text.substring(end, text.length);
            textarea.value = before + textToInsert + after;
            textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
            textarea.focus();
            // 触发输入事件以更新预览
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }

        function scheduleMathFieldHeightRefresh() {
            if (typeof adjustMathFieldHeight !== 'function') return;
            const safeAdjust = () => {
                try {
                    adjustMathFieldHeight();
                } catch (err) {
                    console.warn('Mathfield height adjust failed:', err);
                }
            };
            const runner = () => {
                safeAdjust();
                setTimeout(safeAdjust, 120);
                setTimeout(safeAdjust, 320);
            };
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(runner);
            } else {
                runner();
            }
        }

        function adjustMathFieldHeight() {
            if (!mf2) return;

            const MIN_HEIGHT = 60;
            const EXTRA_PADDING = 24;
            const previousHeight = mf2.style.height;

            let targetHeight = MIN_HEIGHT;

            try {
                mf2.style.height = 'auto';

                const contentElement = mf2.shadowRoot?.querySelector('.ML__content');
                if (contentElement) {
                    targetHeight = contentElement.scrollHeight + EXTRA_PADDING;
                } else {
                    targetHeight = mf2.scrollHeight || MIN_HEIGHT;
                }
            } catch (e) {
                targetHeight = mf2.scrollHeight || MIN_HEIGHT;
            }

            targetHeight = Math.max(MIN_HEIGHT, Math.ceil(targetHeight));

            try {
                mf2.style.height = targetHeight + 'px';
            } catch (e) {
                mf2.style.height = previousHeight || '';
            }
        }
        
        if (mf2) {
            mf2.addEventListener('input', scheduleMathFieldHeightRefresh);
            
            scheduleMathFieldHeightRefresh();
            
            setTimeout(scheduleMathFieldHeightRefresh, 200);
            setTimeout(scheduleMathFieldHeightRefresh, 500);
        }
        

        document.addEventListener('DOMContentLoaded', () => {
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

    /**
     * MathML: normalize piecewise definitions so the left brace stretches.
     * Rule: { + <mtable> + (optional closing <mo>)  =>  <mfenced open="{" close=""><mtable/></mfenced>
     * Idempotent: running multiple times does nothing after first pass.
     */
    (function () {
      function isEl(n, name) {
        return n && n.nodeType === 1 && n.localName === name;
      }
      function isBraceMo(n) {
        return isEl(n, 'mo') && (n.textContent || '').trim() === '{';
      }
      function isEmptyMo(n) {
        // Many inputs have an empty <mo ...></mo> as a "closing" fence placeholder
        return isEl(n, 'mo') && (n.textContent || '').trim() === '';
      }
      function alreadyMfencedOpenLeft(el) {
        return isEl(el, 'mfenced')
          && el.getAttribute('open') === '{'
          && (el.getAttribute('close') || '') === '';
      }
      function normalizeContainer(container) {
        // We will scan child nodes looking for the pattern: {  <mtable>  [optional closing <mo>]
        const kids = Array.from(container.childNodes);
        for (let i = 0; i < kids.length; i++) {
          const k = kids[i];

          // Recurse into nested rows first
          if (isEl(k, 'mrow') || isEl(k, 'math')) {
            normalizeContainer(k);
          }

          // Skip if not a "{"
          if (!isBraceMo(k)) continue;

          // Next sibling must be an <mtable>
          const next = kids[i + 1];
          if (!isEl(next, 'mtable')) continue;

          // If the table is already inside the correct <mfenced>, skip
          if (alreadyMfencedOpenLeft(container)) continue;

          // Optional trailing closing <mo> (often empty or has fence attrs)
          const maybeClose = kids[i + 2];
          const hasTrailingMo = isEl(maybeClose, 'mo');

          // Build <mfenced open="{" close="">
          const mf = container.ownerDocument.createElementNS('http://www.w3.org/1998/Math/MathML', 'mfenced');
          mf.setAttribute('open', '{');
          mf.setAttribute('close', '');

          // Move the <mtable> inside <mfenced> (preserve all attributes/children)
          mf.appendChild(next.cloneNode(true));

          // Replace the sequence in the DOM:
          // remove the old nodes in order: {, <mtable>, (optional trailing <mo>)
          // then insert <mfenced> at the position of the "{"
          // We'll do in-place edits to avoid reflows on big docs.
          const insertionPoint = k; // original "{"
          // Remove <mtable> and optional closing <mo>
          container.removeChild(next);
          if (hasTrailingMo) container.removeChild(maybeClose);
          // Replace the opening "{"
          container.replaceChild(mf, insertionPoint);

          // Because we cloned <mtable>, remove the original <mtable> that followed "{"
          // (already removed above). Now we've inserted <mfenced> with its own <mtable>.
          // Update the local kids snapshot around the new position.
          return normalizeContainer(container); // restart scanning this container
        }
      }

      function normalizeMath(root) {
        // Find all MathML roots and normalize them
        const mathNodes = root.querySelectorAll('math');
        mathNodes.forEach((math) => {
          // Walk all <mrow> and the <math> root itself, since some inputs omit <mrow>
          const rows = [math, ...math.querySelectorAll('mrow')];
          rows.forEach((row) => normalizeContainer(row));
        });
      }

      // Expose for dynamic content, but also run once on load.
      window.normalizePiecewiseBraces = normalizeMath;

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => normalizeMath(document));
      } else {
        normalizeMath(document);
      }
    })();

    // ========== Pure LaTeX Mode ==========
    (function() {
      const PURE_LATEX_KEY = 'pureLatexMode';
      const pureLatexSwitch = document.getElementById('pureLatexSwitch');
      const tabsWrapper = document.getElementById('tabs_wrapper');
      const expandedArea = document.getElementById('expanded-area');
      const renderedSection = document.querySelector('.io-rendered');
      
      let isPureLatexMode = localStorage.getItem(PURE_LATEX_KEY) === 'true';

      function updateSwitchState() {
        if (!pureLatexSwitch) return;
        pureLatexSwitch.checked = isPureLatexMode;
      }

      function applyPureLatexMode() {
        if (isPureLatexMode) {
          // Hide toolbar and rendered input
          if (tabsWrapper) tabsWrapper.style.display = 'none';
          if (expandedArea) expandedArea.style.display = 'none';
          if (renderedSection) renderedSection.style.display = 'none';
        } else {
          // Show everything
          if (tabsWrapper) tabsWrapper.style.display = '';
          if (expandedArea) expandedArea.style.display = '';
          if (renderedSection) renderedSection.style.display = '';
        }
        updateSwitchState();
        
        /* Pure LaTeX mode handled inline; no iframe to communicate with */
      }

      // Toggle Pure LaTeX mode
      if (pureLatexSwitch) {
        pureLatexSwitch.addEventListener('change', () => {
          isPureLatexMode = pureLatexSwitch.checked;
          localStorage.setItem(PURE_LATEX_KEY, isPureLatexMode);
          applyPureLatexMode();
        });
      }

      // Apply mode on page load
      applyPureLatexMode();
      
      /* iframe load listener removed – inline sections don't need it */
    })();

    // ========== Hide Header Mode ==========
    (function() {
      const HIDE_HEADER_KEY = 'hideHeaderMode';
      const HEADER_BTN_POSITION_KEY = 'showHeaderBtnPosition';
      const hideHeaderBtn = document.getElementById('hideHeaderBtn');
      const headerBar = document.querySelector('.header-bar');
      
      let isHeaderHidden = localStorage.getItem(HIDE_HEADER_KEY) === 'true';
      let isDragging = false;
      let dragOffset = { x: 0, y: 0 };

      function updateHeaderButtonState() {
        // No state to update for a simple button
      }

      function initDragFunctionality(btn) {
        // Load saved position
        const savedPosition = localStorage.getItem(HEADER_BTN_POSITION_KEY);
        if (savedPosition) {
          try {
            const pos = JSON.parse(savedPosition);
            if (pos.left && pos.left !== 'auto') {
              btn.style.left = pos.left;
              btn.style.right = 'auto';
            } else if (pos.right && pos.right !== 'auto') {
              btn.style.right = pos.right;
              btn.style.left = 'auto';
            }
            if (pos.top && pos.top !== 'auto') {
              btn.style.top = pos.top;
              btn.style.bottom = 'auto';
            } else if (pos.bottom && pos.bottom !== 'auto') {
              btn.style.bottom = pos.bottom;
              btn.style.top = 'auto';
            }
          } catch (e) {
            console.warn('Failed to load button position:', e);
          }
        }

        let dragStartPos = null;
        let hasMoved = false;
        const titleBar = btn.querySelector('.pip-title-bar');
        const contentBtn = btn.querySelector('.pip-content');

        // Drag functionality - only allow dragging from title bar
        const handleDragStart = (e) => {
          // Don't start dragging on right click or if clicking the content button
          if (e.button !== 0 || e.target.closest('.pip-content')) return;
          
          dragStartPos = { x: e.clientX, y: e.clientY };
          hasMoved = false;
          
          const rect = btn.getBoundingClientRect();
          dragOffset.x = e.clientX - rect.left;
          dragOffset.y = e.clientY - rect.top;
          
          e.preventDefault();
          e.stopPropagation();
        };

        // Allow dragging from title bar
        if (titleBar) {
          titleBar.addEventListener('mousedown', handleDragStart);
        }
        // Also allow dragging from the window itself (but not content button)
        btn.addEventListener('mousedown', handleDragStart);

        document.addEventListener('mousemove', (e) => {
          if (!dragStartPos) return;
          
          const moveDistance = Math.abs(e.clientX - dragStartPos.x) + Math.abs(e.clientY - dragStartPos.y);
          if (moveDistance > 5) {
            hasMoved = true;
            if (!isDragging) {
              isDragging = true;
              btn.classList.add('dragging');
            }
          }
          
          if (!isDragging) return;
          
          const maxX = window.innerWidth - btn.offsetWidth;
          const maxY = window.innerHeight - btn.offsetHeight;
          
          let left = e.clientX - dragOffset.x;
          let top = e.clientY - dragOffset.y;
          
          // Constrain to viewport
          left = Math.max(0, Math.min(left, maxX));
          top = Math.max(0, Math.min(top, maxY));
          
          btn.style.left = left + 'px';
          btn.style.top = top + 'px';
          btn.style.right = 'auto';
          btn.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
          if (isDragging) {
            btn.classList.remove('dragging');
            
            // Save position
            const position = {
              top: btn.style.top || 'auto',
              right: btn.style.right || 'auto',
              left: btn.style.left || 'auto',
              bottom: btn.style.bottom || 'auto'
            };
            localStorage.setItem(HEADER_BTN_POSITION_KEY, JSON.stringify(position));
          }
          
          const wasDragging = isDragging;
          isDragging = false;
          const wasMoved = hasMoved;
          dragStartPos = null;
          hasMoved = false;
        });
      }

      function applyHideHeaderMode() {
        if (!headerBar) return;
        
        if (isHeaderHidden) {
          // Hide header
          headerBar.style.display = 'none';
          // Add a simple eye icon button in top right corner
          let showHeaderBtn = document.getElementById('showHeaderBtn');
          if (!showHeaderBtn) {
            showHeaderBtn = document.createElement('button');
            showHeaderBtn.id = 'showHeaderBtn';
            showHeaderBtn.className = 'show-header-btn';
            showHeaderBtn.setAttribute('aria-label', 'Show Header');
            showHeaderBtn.type = 'button';
            
            // Create simple menu icon (smaller and less prominent)
            showHeaderBtn.innerHTML = `<i data-lucide="menu"></i>`;
            
            // Add click handler
            showHeaderBtn.addEventListener('click', () => {
              isHeaderHidden = false;
              localStorage.setItem(HIDE_HEADER_KEY, 'false');
              applyHideHeaderMode();
            });
            
            // Append to documentElement (html) instead of body to ensure it's at the top level
            (document.documentElement || document.body).appendChild(showHeaderBtn);
            
            // Initialize lucide icons
            if (window.initLucideIcons) {
              window.initLucideIcons();
            }
          }
          showHeaderBtn.style.display = 'flex';
        } else {
          // Show header
          headerBar.style.display = '';
          // Remove the picture-in-picture window completely
          const showHeaderBtn = document.getElementById('showHeaderBtn');
          if (showHeaderBtn) {
            showHeaderBtn.remove();
          }
        }
        updateHeaderButtonState();
      }

      // Toggle Hide Header mode
      if (hideHeaderBtn) {
        hideHeaderBtn.addEventListener('click', () => {
          isHeaderHidden = !isHeaderHidden;
          localStorage.setItem(HIDE_HEADER_KEY, isHeaderHidden);
          applyHideHeaderMode();
        });
      }

      // Apply mode on page load
      applyHideHeaderMode();
    })();

    // Hide loading screen once MathLive is loaded
    window.mathLiveReady = false;
    
    function checkAndHideLoadingScreen() {
      const loadingScreen = document.getElementById('loading-screen');
      const mf2 = document.getElementById('mf2');
      
      // Hide if MathLive is ready
      if (window.mathLiveReady && 
          loadingScreen && 
          mf2 && 
          mf2.classList.contains('mathlive-ready')) {
        setTimeout(() => {
          loadingScreen.classList.add('fade-out');
          setTimeout(() => {
            loadingScreen.remove();
          }, 500);
        }, 200);
      }
    }
    
    window.addEventListener('load', () => {
      window.mathLiveReady = true;
      checkAndHideLoadingScreen();
    });

