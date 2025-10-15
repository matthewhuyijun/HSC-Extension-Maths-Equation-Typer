/**
 * N-ary Operator Normalizer (Indefinite/Definite integrals first)
 *
 * Goal for this stage: given MathJax MathML like
 * <math><msubsup><mo>∫</mo><mrow><mi>b</mi></mrow><mrow><mi>a</mi></mrow></msubsup><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mi>d</mi><mi>x</mi></math>
 * produce
 * <math>
 *   <mrow>
 *     <msubsup>…</msubsup>
 *     <mrow> f(x) d x </mrow>
 *   </mrow>
 * </math>
 *
 * Notes:
 * - Only handles ∫ for now (exactly your test case). We'll expand later as needed.
 * - Idempotent: running on already-correct MathML should keep structure the same.
 */
(function(){
  'use strict';

  const MATHML_NS = 'http://www.w3.org/1998/Math/MathML';

  function parse(xml){
    const p = new DOMParser();
    const doc = p.parseFromString(xml, 'application/xml');
    const err = doc.querySelector('parsererror');
    if (err) throw new Error('Parse error: ' + err.textContent);
    return doc;
  }
  function serialize(doc){
    return new XMLSerializer().serializeToString(doc);
  }
  function isIgnorable(n){
    return !n || n.nodeType===8 || (n.nodeType===3 && /^\s*$/.test(n.textContent));
  }
  function nextSig(node){
    let c=node&&node.nextSibling; while(c&&isIgnorable(c)) c=c.nextSibling; return c;
  }
  function prevSig(node){
    let c=node&&node.previousSibling; while(c&&isIgnorable(c)) c=c.previousSibling; return c;
  }
  function isEl(n, name){ return n && n.nodeType===1 && n.localName===name; }

  function opSymbol(container){
    if (!container) return '';
    if (container.localName==='mo') return (container.textContent||'').trim();
    const first = container.firstElementChild;
    return first && first.localName==='mo' ? (first.textContent||'').trim() : '';
  }

  function normalizeIntegral(doc){
    const math = doc.querySelector('math') || doc.documentElement;
    let changed = false;

    const processNode = (node) => {
      const sym = opSymbol(node);
      if (sym !== '∫') return false;

      const parent = node.parentNode;
      if (!parent) return false;

      // Operand: everything after the operator node within the same parent
      let operand = nextSig(node);
      const toMove = [];
      for (let cur = operand; cur; cur = nextSig(cur)) { toMove.push(cur); }

      if (!operand || operand.localName !== 'mrow'){
        const row = doc.createElementNS(MATHML_NS, 'mrow');
        for (const n of toMove) row.appendChild(n);
        parent.insertBefore(row, node.nextSibling);
        operand = row;
        changed = true;
      }

      // If operator and operand are already wrapped together in a parent <mrow> with no other siblings, skip
      const before = prevSig(node);
      const after = nextSig(operand);
      const alreadyTight = parent.localName === 'mrow' && !before && !after;
      if (!alreadyTight) {
        const wrapper = doc.createElementNS(MATHML_NS, 'mrow');
        parent.insertBefore(wrapper, node);
        wrapper.appendChild(node);
        wrapper.appendChild(operand);
        changed = true;
      }
      return true;
    };

    const processLimitContainer = (container) => {
      const firstChild = container.firstElementChild;
      if (!firstChild || firstChild.localName !== 'mo') return false;
      const sym = (firstChild.textContent || '').trim();
      if (sym !== '∫') return false;

      const parent = container.parentNode;
      if (!parent) return false;

      // Collect operand siblings after the munderover/munder/mover
      let operand = nextSig(container);
      const toMove = [];
      for (let cur = operand; cur; cur = nextSig(cur)) { toMove.push(cur); }

      if (toMove.length === 0) return false; // No operand to wrap

      if (!operand || operand.localName !== 'mrow'){
        const row = doc.createElementNS(MATHML_NS, 'mrow');
        for (const n of toMove) row.appendChild(n);
        parent.insertBefore(row, container.nextSibling);
        operand = row;
        changed = true;
      }

      const before = prevSig(container);
      const after = nextSig(operand);
      const alreadyTight = parent.localName === 'mrow' && !before && !after;
      if (!alreadyTight) {
        const wrapper = doc.createElementNS(MATHML_NS, 'mrow');
        parent.insertBefore(wrapper, container);
        wrapper.appendChild(container);
        wrapper.appendChild(operand);
        changed = true;
      }
      return true;
    };

    // 0) Process limit-based containers (munderover, munder, mover) for integrals
    const limitContainers = Array.from(math.querySelectorAll('munderover, munder, mover'));
    limitContainers.forEach(processLimitContainer);

    // 1) Process container forms: <msubsup>, <msub>, <msup>
    const containers = Array.from(math.querySelectorAll('msubsup, msub, msup'));
    containers.forEach(processNode);

    // 2) Process standalone <mo> integrals only if not inside containers OR limit-based elements
    const mos = Array.from(math.querySelectorAll('mo'));
    mos.forEach(mo => {
      if ((mo.textContent || '').trim() !== '∫') return;
      // skip inner operator of containers AND limit-based elements
      if (mo.closest('msubsup, msub, msup, munderover, munder, mover')) return;
      processNode(mo);
    });

    return changed;
  }

  function normalizeSumAndProduct(doc){
    const math = doc.querySelector('math') || doc.documentElement;
    let changed = false;

    const processNode = (node) => {
      const sym = opSymbol(node);
      if (sym !== '∑' && sym !== '∏') return false;

      const parent = node.parentNode;
      if (!parent) return false;

      // For sums/products, same grouping approach: operator + following operand siblings
      let operand = nextSig(node);
      const toMove = [];
      for (let cur = operand; cur; cur = nextSig(cur)) { toMove.push(cur); }

      if (!operand || operand.localName !== 'mrow'){
        const row = doc.createElementNS(MATHML_NS, 'mrow');
        for (const n of toMove) row.appendChild(n);
        parent.insertBefore(row, node.nextSibling);
        operand = row;
        changed = true;
      }

      const before = prevSig(node);
      const after = nextSig(operand);
      const alreadyTight = parent.localName === 'mrow' && !before && !after;
      if (!alreadyTight) {
        const wrapper = doc.createElementNS(MATHML_NS, 'mrow');
        parent.insertBefore(wrapper, node);
        wrapper.appendChild(node);
        wrapper.appendChild(operand);
        changed = true;
      }
      return true;
    };

    const processLimitContainer = (container) => {
      const firstChild = container.firstElementChild;
      if (!firstChild || firstChild.localName !== 'mo') return false;
      const sym = (firstChild.textContent || '').trim();
      if (sym !== '∑' && sym !== '∏') return false;

      const parent = container.parentNode;
      if (!parent) return false;

      // Collect operand siblings after the munderover/munder/mover
      let operand = nextSig(container);
      const toMove = [];
      for (let cur = operand; cur; cur = nextSig(cur)) { toMove.push(cur); }

      if (toMove.length === 0) return false; // No operand to wrap

      if (!operand || operand.localName !== 'mrow'){
        const row = doc.createElementNS(MATHML_NS, 'mrow');
        for (const n of toMove) row.appendChild(n);
        parent.insertBefore(row, container.nextSibling);
        operand = row;
        changed = true;
      }

      const before = prevSig(container);
      const after = nextSig(operand);
      const alreadyTight = parent.localName === 'mrow' && !before && !after;
      if (!alreadyTight) {
        const wrapper = doc.createElementNS(MATHML_NS, 'mrow');
        parent.insertBefore(wrapper, container);
        wrapper.appendChild(container);
        wrapper.appendChild(operand);
        changed = true;
      }
      return true;
    };

    // Process limit-based containers (munderover, munder, mover)
    const limitContainers = Array.from(math.querySelectorAll('munderover, munder, mover'));
    limitContainers.forEach(processLimitContainer);

    // Process subscript/superscript container forms
    const containers = Array.from(math.querySelectorAll('msubsup, msub, msup'));
    containers.forEach(processNode);

    // Process standalone <mo> for ∑ and ∏ if not inside containers OR limit-based elements
    const mos = Array.from(math.querySelectorAll('mo'));
    mos.forEach(mo => {
      const t = (mo.textContent || '').trim();
      if (t !== '∑' && t !== '∏') return;
      // Skip if inside subscript/superscript containers OR inside munderover/munder/mover
      if (mo.closest('msubsup, msub, msup, munderover, munder, mover')) return;
      processNode(mo);
    });

    return changed;
  }

  function normalizeMathML(mathml){
    try{
      const doc = parse(mathml);
      const didInt = normalizeIntegral(doc);
      const didSigmaPi = normalizeSumAndProduct(doc);
      const did = !!(didInt || didSigmaPi);
      return { mathml: serialize(doc), didTransform: did };
    }catch(e){
      console.warn('n-ary normalizer error:', e);
      return { mathml, didTransform: false, error: String(e) };
    }
  }

  window.NaryOperatorNormalizer = { normalizeMathML, version: '0.1.0' };
})();


