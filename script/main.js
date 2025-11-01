// script/main.ts
import { loadItems, ITEMS, ModalManager } from './utils.js';
import { UI } from './ui.js';
import { RichTextEditor } from './editor.js';
import { JsonConverter } from './converter.js';
// 全局状态
const appState = {
    isDarkMode: false,
    isMenuOpen: false,
    currentEditingTag: null,
    modalStack: [], // 初始化模态框堆栈
};
// 实例化模块
const jsonConverter = new JsonConverter();
const modalManager = new ModalManager(); // 实例化 ModalManager
const ui = new UI(appState, jsonConverter, modalManager, (tag) => richTextEditor.updateTagContent(tag), (tag) => richTextEditor.editFeature(tag));
const richTextEditor = new RichTextEditor(appState, jsonConverter, ui);
window.App = {
    UI: ui,
    RichTextEditor: richTextEditor,
    JsonLogic: jsonConverter,
    ITEMS: ITEMS, // 暴露 ITEMS
};
// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    await loadItems(); // 确保物品数据在初始化UI前加载
    ui.initTheme();
    ui.initMenu();
    ui.initModals();
    ui.renderColorButtons((code) => richTextEditor.insertCode(code));
    richTextEditor.init();
    console.log("应用已初始化");
});
