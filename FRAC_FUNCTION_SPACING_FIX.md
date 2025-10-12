# 分数后跟函数的间距修复

## 问题描述

当分数（`\frac` 或 `\tfrac`）后面紧跟数学函数（如 `\ln`, `\log`, `\sin` 等）时，输出中缺少空格。

### 示例

**LaTeX 输入：**
```latex
\int_{v_0^2}^{v^2}\frac{d(v^2)}{g-kv^2}=\Big[-\tfrac{1}{k}\ln|g-kv^2|\Big]_{v_0^2}^{v^2}
```

**期望输出：**
```
∫_(v_0 ^2)^(v^2)▒(d(v^2 ))/(g-kv^2)=[-1/k ln |g-kv^2 |]_(v_0 ^2) ^(v^2)
```

**修复前的输出：**
```
∫_(v_0 ^2)^(v^2)▒(d(v^2 ))/(g-kv^2)=[-1/kln |g-kv^2 |]_(v_0 ^2) ^(v^2)
```

注意：`1/k` 和 `ln` 之间缺少空格。

## 根本原因

在 `ast-printer.js` 的间距逻辑中：

1. 标准函数（如 `ln`, `log`, `sin` 等）在输出时会自动添加尾随空格（第 394-398 行）
2. 间距逻辑检测到当前节点是函数时（`currIsFunction` 为 true），会跳过添加前导空格（第 287 行）
3. 这导致分数和函数之间没有空格

### 代码分析

```javascript
// 第 394-398 行：函数输出时添加尾随空格
if (standardFunctions.includes(cmdName)) {
    let result = cmdName + ' ';  // 函数名后加空格
    if (ast.sub) result += '_' + printScriptArg(ast.sub) + ' ';
    if (ast.sup) result += '^' + printScriptArg(ast.sup, true) + ' ';
    return result;
}

// 第 202 行：检测当前是否为函数
const currIsFunction = /^(sin|cos|tan|...|ln|log|...) /.test(curr);

// 第 287 行：如果当前是函数，跳过整个间距逻辑块
} else if (!prevEndsWithSpace && !currIsFunction && ...) {
    // 间距逻辑
}
```

问题：当 `prevNode` 是分数且 `currNode` 是函数时，间距逻辑被完全跳过。

## 解决方案

在 `ast-printer.js` 第 287-336 行重构间距逻辑：

### 关键修改

1. **移除 `!currIsFunction` 条件**（第 287 行）
   - 原来：`} else if (!prevEndsWithSpace && !currIsFunction && !prevEndsWithEquals && !currStartsWithEquals) {`
   - 修改后：`} else if (!prevEndsWithSpace && !prevEndsWithEquals && !currStartsWithEquals) {`

2. **添加优先检查**（第 293-297 行）
   ```javascript
   if (prevIsFraction && currIsFunction) {
       if (window.DEBUG_AST) {
           console.log('  ✓ prevIsFraction && currIsFunction (e.g., 1/k ln)');
       }
       result.push(' ');
   }
   ```

3. **将其他逻辑放入 `else if (!currIsFunction)` 块**（第 298-335 行）
   - 这确保非函数的间距逻辑仍然正常工作
   - 函数的间距现在由上面的特殊检查处理

### 修复逻辑

原问题：
- 第 287 行的 `!currIsFunction` 条件导致整个间距块被跳过
- 即使我们在块内添加了 `prevIsFraction && currIsFunction` 检查，也永远不会执行

解决方案：
1. 移除外层的 `!currIsFunction` 条件
2. 首先检查 `prevIsFraction && currIsFunction`（添加空格）
3. 然后用 `else if (!currIsFunction)` 处理其他非函数情况
4. 这样分数+函数的组合会被正确处理，而其他情况保持不变

## 测试用例

创建了全面的测试套件 `test-frac-function-spacing.html`，包括：

1. ✓ `\tfrac{1}{k}\ln|g-kv^2|` → `1/k ln |g-kv^2|`
2. ✓ 完整积分表达式（用户提供的原始问题）
3. ✓ `\frac{1}{k}\ln|x|` → `1/k ln |x|`
4. ✓ `\frac{a}{b}\log x` → `a/b log x`
5. ✓ `\frac{1}{2}\sin x` → `1/2 sin x`
6. ✓ `\frac{1}{2}\cos\theta` → `1/2 cos θ`
7. ✓ `\frac{d}{dx}\exp(x)` → `d/dx exp (x)`
8. ✓ 多个分数和函数交替
9. ✓ 分数后跟括号（确保不影响现有功能）
10. ✓ 分数后跟 `\left(` （确保之前的修复仍然有效）
11. ✓ `\tfrac{1}{x}\max(a,b)` → `1/x max (a,b)`
12. ✓ `\frac{1}{n}\min\{a,b\}` → `1/n min {a,b}`

## 影响范围

### 受影响的函数
所有 `standardFunctions` 中定义的函数：
- 三角函数：`sin`, `cos`, `tan`, `csc`, `sec`, `cot`
- 双曲函数：`sinh`, `cosh`, `tanh`, `coth`
- 反三角函数：`arcsin`, `arccos`, `arctan`, `arccsc`, `arcsec`, `arccot`
- 对数函数：`ln`, `log`
- 其他：`exp`, `max`, `min`, `mod`

### 不影响的情况
- 分数后跟括号：仍然正常工作
- 分数后跟 `\left(`：之前的修复仍然有效
- 其他间距逻辑：不受影响

## 文件修改

- **修改：** `js/ast-printer.js`
  - 添加了新的间距条件（第 325-332 行）
  
- **新增测试文件：**
  - `test-tfrac-ln.html` - 基础测试
  - `test-issue-quick.html` - 快速验证原始问题
  - `test-frac-function-spacing.html` - 全面测试套件

## 验证

运行测试套件确认：
1. ✓ 所有新测试用例通过
2. ✓ 之前的 `test-leftdelim-spacing.html` 测试仍然通过
3. ✓ 没有引入回归问题

## 相关修复

此修复基于之前的修复：
- **LEFTDELIM_SPACING_FIX.md** - 修复了分数后跟 `\left(` 的间距问题

两个修复协同工作，确保分数后的间距在各种情况下都正确。

