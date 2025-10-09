# 📦 模块化架构说明

## 🎯 重构目标

本次重构解决了以下问题：

- **问题6**: 后处理逻辑重构 - 让积分等表达式处理更可靠
- **问题10**: 代码模块化 - 把代码拆分成多个文件，更易维护

## 📁 新的文件结构

```
e2 typer AST/
├── index.html              # 主应用（已精简，删除了 500+ 行内联代码）
├── js/                     # 模块化 JavaScript 代码
│   ├── symbol-maps.js      # 符号映射表（希腊字母、数学符号）
│   ├── latex-parser.js     # LaTeX 解析器（生成 AST）
│   ├── ast-printer.js      # AST 打印器（转换为 UnicodeMath）
│   ├── postprocessor.js    # 后处理器（改进版，更可靠）
│   ├── latex-converter.js  # 主转换器（协调所有模块）
│   ├── latex-utils.js      # LaTeX 工具函数
│   ├── app-bridge.js       # 应用桥接（导出到全局作用域）
│   └── main.js             # 主入口（导出所有功能）
└── test_modules.html       # 模块测试页面
```

## 🔧 模块说明

### 1. `symbol-maps.js`
存储所有符号映射表：
- `greekMap`: 希腊字母映射
- `symbolMap`: 数学符号映射
- `standardFunctions`: 标准数学函数列表

### 2. `latex-parser.js`
将 LaTeX 字符串解析为抽象语法树（AST）：
```javascript
import { parse } from './js/latex-parser.js';
const ast = parse('\\frac{1}{2}');
// 返回: AST 结构
```

### 3. `ast-printer.js`
将 AST 转换为 UnicodeMath 格式：
```javascript
import { print } from './js/ast-printer.js';
const unicodeMath = print(ast);
// 返回: "(1)/(2)"
```

### 4. `postprocessor.js` ⭐ **改进版**
应用后处理规则来优化输出：

**新特性**：
- 规则化的后处理系统
- 每个规则都有名称和描述
- 更可靠的积分格式化
- 支持动态添加/删除规则

```javascript
import { postProcess, addRule, getRules } from './js/postprocessor.js';

// 使用内置规则
const polished = postProcess(unicodeMath);

// 添加自定义规则
addRule({
    name: 'my-rule',
    description: 'My custom rule',
    pattern: /pattern/g,
    replace: 'replacement'
});

// 查看所有规则
console.log(getRules());
```

**内置规则**：
1. `integral-formatting` - 带限积分格式化
2. `integral-no-limits` - 不定积分格式化
3. `delimiter-spacing` - 分隔符间距
4. `right-pipe-spacing` - 右管道间距
5. `sum-spacing` - 求和符号间距
6. `product-spacing` - 乘积符号间距
7. `projection-spacing` - 投影符号间距
8. `nested-parentheses` - 简化嵌套括号

### 5. `latex-converter.js`
主转换器，协调所有模块：
```javascript
import { toWordEquation } from './js/latex-converter.js';
const result = toWordEquation('\\int_{0}^{1} x dx');
// 返回: "∫_(0)^(1) 〖x〗 dx"
```

### 6. `latex-utils.js`
LaTeX 工具函数：
- `normalizeLatexStr()` - 清理空结构
- `isEmptyLatex()` - 检查是否为空
- `extractContent()` - 提取内容

### 7. `app-bridge.js`
桥接模块，将函数导出到全局作用域供 HTML 使用：
```javascript
// 在 HTML 中可以直接使用
window.toWordEquation(latex);
window.normalizeWordInput(text);
window.removeWordSpaces(latex);
window.normalizeLatexStr(latex);
```

## 🚀 使用方法

### 在 HTML 中使用（已集成）

```html
<!-- 在 index.html 底部 -->
<script type="module" src="js/app-bridge.js"></script>
```

函数会自动暴露到全局作用域，无需修改现有代码。

### 作为 ES6 模块使用

