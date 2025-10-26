import { UI } from './ui.js';
import { RichTextEditor } from './editor.js';
import { JsonConverter } from './converter.js';
// 全局状态
const appState = {
    isDarkMode: false,
    isMenuOpen: false,
    isModalOpen: false,
    currentEditingTag: null,
};
// 实例化模块
const jsonConverter = new JsonConverter();
const ui = new UI(appState, jsonConverter, (tag) => richTextEditor.updateTagContent(tag), (tag) => richTextEditor.editFeature(tag));
const richTextEditor = new RichTextEditor(appState, jsonConverter, ui);
window.App = {
    UI: ui,
    RichTextEditor: richTextEditor,
    JsonLogic: jsonConverter,
};
// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    ui.initTheme();
    ui.initMenu();
    ui.initModals();
    ui.renderColorButtons((code) => richTextEditor.insertCode(code));
    richTextEditor.init();
    console.log("应用已初始化");
});
