# 🚀 快速开始指南

## 📦 项目结构

```
e2 typer AST/
├── index.html              ← 主应用（打开这个文件）
├── js/                     ← JavaScript 模块
│   ├── symbol-maps.js
│   ├── latex-parser.js
│   ├── ast-printer.js
│   ├── postprocessor.js
│   ├── latex-converter.js
│   ├── latex-utils.js
│   ├── app-bridge.js
│   └── main.js
├── test_modules.html       ← 测试页面
└── test_node.js            ← Node.js 测试
```

## 🎯 使用方法

### 1️⃣ 运行主应用

```bash
# 方法1: 使用 Python 本地服务器（推荐）
python3 -m http.server 8000
# 然后打开 http://localhost:8000/index.html

# 方法2: 直接用浏览器打开（可能有 CORS 问题）
open index.html
```

### 2️⃣ 运行测试

```bash
# 浏览器测试
open http://localhost:8000/test_modules.html

# Node.js 测试
node test_node.js
```

## 📝 主要功能

### LaTeX 转 Word 公式

在主应用中：
1. 在 MathLive 编辑器中输入数学公式
2. 或在 "Raw LaTeX Input" 中粘贴 LaTeX
3. Word 公式会自动出现在 "Word Equation" 框中
4. 点击复制按钮粘贴到 Word

### 支持的表达式

- ✅ 分数: `\frac{a}{b}` → `(a)/(b)`
- ✅ 根号: `\sqrt{x}` → `√(x)`
- ✅ 积分: `\int_{0}^{1} x dx` → `∫_(0)^(1) 〖x〗 dx`
- ✅ 求和: `\sum_{i=1}^{n} i` → `∑_(i=1)^(n) i`
- ✅ 希腊字母: `\alpha, \beta` → `α, β`
- ✅ 矩阵: `\begin{pmatrix}...\end{pmatrix}` → `(■(...))`

## 🔧 开发者使用

### 作为 ES6 模块导入

```javascript
// 导入转换器
import { toWordEquation } from './js/latex-converter.js';

// 使用
const latex = '\\frac{a}{b}';
const word = toWordEquation(latex);
console.log(word); // "(a)/(b)"
```

### 添加自定义后处理规则

```javascript
import { addRule } from './js/postprocessor.js';

addRule({
    name: 'my-rule',
    description: 'My custom rule',
    pattern: /pattern/g,
    replace: 'replacement'
});
```

## 📚 文档

- **详细架构**: `MODULES_README.md`
- **完成报告**: `REFACTORING_COMPLETE.md`
- **原始 README**: `README.md`

## 🐛 故障排除

### 问题: 模块加载失败

**原因**: 浏览器 CORS 策略  
**解决**: 使用本地服务器

```bash
python3 -m http.server 8000
```

### 问题: 测试失败

**原因**: Node.js 版本过旧  
**解决**: 升级到 Node.js v14+

```bash
node --version  # 检查版本
```

## ✅ 测试状态

```bash
$ node test_node.js
✓ Test 1: Simple Fraction
✓ Test 2: Square Root
✓ Test 3: Integral with Limits
✓ Test 4: Greek Letters
✓ Test 5: Summation

Results: 5 passed, 0 failed
🎉 All tests passed!
```

## 🎉 开始使用

1. 启动本地服务器
2. 打开 `http://localhost:8000/index.html`
3. 开始输入数学公式！

---

**需要帮助？** 查看 `MODULES_README.md` 获取详细信息。

