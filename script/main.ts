// script/main.ts
import { AppState } from './utils.js';
import { UI } from './ui.js';
import { RichTextEditor } from './editor.js';
import { JsonConverter } from './converter.js';

// 全局状态
const appState: AppState = {
    isDarkMode: false,
    isMenuOpen: false,
    isModalOpen: false,
    currentEditingTag: null,
};

// 实例化模块
const jsonConverter = new JsonConverter();
const ui = new UI(appState, jsonConverter, (tag) => richTextEditor.updateTagContent(tag), (tag) => richTextEditor.editFeature(tag));
const richTextEditor = new RichTextEditor(appState, jsonConverter, ui);

// 将模块暴露到全局，以便 HTML 中的 onclick 事件可以访问
declare global {
    interface Window {
        App: {
            UI: UI;
            RichTextEditor: RichTextEditor;
            JsonLogic: JsonConverter; // 保持原有的命名以兼容 HTML
        };
    }
}

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
