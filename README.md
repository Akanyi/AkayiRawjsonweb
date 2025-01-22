# Minecraft 基岩版文本转 JSON 工具

这是一个用于将文本转换为 JSON 的工具，适用于 Minecraft 基岩版。

## 功能

- 支持插入颜色代码
- 支持插入计分板、选择器和翻译功能
- 实时预览文本效果
- 生成 JSON 格式的文本
- 解析 JSON 并显示在编辑器中

## 使用方法

1. 在编辑器中输入文本。
2. 使用下方按钮插入格式代码或功能。
3. 点击“生成 JSON”按钮生成 JSON。
4. 在“Raw JSON”区域查看生成的 JSON。
5. 使用“复制”按钮复制 JSON。
6. 使用“解析 JSON”解析你的 JSON。

## 示例

### 插入颜色代码

点击颜色按钮插入相应的颜色代码，例如：

- §0 黑
- §1 深蓝
- §2 深绿
- §3 湖蓝
- §4 深红

### 插入功能

点击功能按钮插入相应的功能，例如：

- 插入计分板：`insertFeature('score')`
- 插入选择器：`insertFeature('selector')`
- 插入翻译：`insertFeature('translate')`

## 开发

### 依赖

- HTML
- CSS
- JavaScript

### 文件结构

- `Main.html`：主页面
- `Main.css`：主样式文件
- `Main.js`：主脚本文件
- `Main2.js`：功能编辑脚本
- `Main3.js`：JSON 生成脚本
- `Main4.js`：插入功能脚本
- `Main5.js`：模态框脚本
- `Decodejson.js`：JSON 解析脚本

### 贡献

欢迎提交问题和贡献代码！

## 许可证

Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)

版权所有 (c) 2025 Akanyi