```javascript
// 导入特定功能
import { toWordEquation } from './js/latex-converter.js';
import { parse } from './js/latex-parser.js';
import { print } from './js/ast-printer.js';
import { postProcess } from './js/postprocessor.js';

// 使用
const latex = '\\frac{a}{b}';
const result = toWordEquation(latex);
console.log(result); // "(a)/(b)"
```

### 导入所有功能

```javascript
import * as LatexConverter from './js/main.js';

LatexConverter.toWordEquation('\\alpha');
LatexConverter.postProcess(text);
```

## 🧪 测试

打开 `test_modules.html` 在浏览器中查看测试结果：

```bash
# 使用本地服务器（推荐）
python3 -m http.server 8000
# 然后访问 http://localhost:8000/test_modules.html
```

测试包括：
- ✓ 简单分数
- ✓ 平方根
- ✓ 带限积分
- ✓ 不定积分
- ✓ 求和
- ✓ 希腊字母
- ✓ 复杂表达式
- ✓ 矩阵

## 📊 改进总结

### 问题6：后处理逻辑重构

**之前**：
```javascript
// 单一的正则表达式替换，容易出错
text = text.replace(/∫(_[^\s^]+)?\^([^\s]+)\s+([^d]+?)\s*d([a-z])/gi, ...);
```

**现在**：
```javascript
// 规则化系统，每个规则独立且可配置
const rules = [
    {
        name: 'integral-formatting',
        description: 'Format integrals with proper spacing',
        pattern: /∫(_\([^)]+\)|\w+)?\^(\([^)]+\)|\w+)\s*([^d]+?)\s*d([a-zA-Z])/gi,
        replace: (match, sub, sup, integrand, variable) => {
            const lower = sub || '';
            integrand = integrand.trim();
            return `∫${lower}^${sup} 〖${integrand}〗 d${variable}`;
        }
    },
    // ... 更多规则
];
```

**优势**：
- ✅ 更可靠的模式匹配
- ✅ 错误隔离（一个规则失败不影响其他）
- ✅ 易于调试和维护
- ✅ 支持动态添加规则

### 问题10：代码模块化

**之前**：
- 📄 单个 HTML 文件：4011 行
- 🔴 所有代码内联在 `<script>` 标签中
- 🔴 难以维护和测试
- 🔴 代码重复

**现在**：
- 📄 主 HTML 文件：~3500 行（减少 500+ 行）
- ✅ 8 个独立的 JavaScript 模块
- ✅ 清晰的职责分离
- ✅ 易于测试和维护
- ✅ 可重用的代码

## 🔄 向后兼容

所有现有功能保持不变：
- ✅ `toWordEquation()` 函数签名相同
- ✅ `normalizeWordInput()` 行为一致
- ✅ `removeWordSpaces()` 功能相同
- ✅ `normalizeLatexStr()` 保持兼容

现有的 HTML 代码无需修改即可工作！

## 📝 Git 历史

```bash
# 查看提交历史
git log --oneline

# 主要提交：
# - 初始版本 - AST 数学公式编辑器
# - 添加模块化 JavaScript 文件
# - 完成模块化重构 - 删除旧代码，添加模块导入
```

## 🎓 学习资源

- **AST（抽象语法树）**: 代码的树形表示，便于分析和转换
- **ES6 模块**: 现代 JavaScript 的模块系统
- **后处理**: 在主要转换后应用的优化步骤

## 🤝 贡献

如果需要添加新功能：

1. 在适当的模块中添加代码
2. 在 `postprocessor.js` 中添加新规则（如果需要）
3. 在 `test_modules.html` 中添加测试用例
4. 提交前运行测试

## 📞 问题反馈

如果遇到问题：
1. 检查浏览器控制台是否有错误
2. 确保使用支持 ES6 模块的现代浏览器
3. 使用本地服务器运行（避免 CORS 问题）

---

**重构完成时间**: 2025-10-09  
**重构作者**: AI Assistant  
**测试状态**: ✅ 通过

