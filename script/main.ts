// script/main.ts
import { AppState, loadItems, ITEMS, ItemData, ModalManager } from './utils.js';
import { UI } from './ui.js';
import { RichTextEditor } from './editor.js';
import { JsonConverter } from './converter.js';

// 全局状态
const appState: AppState = {
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

// 将模块暴露到全局，以便 HTML 中的 onclick 事件可以访问
declare global {
    interface Window {
        App: {
            UI: UI;
            RichTextEditor: RichTextEditor;
            JsonLogic: JsonConverter; // 保持原有的命名以兼容 HTML
            ITEMS: ItemData; // 添加 ITEMS
        };
    }
}

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
