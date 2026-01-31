"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// script/main.ts
const utils_js_1 = require("./utils.js");
const ui_js_1 = require("./ui.js");
const editor_js_1 = require("./editor.js");
const converter_js_1 = require("./converter.js");
// 全局状态
const appState = {
    isDarkMode: false,
    isMenuOpen: false,
    currentEditingTag: null,
    modalStack: [], // 初始化模态框堆栈
};
// 实例化模块
const jsonConverter = new converter_js_1.JsonConverter();
const modalManager = new utils_js_1.ModalManager(); // 实例化 ModalManager
const ui = new ui_js_1.UI(appState, jsonConverter, modalManager, (tag) => richTextEditor.updateTagContent(tag), (tag) => richTextEditor.editFeature(tag));
const richTextEditor = new editor_js_1.RichTextEditor(appState, jsonConverter, ui);
window.App = {
    UI: ui,
    RichTextEditor: richTextEditor,
    JsonLogic: jsonConverter,
    ITEMS: utils_js_1.ITEMS, // 暴露 ITEMS (初始为空，将在加载后更新)
    SLOTS: utils_js_1.SLOTS, // 暴露 SLOTS (初始为空，将在加载后更新)
};
// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    await (0, utils_js_1.loadItems)(); // 确保物品数据在初始化UI前加载
    await (0, utils_js_1.loadSlots)(); // 确保槽位数据在初始化UI前加载
    window.App.ITEMS = utils_js_1.ITEMS; // 在物品数据加载完成后，更新全局的 ITEMS 对象
    window.App.SLOTS = utils_js_1.SLOTS; // 在槽位数据加载完成后，更新全局的 SLOTS 对象
    ui.initTheme();
    ui.initMenu();
    ui.initModals();
    ui.renderColorButtons((code) => richTextEditor.insertCode(code));
    richTextEditor.init();
    console.log("应用已初始化");
});
