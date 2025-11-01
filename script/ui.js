// script/ui.ts
import { COLORS, MODAL_INPUT_CLASSES, MODAL_LABEL_CLASSES, MODAL_GRID_CLASSES, MODAL_SECTION_TITLE_CLASSES, FAMILY_TYPES } from './utils.js';
export class UI {
    constructor(appState, jsonConverter, modalManager, updateTagContent, editFeature) {
        this.currentItemSearchTargetIndex = null;
        this.currentLocationSearchTargetIndex = null; // 新增 location 搜索的目标索引
        this.appState = appState;
        this.jsonConverter = jsonConverter;
        this.modalManager = modalManager; // 初始化 ModalManager
        this.updateTagContent = updateTagContent;
        this.editFeature = editFeature;
    }
    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            this.appState.isDarkMode = true;
            document.documentElement.classList.add('dark');
        }
        document.getElementById('toggle-dark-mode')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleTheme();
        });
    }
    toggleTheme() {
        this.appState.isDarkMode = !this.appState.isDarkMode;
        document.documentElement.classList.toggle('dark', this.appState.isDarkMode);
        localStorage.setItem('theme', this.appState.isDarkMode ? 'dark' : 'light');
    }
    initMenu() {
        const menuButton = document.getElementById('menu-button');
        const menuContent = document.getElementById('menu-content');
        menuButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.appState.isMenuOpen = !this.appState.isMenuOpen;
            menuContent?.classList.toggle('hidden', !this.appState.isMenuOpen);
        });
        document.addEventListener('click', () => {
            if (this.appState.isMenuOpen) {
                this.appState.isMenuOpen = false;
                menuContent?.classList.add('hidden');
            }
        });
    }
    initModals() {
        document.getElementById('about-btn')?.addEventListener('click', (e) => { e.preventDefault(); this.modalManager.show(this.getAboutModalContent()); });
        document.getElementById('decode-json-btn')?.addEventListener('click', (e) => { e.preventDefault(); this.modalManager.show(this.getDecodeModalContent()); });
        // 移除旧的模态框背景监听，因为现在由 ModalManager 管理
        // document.getElementById('modal-backdrop')?.addEventListener('click', () => this.hideModal());
        document.getElementById('copy-json-btn')?.addEventListener('click', () => this.copyJson());
    }
    // showModal 和 hideModal 方法将被 ModalManager 替代
    // public showModal(content: string, isSubModal: boolean = false): void { ... }
    // public hideModal(isSubModal: boolean = false): void { ... }
    renderColorButtons(insertCode) {
        const container = document.getElementById('colorButtons');
        if (!container)
            return;
        container.innerHTML = COLORS.map(color => `
            <button
                style="background-color:${color.bg}; color:${color.text}; ${color.border ? 'border: 1px solid #ccc;' : ''} ${color.bold ? 'font-weight:bold;' : ''} ${color.italic ? 'font-style:italic;' : ''}"
                class="p-2 rounded shadow transition-transform transform hover:scale-110"
                onclick="window.App.RichTextEditor.insertCode('${color.code}')">
                ${color.name}
            </button>
        `).join('');
    }
    copyJson() {
        const jsonText = document.getElementById('jsonOutput')?.textContent;
        if (jsonText) {
            navigator.clipboard.writeText(jsonText).then(() => {
                const btn = document.getElementById('copy-json-btn');
                if (btn) {
                    const originalText = btn.textContent;
                    btn.textContent = '已复制!';
                    setTimeout(() => btn.textContent = originalText, 2000);
                }
            }).catch(err => console.error('复制失败:', err));
        }
    }
    getAboutModalContent() {
        return `
            <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-gray-800 dark:text-gray-200">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">关于</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                </div>
                <p class="mb-4">这是一款用于 Minecraft 基岩版 RawJSON 文本生成的工具，由 Akanyi 创建。</p>
                <a href="https://github.com/Akanyi/AkayiRawjsonweb" target="_blank" class="text-blue-500 dark:text-blue-400 hover:underline">访问 GitHub 仓库</a>
            </div>
        `;
    }
    getDecodeModalContent() {
        return `
            <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">解析 JSON</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                </div>
                <textarea id="json-input-area" class="w-full h-40 p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" placeholder="在此粘贴你的 RawJSON..."></textarea>
                <button onclick="window.App.JsonLogic.decodeJson()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">解析</button>
            </div>
        `;
    }
    getEditModalContent(type) {
        const tag = this.appState.currentEditingTag;
        if (!tag)
            return '';
        let content = '';
        switch (type) {
            case 'score':
                content = `
                    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">编辑计分板</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="${MODAL_LABEL_CLASSES}">计分对象</label>
                            <input id="score-name" type="text" value="${tag.dataset.name || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="@p, 玩家名...">
                        </div>
                        <div>
                            <label class="${MODAL_LABEL_CLASSES}">计分项</label>
                            <input id="score-objective" type="text" value="${tag.dataset.objective || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="分数, 金钱...">
                        </div>
                    </div>
                `;
                break;
            case 'translate':
                content = `
                    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">编辑翻译</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="${MODAL_LABEL_CLASSES}">翻译键</label>
                            <input id="translate-key" type="text" value="${tag.dataset.translate || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="welcome.message.1">
                        </div>
                        <div>
                            <label class="${MODAL_LABEL_CLASSES}">参数 (JSON 数组格式)</label>
                            <textarea id="translate-with" class="w-full h-24 ${MODAL_INPUT_CLASSES}" placeholder='[{"text":"玩家"}]'>${tag.dataset.with || ''}</textarea>
                        </div>
                    </div>
                `;
                break;
            case 'conditional':
                content = `
                    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">编辑条件块</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="${MODAL_LABEL_CLASSES}">IF (条件 - JSON 对象)</label>
                            <textarea id="conditional-condition" class="w-full h-24 font-mono ${MODAL_INPUT_CLASSES}" placeholder='{"selector":"@p[tag=vip]"}\n或者\n{"score":{"name":"@p","objective":"money","min":100}}'>${tag.dataset.condition || ''}</textarea>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">输入单个 JSON 对象作为条件。</p>
                        </div>
                        <div>
                            <label class="${MODAL_LABEL_CLASSES}">THEN (结果 - Rawtext JSON 数组)</label>
                            <textarea id="conditional-then" class="w-full h-24 font-mono ${MODAL_INPUT_CLASSES}" placeholder='[{"text":"You are a VIP!"}]'>${tag.dataset.then || ''}</textarea>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">输入一个 Rawtext 数组作为条件成功时显示的内容。</p>
                        </div>
                    </div>
                `;
                break;
        }
        return `
            <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <div class="flex justify-between items-center">
                    <div></div>
                    <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                </div>
                ${content}
                <div class="mt-6 flex justify-end space-x-2">
                    <button onclick="window.App.UI.hideModal()" class="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded">取消</button>
                    <button onclick="window.App.RichTextEditor.applyEdit()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">保存</button>
                </div>
            </div>
        `;
    }
    getSelectorModalContent(tag) {
        const selectorStr = tag.dataset.selector || '@p';
        const { base, params } = this.parseSelectorString(selectorStr);
        // Determine initial mode based on whether the selector string is complex
        const isAdvancedMode = !selectorStr.match(/^@[prsaen]$/) || selectorStr.includes('[');
        return `
            <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">选择器编辑器</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                </div>

                <div class="mb-4 flex justify-center space-x-4">
                    <button id="selector-mode-advanced" class="px-4 py-2 rounded ${isAdvancedMode ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}" onclick="window.App.UI.setSelectorMode(true)">高级模式</button>
                    <button id="selector-mode-manual" class="px-4 py-2 rounded ${!isAdvancedMode ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}" onclick="window.App.UI.setSelectorMode(false)">手动模式</button>
                </div>

                <div id="selector-advanced-form" class="${isAdvancedMode ? '' : 'hidden'} space-y-6">
                    <!-- 基本参数 -->
                    <div class="${MODAL_GRID_CLASSES}">
                        <h3 class="${MODAL_SECTION_TITLE_CLASSES}">基本</h3>
                        <div>
                            <label for="sel-base" class="${MODAL_LABEL_CLASSES}">目标</label>
                            <select id="sel-base" class="${MODAL_INPUT_CLASSES}">
                                <option value="p" ${base === 'p' ? 'selected' : ''}>@p (最近的玩家)</option>
                                <option value="r" ${base === 'r' ? 'selected' : ''}>@r (随机玩家)</option>
                                <option value="a" ${base === 'a' ? 'selected' : ''}>@a (所有玩家)</option>
                                <option value="e" ${base === 'e' ? 'selected' : ''}>@e (所有实体)</option>
                                <option value="s" ${base === 's' ? 'selected' : ''}>@s (执行者)</option>
                                <option value="n" ${base === 'n' ? 'selected' : ''}>@n (最近的实体)</option>
                            </select>
                        </div>
                        <div>
                            <label for="sel-type" class="${MODAL_LABEL_CLASSES}">实体类型 (type)</label>
                            <input id="sel-type" type="text" value="${params.type || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="minecraft:player">
                        </div>
                        <div>
                            <label for="sel-name" class="${MODAL_LABEL_CLASSES}">名称 (name)</label>
                            <input id="sel-name" type="text" value="${params.name || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="Steve">
                        </div>
                        <div>
                            <label for="sel-c" class="${MODAL_LABEL_CLASSES}">数量 (c)</label>
                            <input id="sel-c" type="number" value="${params.c || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="正数=最近, 负数=最远">
                        </div>
                         <div class="flex items-end gap-2">
                            <div class="flex-grow">
                                <label for="sel-family" class="${MODAL_LABEL_CLASSES}">族 (family)</label>
                                <input id="sel-family" type="text" value="${params.family || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="monster">
                            </div>
                            <button type="button" onclick="window.App.UI.showFamilyTypesDoc()" class="p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-10 w-10 flex items-center justify-center">?</button>
                        </div>
                    </div>

                    <!-- 坐标与距离 -->
                    <div class="${MODAL_GRID_CLASSES}">
                        <h3 class="${MODAL_SECTION_TITLE_CLASSES}">坐标与距离</h3>
                        <div><label for="sel-x" class="${MODAL_LABEL_CLASSES}">X坐标 (x)</label><input id="sel-x" type="text" value="${params.x || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="~, 10, ~-5"></div>
                        <div><label for="sel-y" class="${MODAL_LABEL_CLASSES}">Y坐标 (y)</label><input id="sel-y" type="text" value="${params.y || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="~, 64, ~10"></div>
                        <div><label for="sel-z" class="${MODAL_LABEL_CLASSES}">Z坐标 (z)</label><input id="sel-z" type="text" value="${params.z || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="~, 100, ~-5"></div>
                        <div><label for="sel-r" class="${MODAL_LABEL_CLASSES}">最大半径 (r)</label><input id="sel-r" type="number" value="${params.r || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="10"></div>
                            <div><label for="sel-rm" class="${MODAL_LABEL_CLASSES}">最小半径 (rm)</label><input id="sel-rm" type="number" value="${params.rm || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="1"></div>
                        </div>

                        <!-- 旋转角度 -->
                        <div class="${MODAL_GRID_CLASSES}">
                            <h3 class="${MODAL_SECTION_TITLE_CLASSES} flex items-center">
                                旋转角度
                                <button type="button" onclick="window.App.UI.showRotationHelp()" class="ml-2 p-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-6 w-6 flex items-center justify-center text-xs font-bold">?</button>
                            </h3>
                            <div>
                                <label for="sel-rx" class="${MODAL_LABEL_CLASSES}">最大垂直旋转 (rx)</label>
                                <input id="sel-rx" type="number" value="${params.rx || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="90">
                            </div>
                            <div>
                                <label for="sel-rxm" class="${MODAL_LABEL_CLASSES}">最小垂直旋转 (rxm)</label>
                                <input id="sel-rxm" type="number" value="${params.rxm || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="-90">
                            </div>
                            <div>
                                <label for="sel-ry" class="${MODAL_LABEL_CLASSES}">最大水平旋转 (ry)</label>
                                <input id="sel-ry" type="number" value="${params.ry || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="180">
                            </div>
                            <div>
                                <label for="sel-rym" class="${MODAL_LABEL_CLASSES}">最小水平旋转 (rym)</label>
                                <input id="sel-rym" type="number" value="${params.rym || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="-180">
                            </div>
                        </div>

                        <!-- 维度选择 -->
                        <div class="${MODAL_GRID_CLASSES}">
                            <h3 class="${MODAL_SECTION_TITLE_CLASSES} flex items-center">
                                维度选择 (dx, dy, dz)
                                <button type="button" onclick="window.App.UI.showDimensionHelp()" class="ml-2 p-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-6 w-6 flex items-center justify-center text-xs font-bold">?</button>
                            </h3>
                            <div>
                                <label for="sel-dx" class="${MODAL_LABEL_CLASSES}">X维度 (dx)</label>
                                <input id="sel-dx" type="text" value="${params.dx || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="10.5">
                            </div>
                            <div>
                                <label for="sel-dy" class="${MODAL_LABEL_CLASSES}">Y维度 (dy)</label>
                                <input id="sel-dy" type="text" value="${params.dy || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="-5">
                            </div>
                            <div>
                                <label class="${MODAL_LABEL_CLASSES}">Z维度 (dz)</label>
                                <input id="sel-dz" type="text" value="${params.dz || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="20">
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 col-span-full mt-1">
                                定义一个长方体区域。可为负数和小数。
                                如果未指定 x, y, z 坐标，则以命令执行位置为原点。
                            </p>
                        </div>
                        
                        <!-- 标签 -->
                        <div class="${MODAL_GRID_CLASSES}">
                            <h3 class="${MODAL_SECTION_TITLE_CLASSES}">标签 (tag)</h3>
                            <div class="col-span-full">
                                <input id="sel-tag" type="text" value="${params.tag || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="vip, !member, ...">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">用逗号分隔多个标签. 例如: vip,!newbie</p>
                            </div>
                        </div>

                        <!-- 物品栏 (hasitem) -->
                        <div class="${MODAL_GRID_CLASSES}">
                            <h3 class="${MODAL_SECTION_TITLE_CLASSES} flex items-center justify-between">
                                <span>物品栏 (hasitem)</span>
                                <button type="button" onclick="window.App.UI.showHasitemEditorModal()" class="ml-2 p-1 bg-blue-500 hover:bg-blue-600 text-white rounded h-8 w-8 flex items-center justify-center text-xs font-bold">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                </button>
                            </h3>
                            <div class="col-span-full">
                                <textarea id="sel-hasitem" class="w-full h-24 font-mono ${MODAL_INPUT_CLASSES}" placeholder='{item=apple,quantity=1..}\n或者\n[{item=diamond,quantity=3..},{item=stick,quantity=2..}]'>${params.hasitem || ''}</textarea>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    输入 \`key=value\` 格式的物品条件。单个条件用 {}，多个条件用 [] 包裹并用逗号分隔。
                                    例如: <code>{item=apple}</code> 或 <code>[{item=diamond,quantity=3..},{item=stick,quantity=2..}]</code>
                                </p>
                            </div>
                        </div>

                    <!-- 玩家数据 -->
                    <div class="${MODAL_GRID_CLASSES}">
                        <h3 class="${MODAL_SECTION_TITLE_CLASSES}">玩家数据</h3>
                        <div>
                            <label for="sel-m" class="${MODAL_LABEL_CLASSES}">游戏模式 (m)</label>
                            <select id="sel-m" class="${MODAL_INPUT_CLASSES}">
                                <option value="">任何</option>
                                <option value="s" ${params.m === 's' ? 'selected' : ''}>生存 (s)</option>
                                <option value="c" ${params.m === 'c' ? 'selected' : ''}>创造 (c)</option>
                                <option value="a" ${params.m === 'a' ? 'selected' : ''}>冒险 (a)</option>
                                <option value="d" ${params.m === 'd' ? 'selected' : ''}>默认 (d)</option>
                            </select>
                        </div>
                        <div><label for="sel-lm" class="${MODAL_LABEL_CLASSES}">最小等级 (lm)</label><input id="sel-lm" type="number" value="${params.lm || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="10"></div>
                        <div><label for="sel-l" class="${MODAL_LABEL_CLASSES}">最大等级 (l)</label><input id="sel-l" type="number" value="${params.l || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="50"></div>
                    </div>
                </div>

                <div id="selector-manual-form" class="${isAdvancedMode ? 'hidden' : ''} space-y-4">
                    <label for="manual-selector-input" class="${MODAL_LABEL_CLASSES}">手动输入选择器</label>
                    <textarea id="manual-selector-input" class="w-full h-32 font-mono ${MODAL_INPUT_CLASSES}" placeholder="@a[tag=vip,r=10]">${selectorStr}</textarea>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">直接输入完整的选择器字符串。</p>
                </div>

                <div class="mt-6 flex justify-end space-x-2">
                    <button onclick="window.App.UI.hideModal()" class="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded">取消</button>
                    <button onclick="window.App.RichTextEditor.applySelectorEdit()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">保存</button>
                </div>
            </div>
        `;
    }
    setSelectorMode(isAdvanced) {
        const advancedForm = document.getElementById('selector-advanced-form');
        const manualForm = document.getElementById('selector-manual-form');
        const advancedButton = document.getElementById('selector-mode-advanced');
        const manualButton = document.getElementById('selector-mode-manual');
        if (advancedForm && manualForm && advancedButton && manualButton) {
            const manualInput = document.getElementById('manual-selector-input');
            if (isAdvanced) {
                // Manual to Advanced
                if (manualInput) {
                    const { base, params } = this.parseSelectorString(manualInput.value);
                    document.getElementById('sel-base').value = base;
                    document.getElementById('sel-type').value = params.type || '';
                    document.getElementById('sel-name').value = params.name || '';
                    document.getElementById('sel-c').value = params.c || '';
                    document.getElementById('sel-family').value = params.family || '';
                    document.getElementById('sel-x').value = params.x || '';
                    document.getElementById('sel-y').value = params.y || '';
                    document.getElementById('sel-z').value = params.z || '';
                    document.getElementById('sel-r').value = params.r || '';
                    document.getElementById('sel-rm').value = params.rm || '';
                    document.getElementById('sel-rx').value = params.rx || '';
                    document.getElementById('sel-rxm').value = params.rxm || '';
                    document.getElementById('sel-ry').value = params.ry || '';
                    document.getElementById('sel-rym').value = params.rym || '';
                    document.getElementById('sel-dx').value = params.dx || '';
                    document.getElementById('sel-dy').value = params.dy || '';
                    document.getElementById('sel-dz').value = params.dz || '';
                    document.getElementById('sel-tag').value = params.tag || '';
                    document.getElementById('sel-m').value = params.m || '';
                    document.getElementById('sel-lm').value = params.lm || '';
                    document.getElementById('sel-l').value = params.l || '';
                }
                advancedForm.classList.remove('hidden');
                manualForm.classList.add('hidden');
                advancedButton.classList.add('bg-blue-500', 'text-white');
                advancedButton.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
                manualButton.classList.remove('bg-blue-500', 'text-white');
                manualButton.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
            }
            else {
                // Advanced to Manual
                const base = document.getElementById('sel-base').value;
                const params = {
                    type: document.getElementById('sel-type').value,
                    name: document.getElementById('sel-name').value,
                    c: document.getElementById('sel-c').value,
                    family: document.getElementById('sel-family').value,
                    x: document.getElementById('sel-x').value,
                    y: document.getElementById('sel-y').value,
                    z: document.getElementById('sel-z').value,
                    r: document.getElementById('sel-r').value,
                    rm: document.getElementById('sel-rm').value,
                    rx: document.getElementById('sel-rx').value,
                    rxm: document.getElementById('sel-rxm').value,
                    ry: document.getElementById('sel-ry').value,
                    rym: document.getElementById('sel-rym').value,
                    dx: document.getElementById('sel-dx').value,
                    dy: document.getElementById('sel-dy').value,
                    dz: document.getElementById('sel-dz').value,
                    tag: document.getElementById('sel-tag').value,
                    m: document.getElementById('sel-m').value,
                    lm: document.getElementById('sel-lm').value,
                    l: document.getElementById('sel-l').value,
                };
                manualInput.value = this.buildSelectorString(base, params);
                manualForm.classList.remove('hidden');
                advancedForm.classList.add('hidden');
                manualButton.classList.add('bg-blue-500', 'text-white');
                manualButton.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
                advancedButton.classList.remove('bg-blue-500', 'text-white');
                advancedButton.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
            }
        }
    }
    showFamilyTypesDoc() {
        const content = `
            <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto text-gray-800 dark:text-gray-200">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">可用族类型</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                </div>
                <input type="text" id="family-search-input" class="${MODAL_INPUT_CLASSES} mb-4" placeholder="搜索族类型..." oninput="window.App.UI.filterFamilyTypes(this.value)">
                <div id="family-types-list" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${FAMILY_TYPES.map(type => `
                        <span class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                              onclick="window.App.UI.fillFamilyType('${type.name}')">
                            ${type.name} <span class="text-gray-500 dark:text-gray-400">(${type.translation})</span>
                        </span>
                    `).join('')}
                </div>
                <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    这些是 Minecraft 基岩版中可用于选择器的 'family' 参数的族类型。点击可快速填入。
                </div>
            </div>
        `;
        this.modalManager.show(content); // 使用 ModalManager
    }
    filterFamilyTypes(query) {
        const listContainer = document.getElementById('family-types-list');
        if (!listContainer)
            return;
        const filteredTypes = FAMILY_TYPES.filter(type => type.name.toLowerCase().includes(query.toLowerCase()) ||
            type.translation.toLowerCase().includes(query.toLowerCase()));
        listContainer.innerHTML = filteredTypes.map(type => `
            <span class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onclick="window.App.UI.fillFamilyType('${type.name}')">
                ${type.name} <span class="text-gray-500 dark:text-gray-400">(${type.translation})</span>
            </span>
        `).join('');
    }
    fillFamilyType(familyName) {
        const familyInput = document.getElementById('sel-family');
        if (familyInput) {
            familyInput.value = familyName;
        }
        this.modalManager.hide(); // 使用 ModalManager 隐藏
    }
    // Helper to parse selector string into base and parameters
    parseSelectorString(selectorStr) {
        console.log('parseSelectorString input:', selectorStr); // DEBUG
        const baseMatch = selectorStr.match(/^@([prsaen])/) || [, 'p'];
        const base = baseMatch[1];
        const params = {};
        const paramsMatch = selectorStr.match(/\[(.*)\]/);
        if (paramsMatch && paramsMatch[1]) {
            // 使用更复杂的正则表达式来处理hasitem参数，因为它可能包含逗号和方括号
            // 匹配 key=value，其中 value 可以是 {key=value,...} 或 [{...},{...}] 或普通字符串
            // 改进的正则表达式，以正确处理嵌套的 {} 和 []
            const paramRegex = /([a-zA-Z0-9_]+)=((?:\{[^{}]*\}|\[(?:[^\[\]]*\{[^{}]*\}[^\[\]]*)*\]|[^,\]]+))/g;
            let match;
            while ((match = paramRegex.exec(paramsMatch[1])) !== null) {
                const key = match[1];
                const value = match[2];
                if (key && value) {
                    params[key] = value;
                }
            }
        }
        console.log('parseSelectorString output params:', params); // DEBUG
        return { base, params };
    }
    // Helper to build selector string from base and parameters
    buildSelectorString(base, params) {
        let selector = `@${base}`;
        const paramParts = [];
        for (const key in params) {
            if (params.hasOwnProperty(key) && params[key]) {
                // 对于hasitem参数，直接使用其值，因为它已经是JSON字符串
                if (key === 'hasitem') {
                    paramParts.push(`${key}=${params[key]}`);
                }
                else {
                    paramParts.push(`${key}=${params[key]}`);
                }
            }
        }
        if (paramParts.length > 0) {
            selector += `[${paramParts.join(',')}]`;
        }
        return selector;
    }
    showRotationHelp() {
        const content = `
            <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto text-gray-800 dark:text-gray-200">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">旋转角度帮助</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                </div>
                <div class="space-y-4">
                    <p>黄色空心箭头Zlocal代表当前实体朝向；如图绿色区域为rxm=-90,rx=90时（x_rotation=-90..90）所表示的角度范围。由于实体朝向处在绿色角度范围内，故可选中该实体；</p>
                    <img src="static/The_x_rotation_rxm_rx_Of_Entity_Selector.png" alt="rx/rxm explanation" class="w-full h-auto rounded-md">
                    <p>黄色空心箭头Zlocal代表当前实体朝向，Z'代表实体朝向在XZ平面上的投影；绿色区域为rym=-45,ry=45时（y_rotation=-45..45）所表示的角度范围。由于Z'投影处在绿色角度范围内，故该实体可被选中</p>
                    <img src="static/The_y_rotation_rym_ry_Of_Entity_Selector.png" alt="ry/rym explanation" class="w-full h-auto rounded-md">
                </div>
            </div>
        `;
        this.modalManager.show(content); // 使用 ModalManager
    }
    showDimensionHelp() {
        const content = `
            <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto text-gray-800 dark:text-gray-200">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">维度选择帮助</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                </div>
                <div class="space-y-4">
                    <p>绿色方块即dx dy dz所形成的检测区域，蓝色方块表示某实体的判定箱，紫色区域即它们的相交部分；</p>
                    <img src="static/The_dx_dy_dz_Of_Entity_Selector.png" alt="dx/dy/dz explanation" class="w-full h-auto rounded-md">
                </div>
            </div>
        `;
        this.modalManager.show(content); // 使用 ModalManager
    }
    // Helper to parse key=value string into an object
    parseKeyValueStringToObject(str) {
        const obj = {};
        str.split(',').forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                obj[key.trim()] = value.trim();
            }
        });
        return obj;
    }
    showHasitemEditorModal() {
        const tag = this.appState.currentEditingTag;
        if (!tag)
            return;
        const selectorStr = tag.dataset.selector || '';
        console.log('showHasitemEditorModal selectorStr:', selectorStr); // DEBUG
        const hasitemMatch = selectorStr.match(/hasitem=({[^}]*}|\[.*?\])/); // 匹配 hasitem={...} 或 hasitem=[...]
        let currentHasitem = [];
        if (hasitemMatch) {
            const hasitemString = hasitemMatch[1];
            console.log('showHasitemEditorModal hasitemString:', hasitemString); // DEBUG
            try {
                if (hasitemString.startsWith('[') && hasitemString.endsWith(']')) {
                    // 处理数组形式：[{k=v,...},{k=v,...}]
                    const innerContent = hasitemString.substring(1, hasitemString.length - 1);
                    currentHasitem = innerContent.split('},{').map(itemStr => {
                        const cleanedItemStr = itemStr.replace(/^{|}$/g, ''); // 移除可能存在的花括号
                        return this.parseKeyValueStringToObject(cleanedItemStr);
                    });
                }
                else if (hasitemString.startsWith('{') && hasitemString.endsWith('}')) {
                    // 处理单个对象形式：{k=v,...}
                    const innerContent = hasitemString.substring(1, hasitemString.length - 1);
                    currentHasitem = [this.parseKeyValueStringToObject(innerContent)];
                }
            }
            catch (e) {
                console.error("解析现有 hasitem 参数失败", e);
            }
        }
        console.log('showHasitemEditorModal currentHasitem:', currentHasitem); // DEBUG
        this.modalManager.show(this.getHasitemEditorModalContent(currentHasitem)); // 使用 ModalManager
    }
    showItemSearchModal(targetIndex) {
        this.currentItemSearchTargetIndex = targetIndex;
        this.modalManager.show(this.getItemSearchModalContent()); // 使用 ModalManager
    }
    getItemSearchModalContent() {
        // 初始显示所有物品
        const allItemsHtml = Object.keys(window.App.ITEMS).map(itemId => `
            <span class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onclick="window.App.UI.fillItem('${itemId}', ${this.currentItemSearchTargetIndex})">
                ${window.App.ITEMS[itemId]} <span class="text-gray-500 dark:text-gray-400">(${itemId})</span>
            </span>
        `).join('');
        return `
            <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto text-gray-800 dark:text-gray-200">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">物品查询</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                </div>
                <input type="text" id="item-search-input" class="${MODAL_INPUT_CLASSES} mb-4" placeholder="搜索物品ID或名称..." oninput="window.App.UI.filterItems(this.value)">
                <div id="item-list-container" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${allItemsHtml}
                </div>
                <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    点击物品可快速填入。
                </div>
            </div>
        `;
    }
    filterItems(query) {
        const listContainer = document.getElementById('item-list-container');
        if (!listContainer)
            return;
        const filteredItems = Object.keys(window.App.ITEMS).filter(itemId => itemId.toLowerCase().includes(query.toLowerCase()) ||
            window.App.ITEMS[itemId].toLowerCase().includes(query.toLowerCase()));
        listContainer.innerHTML = filteredItems.map(itemId => `
            <span class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onclick="window.App.UI.fillItem('${itemId}', ${this.currentItemSearchTargetIndex})">
                ${window.App.ITEMS[itemId]} <span class="text-gray-500 dark:text-gray-400">(${itemId})</span>
            </span>
        `).join('');
    }
    fillItem(itemId, targetIndex) {
        if (targetIndex !== null) {
            const itemInput = document.getElementById(`hasitem-item-${targetIndex}`);
            if (itemInput) {
                itemInput.value = itemId;
            }
        }
        this.modalManager.hide(); // 使用 ModalManager 隐藏
    }
    // 新增 location 搜索模态框相关方法
    showLocationSearchModal(targetIndex) {
        this.currentLocationSearchTargetIndex = targetIndex;
        this.modalManager.show(this.getLocationSearchModalContent());
    }
    getLocationSearchModalContent() {
        const allSlotsHtml = Object.keys(window.App.SLOTS).map(slotId => `
            <span class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onclick="window.App.UI.fillLocation('${slotId}', ${this.currentLocationSearchTargetIndex})">
                ${window.App.SLOTS[slotId]} <span class="text-gray-500 dark:text-gray-400">(${slotId})</span>
            </span>
        `).join('');
        return `
            <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto text-gray-800 dark:text-gray-200">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">槽位查询</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                </div>
                <input type="text" id="location-search-input" class="${MODAL_INPUT_CLASSES} mb-4" placeholder="搜索槽位ID或名称..." oninput="window.App.UI.filterLocations(this.value)">
                <div id="location-list-container" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${allSlotsHtml}
                </div>
                <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    点击槽位可快速填入。
                </div>
            </div>
        `;
    }
    filterLocations(query) {
        const listContainer = document.getElementById('location-list-container');
        if (!listContainer)
            return;
        const filteredSlots = Object.keys(window.App.SLOTS).filter(slotId => slotId.toLowerCase().includes(query.toLowerCase()) ||
            window.App.SLOTS[slotId].toLowerCase().includes(query.toLowerCase()));
        listContainer.innerHTML = filteredSlots.map(slotId => `
            <span class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onclick="window.App.UI.fillLocation('${slotId}', ${this.currentLocationSearchTargetIndex})">
                ${window.App.SLOTS[slotId]} <span class="text-gray-500 dark:text-gray-400">(${slotId})</span>
            </span>
        `).join('');
    }
    fillLocation(slotId, targetIndex) {
        if (targetIndex !== null) {
            const locationInput = document.getElementById(`hasitem-location-${targetIndex}`);
            if (locationInput) {
                locationInput.value = slotId;
            }
        }
        this.modalManager.hide();
    }
    getHasitemEditorModalContent(hasitemConditions) {
        const conditionHtml = hasitemConditions.map((condition, index) => `
            <div class="hasitem-condition-item border border-gray-300 dark:border-gray-600 p-4 rounded-md mb-4" data-index="${index}">
                <div class="flex justify-end">
                    <button type="button" onclick="window.App.UI.removeHasitemCondition(${index})" class="text-red-500 hover:text-red-700 text-xl">&times;</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">物品ID (item)</label>
                        <div class="flex">
                            <input id="hasitem-item-${index}" type="text" value="${condition.item || ''}" class="${MODAL_INPUT_CLASSES} flex-grow" placeholder="minecraft:apple">
                            <button type="button" onclick="window.App.UI.showItemSearchModal(${index})" class="ml-2 p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-10 w-10 flex items-center justify-center">?</button>
                        </div>
                    </div>
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">数据值 (data)</label>
                        <input id="hasitem-data-${index}" type="number" value="${condition.data || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="0-32767">
                    </div>
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">数量 (quantity)</label>
                        <input id="hasitem-quantity-${index}" type="text" value="${condition.quantity || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="1.., 1-10, !0">
                    </div>
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">物品栏 (location)</label>
                        <div class="flex">
                            <input id="hasitem-location-${index}" type="text" value="${condition.location || ''}" class="${MODAL_INPUT_CLASSES} flex-grow" placeholder="slot.hotbar">
                            <button type="button" onclick="window.App.UI.showLocationSearchModal(${index})" class="ml-2 p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-10 w-10 flex items-center justify-center">?</button>
                        </div>
                    </div>
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">槽位 (slot)</label>
                        <input id="hasitem-slot-${index}" type="text" value="${condition.slot || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="0..8">
                    </div>
                </div>
            </div>
        `).join('');
        return `
            <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">hasitem 可视化编辑器</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                </div>

                <div id="hasitem-conditions-container" class="space-y-4">
                    ${conditionHtml}
                </div>

                <button type="button" onclick="window.App.UI.addHasitemCondition()" class="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">添加条件</button>

                <div class="mt-6 flex justify-end space-x-2">
                    <button onclick="window.App.UI.hideCurrentModal()" class="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded">取消</button>
                    <button onclick="window.App.UI.applyHasitemEditorChanges()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">保存</button>
                </div>
            </div>
        `;
    }
    addHasitemCondition() {
        const container = document.getElementById('hasitem-conditions-container');
        if (!container)
            return;
        const newIndex = container.children.length;
        const newConditionHtml = `
            <div class="hasitem-condition-item border border-gray-300 dark:border-gray-600 p-4 rounded-md mb-4" data-index="${newIndex}">
                <div class="flex justify-end">
                    <button type="button" onclick="window.App.UI.removeHasitemCondition(${newIndex})" class="text-red-500 hover:text-red-700 text-xl">&times;</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">物品ID (item)</label>
                        <div class="flex">
                            <input id="hasitem-item-${newIndex}" type="text" value="" class="${MODAL_INPUT_CLASSES} flex-grow" placeholder="minecraft:apple">
                            <button type="button" onclick="window.App.UI.showItemSearchModal(${newIndex})" class="ml-2 p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-10 w-10 flex items-center justify-center">?</button>
                        </div>
                    </div>
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">数据值 (data)</label>
                        <input id="hasitem-data-${newIndex}" type="number" value="" class="${MODAL_INPUT_CLASSES}" placeholder="0-32767">
                    </div>
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">数量 (quantity)</label>
                        <input id="hasitem-quantity-${newIndex}" type="text" value="" class="${MODAL_INPUT_CLASSES}" placeholder="1.., 1-10, !0">
                    </div>
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">物品栏 (location)</label>
                        <div class="flex">
                            <input id="hasitem-location-${newIndex}" type="text" value="" class="${MODAL_INPUT_CLASSES} flex-grow" placeholder="slot.hotbar">
                            <button type="button" onclick="window.App.UI.showLocationSearchModal(${newIndex})" class="ml-2 p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-10 w-10 flex items-center justify-center">?</button>
                        </div>
                    </div>
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">槽位 (slot)</label>
                        <input id="hasitem-slot-${newIndex}" type="text" value="" class="${MODAL_INPUT_CLASSES}" placeholder="0..8">
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', newConditionHtml);
        // Re-attach event listeners if necessary, or ensure they are handled by delegation
    }
    removeHasitemCondition(index) {
        const container = document.getElementById('hasitem-conditions-container');
        if (!container)
            return;
        const itemToRemove = container.querySelector(`.hasitem-condition-item[data-index="${index}"]`);
        if (itemToRemove) {
            itemToRemove.remove();
            // Re-index remaining items if necessary, or handle dynamically
            // For simplicity, we'll just remove it. Re-indexing can be complex.
        }
    }
    // Helper to format an object into a key=value string
    formatObjectToKeyValueString(obj) {
        const parts = [];
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                parts.push(`${key}=${obj[key]}`);
            }
        }
        return `{${parts.join(',')}}`;
    }
    applyHasitemEditorChanges() {
        const container = document.getElementById('hasitem-conditions-container');
        if (!container)
            return;
        const conditions = [];
        Array.from(container.children).forEach(itemElement => {
            const itemInput = itemElement.querySelector('[id^="hasitem-item-"]');
            const dataInput = itemElement.querySelector('[id^="hasitem-data-"]');
            const quantityInput = itemElement.querySelector('[id^="hasitem-quantity-"]');
            const locationInput = itemElement.querySelector('[id^="hasitem-location-"]');
            const slotInput = itemElement.querySelector('[id^="hasitem-slot-"]');
            const condition = {};
            if (itemInput?.value)
                condition.item = itemInput.value;
            if (dataInput?.value)
                condition.data = parseInt(dataInput.value);
            if (quantityInput?.value)
                condition.quantity = quantityInput.value;
            if (locationInput?.value)
                condition.location = locationInput.value;
            if (slotInput?.value)
                condition.slot = slotInput.value;
            if (Object.keys(condition).length > 0) {
                conditions.push(condition);
            }
        });
        console.log('applyHasitemEditorChanges collected conditions:', conditions); // DEBUG
        const tag = this.appState.currentEditingTag;
        if (tag) {
            const selectorInput = document.getElementById('sel-hasitem');
            if (selectorInput) {
                let formattedHasitem = '';
                if (conditions.length > 1) {
                    formattedHasitem = `[${conditions.map(item => this.formatObjectToKeyValueString(item)).join(',')}]`;
                }
                else if (conditions.length === 1) {
                    formattedHasitem = this.formatObjectToKeyValueString(conditions[0]);
                }
                selectorInput.value = formattedHasitem;
                console.log('applyHasitemEditorChanges formattedHasitem:', formattedHasitem); // DEBUG
            }
        }
        this.modalManager.hide(); // 关闭子模态框
    }
    // 新增一个方法用于隐藏当前模态框，供 HTML 中的 onclick 调用
    hideCurrentModal() {
        this.modalManager.hide();
    }
}
