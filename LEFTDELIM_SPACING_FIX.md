# Left Delimiter Spacing Fix

## Problem
Fractions followed by `\left(...\right)` delimiters were not getting proper spacing. For example:
- Input: `\frac{\partial}{\partial x}\left(\frac{\partial u}{\partial x}\right)`
- Expected: `∂/∂x (∂u/∂x)` (with space before opening paren)
- Actual (before fix): `∂/∂x(∂u/∂x)` (no space)

## Root Cause
The spacing logic in `ast-printer.js` was wrapped in a condition that checked if the current node's printed output was non-empty:

```javascript
if (i > 0 && printed && result.length > 0) {
    // spacing logic here
}
```

However, `\left` and `\right` are represented as `leftdelim` and `rightdelim` nodes that print as empty strings (since they're just markers). This caused the spacing logic to be completely skipped when processing these nodes.

## Solution
Changed the condition to allow spacing logic even when `printed` is empty:

```javascript
if (i > 0 && result.length > 0) {
    // spacing logic here
}
```

The existing spacing rule at line 317 already handled this case correctly:
```javascript
else if (prevIsFraction && (currIsGroup || (currIsLeftDelim && nextIsOpenParen))) {
    result.push(' ');
}
```

This rule adds a space when:
- Previous node is a fraction (`frac` type)
- AND current node is either:
  - A group node, OR
  - A `leftdelim` node followed by an opening parenthesis

## Files Changed
- `js/ast-printer.js` - Line 189: Removed the `printed` check from the spacing condition

## Testing
Created comprehensive test file: `test-leftdelim-spacing.html`

Test cases include:
1. ✅ Fraction followed by `\left(` - Main fix
2. ✅ Simple fraction with `\left...\right`
3. ✅ Simple fraction with regular parens (control)
4. ✅ Numeric fraction with `\left...\right`
5. ✅ Fraction with `\left|` delimiter
6. ✅ Fraction with `\left[` bracket
7. ✅ Fraction with `\left\{` brace

All tests pass! ✅

## Impact
This fix ensures proper spacing for all cases where fractions are followed by `\left` delimiters, which is common in mathematical expressions involving partial derivatives and other complex formulas.

## Example Transformations
| LaTeX | Output |
|-------|--------|
| `\frac{\partial}{\partial x}\left(\frac{\partial u}{\partial x}\right)` | `∂/∂x (∂u/∂x)` ✅ |
| `\frac{d}{dx}\left(x^2\right)` | `d/dx (x^2)` ✅ |
| `\frac{1}{2}\left(a+b\right)` | `1/2 (a+b)` ✅ |

