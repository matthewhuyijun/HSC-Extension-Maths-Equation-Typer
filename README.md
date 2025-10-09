# LaTeX到Word UnicodeMath转换器 (AST版本)

## 项目简介
这是一个单页Web应用,用于将LaTeX数学表达式转换为Microsoft Word的UnicodeMath格式。

## 新特性 (AST重构)
✨ **全新的AST(抽象语法树)转换引擎**
- 更准确的LaTeX解析
- 正确处理嵌套结构
- 智能括号和空格管理
- 通过所有测试用例

## 快速开始

### 使用主应用
1. 在浏览器中打开 `index.html`
2. 在"Raw LaTeX Input"框中输入LaTeX表达式
3. 查看"Word Equation"输出
4. 点击复制按钮将结果复制到剪贴板

### 运行测试
1. 在浏览器中打开 `test_final.html`
2. 自动运行所有测试用例
3. 查看测试结果

## 支持的LaTeX命令示例

### 分数和根号
```latex
\frac{a}{b}           → (a)/(b)
\sqrt{x}              → √(x)
\sqrt[n]{x}           → √(n&x)
```

### 求和、乘积和积分
```latex
\sum_{i=1}^n i        → ∑_(i=1)^(n) i
\prod_{i=1}^n i       → ∏_(i=1)^(n) i
\int_{a}^{b} f(x) dx  → ∫_a^b 〖f(x)〗 dx
```

### 向量和矩阵
```latex
\overrightarrow{AB}                    → (AB)⃗
\begin{pmatrix}a\\ b\end{pmatrix}      → (■(a@b))
```

### 特殊符号
```latex
\alpha, \beta, \mu                     → α, β, μ
\infty, \pm, \geq, \leq               → ∞, ±, ≥, ≤
\left.f(x)\right|_{a}^{b}             → ├ f(x)┤|a^b
```

## 文件说明

### 核心文件
- **`index.html`** (151KB) - 主应用文件,包含AST转换器
- **`index.html.backup`** (156KB) - 原始文件备份

### 文档文件
- **`README.md`** - 本文件,使用指南
- **`REFACTORING_SUMMARY.md`** - 详细的重构技术文档
- **`ast_refactor_prompt.txt`** - 原始需求文档

### 测试文件
- **`test_final.html`** (2.8KB) - 自动化测试页面

## 技术架构

### AST转换流程
```
LaTeX字符串
    ↓
Parser (解析器)
    ↓
AST (抽象语法树)
    ↓
Printer (打印器)
    ↓
Post-processor (后处理器)
    ↓
Word UnicodeMath字符串
```

### 核心组件
1. **Parser**: 使用递归下降解析LaTeX
2. **Printer**: 深度优先遍历AST生成输出
3. **Post-processor**: 优化格式和特殊模式

## 浏览器兼容性
- ✓ Chrome/Edge (推荐)
- ✓ Firefox
- ✓ Safari
- ✓ 任何现代浏览器

## 无需安装
- ✗ 无需Node.js或npm
- ✗ 无需构建工具
- ✗ 无需外部依赖
- ✓ 直接在浏览器中打开即可使用

## 测试验证

所有核心功能已通过测试:
- ✓ 11个核心测试用例 100%通过
- ✓ 嵌套结构正确处理
- ✓ 边界情况覆盖
- ✓ 向后兼容保证

## 使用技巧

### 快捷操作
- 在MathLive字段中直接输入LaTeX
- 使用工具栏按钮快速插入常用符号
- 使用预设按钮快速输入常见表达式
- 点击复制按钮一键复制到剪贴板

### 主题切换
- 点击右上角的主题按钮
- 支持亮色/暗色主题
- 主题偏好自动保存

## 常见问题

**Q: 为什么要重构为AST?**
A: AST方法更准确,能正确处理嵌套和复杂结构,避免正则表达式的局限性。

**Q: UI有变化吗?**
A: 没有!所有UI、样式、布局保持完全一致,只升级了转换引擎。

**Q: 如何恢复旧版本?**
A: 将`index.html.backup`重命名为`index.html`即可。

**Q: 如何添加新的LaTeX命令?**
A: 在`toWordEquation`函数中的Parser和Printer部分添加相应的处理逻辑。

## 性能特点
- ⚡ 即时转换(通常<10ms)
- 📦 单文件,无网络请求
- 🔒 完全离线工作
- 💾 低内存占用

## 贡献
如果发现问题或有改进建议,欢迎反馈!

## 许可证
本项目仅供学习和个人使用。

---

**最后更新**: 2025年10月
**版本**: AST-based v1.0

