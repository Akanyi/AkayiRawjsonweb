// script/ui.ts
import { COLORS, MODAL_INPUT_CLASSES, MODAL_LABEL_CLASSES, MODAL_GRID_CLASSES, MODAL_SECTION_TITLE_CLASSES, FAMILY_TYPES } from './utils.js';
export class UI {
    constructor(appState, jsonConverter, updateTagContent, editFeature) {
        this.appState = appState;
        this.jsonConverter = jsonConverter;
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
        document.getElementById('about-btn')?.addEventListener('click', (e) => { e.preventDefault(); this.showModal(this.getAboutModalContent()); });
        document.getElementById('decode-json-btn')?.addEventListener('click', (e) => { e.preventDefault(); this.showModal(this.getDecodeModalContent()); });
        document.getElementById('modal-backdrop')?.addEventListener('click', () => this.hideModal());
        document.getElementById('copy-json-btn')?.addEventListener('click', () => this.copyJson());
    }
    showModal(content, isSubModal = false) {
        const modalContainerId = isSubModal ? 'sub-modal-container' : 'modal-container';
        const modalBackdropId = isSubModal ? 'sub-modal-backdrop' : 'modal-backdrop';
        const modalContainer = document.getElementById(modalContainerId);
        const modalBackdrop = document.getElementById(modalBackdropId);
        if (!modalContainer || !modalBackdrop)
            return;
        // 如果是主模态框，检查是否已经有模态框打开
        if (!isSubModal && this.appState.isModalOpen)
            return;
        // 如果是子模态框，确保主模态框是打开的
        if (isSubModal && !this.appState.isModalOpen)
            return;
        if (!isSubModal) {
            this.appState.isModalOpen = true;
        }
        modalContainer.innerHTML = content;
        modalContainer.classList.remove('hidden');
        modalBackdrop.classList.remove('hidden');
        modalContainer.querySelector('.modal-content')?.classList.add('fade-in');
        modalContainer.querySelector('.close-modal-btn')?.addEventListener('click', () => this.hideModal(isSubModal));
    }
    hideModal(isSubModal = false) {
        const modalContainerId = isSubModal ? 'sub-modal-container' : 'modal-container';
        const modalBackdropId = isSubModal ? 'sub-modal-backdrop' : 'modal-backdrop';
        const modalContainer = document.getElementById(modalContainerId);
        const modalBackdrop = document.getElementById(modalBackdropId);
        const modalContent = modalContainer?.querySelector('.modal-content');
        if (!modalContainer || !modalBackdrop)
            return;
        if (!isSubModal && !this.appState.isModalOpen)
            return;
        if (modalContent) {
            modalContent.classList.remove('fade-in');
            modalContent.classList.add('fade-out');
        }
        setTimeout(() => {
            modalContainer.classList.add('hidden');
            modalBackdrop.classList.add('hidden');
            modalContainer.innerHTML = '';
            if (!isSubModal) {
                this.appState.isModalOpen = false;
                this.appState.currentEditingTag = null;
            }
        }, 300);
    }
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
        const baseMatch = selectorStr.match(/^@([prsaen])/) || [, 'p'];
        const base = baseMatch[1];
        const paramsMatch = selectorStr.match(/\[(.*)\]/);
        const params = {};
        if (paramsMatch && paramsMatch[1]) {
            paramsMatch[1].split(',').forEach(p => {
                const [key, value] = p.split('=');
                if (key && value) {
                    params[key] = value;
                }
            });
        }
        // Determine initial mode based on whether the selector string is complex
        const isAdvancedMode = !selectorStr.match(/^@[prsaen]$/) || paramsMatch;
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
                            <h3 class="${MODAL_SECTION_TITLE_CLASSES}">旋转角度</h3>
                            <div><label for="sel-rx" class="${MODAL_LABEL_CLASSES}">最大垂直旋转 (rx)</label><input id="sel-rx" type="number" value="${params.rx || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="90"></div>
                            <div><label for="sel-rxm" class="${MODAL_LABEL_CLASSES}">最小垂直旋转 (rxm)</label><input id="sel-rxm" type="number" value="${params.rxm || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="-90"></div>
                            <div><label for="sel-ry" class="${MODAL_LABEL_CLASSES}">最大水平旋转 (ry)</label><input id="sel-ry" type="number" value="${params.ry || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="180"></div>
                            <div><label for="sel-rym" class="${MODAL_LABEL_CLASSES}">最小水平旋转 (rym)</label><input id="sel-rym" type="number" value="${params.rym || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="-180"></div>
                        </div>

                        <!-- 维度选择 -->
                        <div class="${MODAL_GRID_CLASSES}">
                            <h3 class="${MODAL_SECTION_TITLE_CLASSES}">维度选择 (dx, dy, dz)</h3>
                            <div><label for="sel-dx" class="${MODAL_LABEL_CLASSES}">X维度 (dx)</label><input id="sel-dx" type="text" value="${params.dx || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="10.5"></div>
                            <div><label for="sel-dy" class="${MODAL_LABEL_CLASSES}">Y维度 (dy)</label><input id="sel-dy" type="text" value="${params.dy || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="-5"></div>
                            <div><label for="sel-dz" class="${MODAL_LABEL_CLASSES}">Z维度 (dz)</label><input id="sel-dz" type="text" value="${params.dz || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="20"></div>
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
            if (isAdvanced) {
                advancedForm.classList.remove('hidden');
                manualForm.classList.add('hidden');
                advancedButton.classList.add('bg-blue-500', 'text-white');
                advancedButton.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
                manualButton.classList.remove('bg-blue-500', 'text-white');
                manualButton.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
            }
            else {
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
        this.showModal(content, true); // 标记为子模态框
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
        this.hideModal(true); // 隐藏子模态框
    }
}
