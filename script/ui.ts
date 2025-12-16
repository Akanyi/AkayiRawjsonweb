// script/ui.ts
import { AppState, COLORS, MODAL_INPUT_CLASSES, MODAL_LABEL_CLASSES, MODAL_GRID_CLASSES, MODAL_SECTION_TITLE_CLASSES, FAMILY_TYPES, ModalManager } from './utils.js';
import { JsonConverter } from './converter.js';

export class UI {
    private appState: AppState;
    private jsonConverter: JsonConverter;
    public modalManager: ModalManager; // ModalManager 实例改为 public
    private updateTagContent: (tag: HTMLElement) => void;
    private editFeature: (tag: HTMLElement) => void;

    constructor(appState: AppState, jsonConverter: JsonConverter, modalManager: ModalManager, updateTagContent: (tag: HTMLElement) => void, editFeature: (tag: HTMLElement) => void) {
        this.appState = appState;
        this.jsonConverter = jsonConverter;
        this.modalManager = modalManager; // 初始化 ModalManager
        this.updateTagContent = updateTagContent;
        this.editFeature = editFeature;
    }

    public initTheme(): void {
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

    public toggleTheme(): void {
        this.appState.isDarkMode = !this.appState.isDarkMode;
        document.documentElement.classList.toggle('dark', this.appState.isDarkMode);
        localStorage.setItem('theme', this.appState.isDarkMode ? 'dark' : 'light');
    }

    public initMenu(): void {
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

    public initModals(): void {
        document.getElementById('about-btn')?.addEventListener('click', (e) => { e.preventDefault(); this.modalManager.show(this.getAboutModalContent()); });
        document.getElementById('decode-json-btn')?.addEventListener('click', (e) => { e.preventDefault(); this.modalManager.show(this.getDecodeModalContent()); });
        // 移除模态框背景监听，现在由 ModalManager 管理
        // document.getElementById('modal-backdrop')?.addEventListener('click', () => this.hideModal());
        document.getElementById('copy-json-btn')?.addEventListener('click', () => this.copyJson());
    }

    // showModal 和 hideModal 方法被 ModalManager 替代
    // public showModal(content: string, isSubModal: boolean = false): void { ... }
    // public hideModal(isSubModal: boolean = false): void { ... }

    public renderColorButtons(insertCode: (code: string) => void): void {
        const container = document.getElementById('colorButtons');
        if (!container) return;

        container.innerHTML = COLORS.map(color => `
            <button
                style="background-color:${color.bg}; color:${color.text}; ${color.border ? 'border: 1px solid #ccc;' : ''} ${color.bold ? 'font-weight:bold;' : ''} ${color.italic ? 'font-style:italic;' : ''}"
                class="p-2 rounded shadow transition-transform transform hover:scale-110"
                onclick="window.App.RichTextEditor.insertCode('${color.code}')">
                ${color.name}
            </button>
        `).join('');
    }

    public copyJson(): void {
        const jsonOutputElement = document.getElementById('jsonOutput');
        const jsonText = jsonOutputElement?.textContent?.trim(); // 获取文本内容并去除首尾空白

        if (!jsonText) {
            console.warn('没有内容可以复制。');
            const btn = document.getElementById('copy-json-btn');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = '没有内容可复制!';
                setTimeout(() => btn.textContent = originalText, 3000);
            }
            return; // 没有内容，直接返回
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(jsonText).then(() => {
                const btn = document.getElementById('copy-json-btn');
                if (btn) {
                    const originalText = btn.textContent;
                    btn.textContent = '已复制!';
                    setTimeout(() => btn.textContent = originalText, 2000);
                }
            }).catch(err => console.error('复制失败:', err));
        } else {
            // Fallback for environments where navigator.clipboard is not available
            console.warn('浏览器不支持 Clipboard API，请手动复制。');
            const btn = document.getElementById('copy-json-btn');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = '复制失败，请手动复制!';
                setTimeout(() => btn.textContent = originalText, 3000);
            }
            // 可以考虑提供一个备用方案，例如创建一个临时的textarea来复制
            // const tempTextArea = document.createElement('textarea');
            // tempTextArea.value = jsonText;
            // document.body.appendChild(tempTextArea);
            // tempTextArea.select();
            // document.execCommand('copy');
            // document.body.removeChild(tempTextArea);
        }
    }

    private getAboutModalContent(): string {
        const gitLog = `
            20cd9d - 更新许可证信息，替换为Apache 2.0许可证 (5 minutes ago)
            e59e26c - 优化代码结构，重构标签创建逻辑，增加createFunctionTag函数以简化功能标签的生成 (19 minutes ago)
            9bc578e - score + 条件可视化 (3 hours ago)
            6b36a6e - 优化copyJson方法，增加内容为空时的提示和Clipboard API的兼容性处理 (13 hours ago)
            9ad4d4a - 优化score的实体选择器 (19 hours ago)
            e7b7907 - 优化hasitem编辑器 (20 hours ago)
            8cfb3cf - v2 od2rb93 (23 hours ago)
        `;
        const changelogHtml = gitLog.trim().split('\n').map(line => `<li>${line.trim()}</li>`).join('');

        return `
            <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-gray-800 dark:text-gray-200 max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">关于</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                </div>
                <p class="mb-4">这是一款用于 Minecraft 基岩版 RawJSON 文本生成的工具，由 Akanyi 创建。</p>
                <a href="https://github.com/Akanyi/AkayiRawjsonweb" target="_blank" class="text-blue-500 dark:text-blue-400 hover:underline">访问 GitHub 仓库</a>
                <div class="mt-6">
                    <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">更新日志</h3>
                    <ul class="list-disc list-inside text-sm space-y-1 font-mono">
                        ${changelogHtml}
                    </ul>
                </div>
            </div>
        `;
    }

    private getDecodeModalContent(): string {
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

    public getEditModalContent(type: string): string {
        const tag = this.appState.currentEditingTag;
        if (!tag) return '';

        let content = '';

        switch (type) {
            case 'score':
                content = `
                    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">编辑计分板</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="${MODAL_LABEL_CLASSES}">计分对象</label>
                            <div class="flex">
                                <input id="score-name" type="text" value="${tag.dataset.name || ''}" class="${MODAL_INPUT_CLASSES} flex-grow" placeholder="@p, 玩家名...">
                                <button type="button" onclick="window.App.UI.showSelectorEditorForScoreName('score-name')" class="ml-2 p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-10 w-10 flex items-center justify-center">?</button>
                            </div>
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
                content = this.getConditionalEditorContent(tag);
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
                    <button onclick="window.App.UI.hideCurrentModal()" class="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded">取消</button>
                    <button onclick="window.App.RichTextEditor.applyEdit()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">保存</button>
                </div>
            </div>
        `;
    }

    public getSelectorModalContent(tag: HTMLElement): string {
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

                    <!-- 计分板 (scores) -->
                    <div class="${MODAL_GRID_CLASSES}">
                        <h3 class="${MODAL_SECTION_TITLE_CLASSES} flex items-center justify-between">
                            <span>计分板 (scores)</span>
                            <button type="button" onclick="window.App.UI.showScoreEditorModal()" class="ml-2 p-1 bg-blue-500 hover:bg-blue-600 text-white rounded h-8 w-8 flex items-center justify-center text-xs font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </button>
                        </h3>
                        <div class="col-span-full">
                            <textarea id="sel-scores" class="w-full h-24 font-mono ${MODAL_INPUT_CLASSES}" placeholder='{myscore=10}\n或者\n{myscore=10..12,another_score=5..}'>${params.scores || ''}</textarea>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                输入 \`{记分项=值}\` 格式的计分板条件。支持范围和不等号。
                                例如: <code>{myscore=10}</code> 或 <code>{myscore=10..12,another_score=!5}</code>
                            </p>
                        </div>
                    </div>
                </div>

                <div id="selector-manual-form" class="${isAdvancedMode ? 'hidden' : ''} space-y-4">
                    <label for="manual-selector-input" class="${MODAL_LABEL_CLASSES}">手动输入选择器</label>
                    <textarea id="manual-selector-input" class="w-full h-32 font-mono ${MODAL_INPUT_CLASSES}" placeholder="@a[tag=vip,r=10]">${selectorStr}</textarea>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">直接输入完整的选择器字符串。</p>
                </div>

                <div class="mt-6 flex justify-end space-x-2">
                    <button onclick="window.App.UI.hideCurrentModal()" class="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded">取消</button>
                    <button onclick="window.App.RichTextEditor.applySelectorEdit()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">保存</button>
                </div>
            </div>
        `;
    }

    public setSelectorMode(isAdvanced: boolean): void {
        const advancedForm = document.getElementById('selector-advanced-form');
        const manualForm = document.getElementById('selector-manual-form');
        const advancedButton = document.getElementById('selector-mode-advanced');
        const manualButton = document.getElementById('selector-mode-manual');

        if (advancedForm && manualForm && advancedButton && manualButton) {
            const manualInput = document.getElementById('manual-selector-input') as HTMLTextAreaElement;

            if (isAdvanced) {
                if (manualInput) {
                    const { base, params } = this.parseSelectorString(manualInput.value);
                    (document.getElementById('sel-base') as HTMLSelectElement).value = base;
                    (document.getElementById('sel-type') as HTMLInputElement).value = params.type || '';
                    (document.getElementById('sel-name') as HTMLInputElement).value = params.name || '';
                    (document.getElementById('sel-c') as HTMLInputElement).value = params.c || '';
                    (document.getElementById('sel-family') as HTMLInputElement).value = params.family || '';
                    (document.getElementById('sel-x') as HTMLInputElement).value = params.x || '';
                    (document.getElementById('sel-y') as HTMLInputElement).value = params.y || '';
                    (document.getElementById('sel-z') as HTMLInputElement).value = params.z || '';
                    (document.getElementById('sel-r') as HTMLInputElement).value = params.r || '';
                    (document.getElementById('sel-rm') as HTMLInputElement).value = params.rm || '';
                    (document.getElementById('sel-rx') as HTMLInputElement).value = params.rx || '';
                    (document.getElementById('sel-rxm') as HTMLInputElement).value = params.rxm || '';
                    (document.getElementById('sel-ry') as HTMLInputElement).value = params.ry || '';
                    (document.getElementById('sel-rym') as HTMLInputElement).value = params.rym || '';
                    (document.getElementById('sel-dx') as HTMLInputElement).value = params.dx || '';
                    (document.getElementById('sel-dy') as HTMLInputElement).value = params.dy || '';
                    (document.getElementById('sel-dz') as HTMLInputElement).value = params.dz || '';
                    (document.getElementById('sel-tag') as HTMLInputElement).value = params.tag || '';
                    (document.getElementById('sel-m') as HTMLSelectElement).value = params.m || '';
                    (document.getElementById('sel-lm') as HTMLInputElement).value = params.lm || '';
                    (document.getElementById('sel-l') as HTMLInputElement).value = params.l || '';
                }
                advancedForm.classList.remove('hidden');
                manualForm.classList.add('hidden');
                advancedButton.classList.add('bg-blue-500', 'text-white');
                advancedButton.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
                manualButton.classList.remove('bg-blue-500', 'text-white');
                manualButton.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
            } else {
                const base = (document.getElementById('sel-base') as HTMLSelectElement).value;
                const params: { [key: string]: string } = {
                    type: (document.getElementById('sel-type') as HTMLInputElement).value,
                    name: (document.getElementById('sel-name') as HTMLInputElement).value,
                    c: (document.getElementById('sel-c') as HTMLInputElement).value,
                    family: (document.getElementById('sel-family') as HTMLInputElement).value,
                    x: (document.getElementById('sel-x') as HTMLInputElement).value,
                    y: (document.getElementById('sel-y') as HTMLInputElement).value,
                    z: (document.getElementById('sel-z') as HTMLInputElement).value,
                    r: (document.getElementById('sel-r') as HTMLInputElement).value,
                    rm: (document.getElementById('sel-rm') as HTMLInputElement).value,
                    rx: (document.getElementById('sel-rx') as HTMLInputElement).value,
                    rxm: (document.getElementById('sel-rxm') as HTMLInputElement).value,
                    ry: (document.getElementById('sel-ry') as HTMLInputElement).value,
                    rym: (document.getElementById('sel-rym') as HTMLInputElement).value,
                    dx: (document.getElementById('sel-dx') as HTMLInputElement).value,
                    dy: (document.getElementById('sel-dy') as HTMLInputElement).value,
                    dz: (document.getElementById('sel-dz') as HTMLInputElement).value,
                    tag: (document.getElementById('sel-tag') as HTMLInputElement).value,
                    m: (document.getElementById('sel-m') as HTMLSelectElement).value,
                    lm: (document.getElementById('sel-lm') as HTMLInputElement).value,
                    l: (document.getElementById('sel-l') as HTMLInputElement).value,
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

    public showFamilyTypesDoc(): void {
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

    public filterFamilyTypes(query: string): void {
        const listContainer = document.getElementById('family-types-list');
        if (!listContainer) return;

        const filteredTypes = FAMILY_TYPES.filter(type =>
            type.name.toLowerCase().includes(query.toLowerCase()) ||
            type.translation.toLowerCase().includes(query.toLowerCase())
        );

        listContainer.innerHTML = filteredTypes.map(type => `
            <span class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onclick="window.App.UI.fillFamilyType('${type.name}')">
                ${type.name} <span class="text-gray-500 dark:text-gray-400">(${type.translation})</span>
            </span>
        `).join('');
    }

    public fillFamilyType(familyName: string): void {
        const familyInput = document.getElementById('sel-family') as HTMLInputElement;
        if (familyInput) {
            familyInput.value = familyName;
        }
        this.modalManager.hide(); // 使用 ModalManager 隐藏
    }

    // Helper to parse selector string into base and parameters
    private parseSelectorString(selectorStr: string): { base: string; params: { [key: string]: string } } {
        console.log('parseSelectorString input:', selectorStr); // DEBUG
        const baseMatch = selectorStr.match(/^@([prsaen])/) || [, 'p'];
        const base = baseMatch[1];
        const params: { [key: string]: string } = {};
        const paramsMatch = selectorStr.match(/\[(.*)\]/);
        if (paramsMatch && paramsMatch[1]) {
            // 使用更复杂的正则表达式来处理hasitem参数，因为它可能包含逗号和方括号
            // 匹配 key=value，其中 value 可以是 {key=value,...} 或 [{...},{...}] 或普通字符串
            // 改进的正则表达式，以正确处理嵌套的 {} 和 []
            // 匹配 key=value，其中 value 可以是 {key=value,...} 或 [{...},{...}] 或普通字符串
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
    private buildSelectorString(base: string, params: { [key: string]: string }): string {
        let selector = `@${base}`;
        const paramParts: string[] = [];
        for (const key in params) {
            if (params.hasOwnProperty(key) && params[key]) {
                // 对于hasitem参数，直接使用其值，因为它已经是JSON字符串
                if (key === 'hasitem' || key === 'scores') { // 添加 scores 参数的处理
                    paramParts.push(`${key}=${params[key]}`);
                } else {
                    paramParts.push(`${key}=${params[key]}`);
                }
            }
        }
        if (paramParts.length > 0) {
            selector += `[${paramParts.join(',')}]`;
        }
        return selector;
    }

    public showRotationHelp(): void {
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

    public showDimensionHelp(): void {
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
    private parseKeyValueStringToObject(str: string): { [key: string]: string } {
        const obj: { [key: string]: string } = {};
        str.split(',').forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                obj[key.trim()] = value.trim();
            }
        });
        return obj;
    }

    public showHasitemEditorModal(): void {
        const tag = this.appState.currentEditingTag;
        if (!tag) return;

        const selectorStr = tag.dataset.selector || '';
        const hasitemMatch = selectorStr.match(/hasitem=({[^}]*}|\[.*?\])/); // 匹配 hasitem={...} 或 hasitem=[...]
        let currentHasitem: any[] = [];

        if (hasitemMatch) {
            const hasitemString = hasitemMatch[1];
            try {
                if (hasitemString.startsWith('[') && hasitemString.endsWith(']')) {
                    // 处理数组形式：[{k=v,...},{k=v,...}]
                    const innerContent = hasitemString.substring(1, hasitemString.length - 1);
                    currentHasitem = innerContent.split('},{').map(itemStr => {
                        const cleanedItemStr = itemStr.replace(/^{|}$/g, ''); // 移除可能存在的花括号
                        return this.parseKeyValueStringToObject(cleanedItemStr);
                    });
                } else if (hasitemString.startsWith('{') && hasitemString.endsWith('}')) {
                    // 处理单个对象形式：{k=v,...}
                    const innerContent = hasitemString.substring(1, hasitemString.length - 1);
                    currentHasitem = [this.parseKeyValueStringToObject(innerContent)];
                }
            } catch (e) {
                console.error("解析现有 hasitem 参数失败", e);
            }
        }
        this.modalManager.show(this.getHasitemEditorModalContent(currentHasitem)); // 使用 ModalManager
    }

    public showScoreEditorModal(): void {
        const tag = this.appState.currentEditingTag;
        if (!tag) return;

        const selectorStr = tag.dataset.selector || '';
        console.log('showScoreEditorModal selectorStr:', selectorStr); // DEBUG
        const scoresMatch = selectorStr.match(/scores=({[^}]*})/); // 匹配 scores={...}
        let currentScores: { objective: string; value: string }[] = [];

        if (scoresMatch) {
            const scoresString = scoresMatch[1];
            console.log('showScoreEditorModal scoresString:', scoresString); // DEBUG
            try {
                // 解析 scores={objective=value,objective2=value2} 这种格式
                const innerContent = scoresString.substring(1, scoresString.length - 1); // 移除花括号
                const scorePairs = innerContent.split(',');
                scorePairs.forEach(pair => {
                    const [objective, value] = pair.split('=');
                    if (objective && value) {
                        currentScores.push({ objective: objective.trim(), value: value.trim() });
                    }
                });
            } catch (e) {
                console.error("解析现有 scores 参数失败", e);
            }
        }
        console.log('showScoreEditorModal currentScores:', currentScores); // DEBUG
        this.modalManager.show(this.getScoreEditorModalContent(currentScores)); // 使用 ModalManager
    }

    private currentItemSearchTargetIndex: number | null = null;
    private currentLocationSearchTargetIndex: number | null = null; // location 搜索的目标索引
    private currentSelectorTargetInputId: string | null = null; // 选择器编辑器的目标输入框ID

    public showItemSearchModal(targetIndex: number): void {
        this.currentItemSearchTargetIndex = targetIndex;
        this.modalManager.show(this.getItemSearchModalContent()); // 使用 ModalManager
    }

    public getItemSearchModalContent(): string {
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

    public getScoreEditorModalContent(scoreConditions: { objective: string; value: string }[]): string {
        const conditionHtml = scoreConditions.map((condition, index) => `
            <div class="score-condition-item border border-gray-300 dark:border-gray-600 p-4 rounded-md mb-4" data-index="${index}">
                <div class="flex justify-end">
                    <button type="button" onclick="window.App.UI.removeScoreCondition(${index})" class="text-red-500 hover:text-red-700 text-xl">&times;</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">计分项 (objective)</label>
                        <input id="score-objective-${index}" type="text" value="${condition.objective || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="money, kills...">
                    </div>
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">分数 (value)</label>
                        <input id="score-value-${index}" type="text" value="${condition.value || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="10, 5.., ..15, 10..12, !10">
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">计分板可视化编辑器</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                </div>

                <div id="score-conditions-container" class="space-y-4">
                    ${conditionHtml}
                </div>

                <button type="button" onclick="window.App.UI.addScoreCondition()" class="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">添加条件</button>

                <div class="mt-6 flex justify-end space-x-2">
                    <button onclick="window.App.UI.hideCurrentModal()" class="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded">取消</button>
                    <button onclick="window.App.UI.applyScoreEditorChanges()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">保存</button>
                </div>
            </div>
        `;
    }

    public filterItems(query: string): void {
        const listContainer = document.getElementById('item-list-container');
        if (!listContainer) return;

        const filteredItems = Object.keys(window.App.ITEMS).filter(itemId =>
            itemId.toLowerCase().includes(query.toLowerCase()) ||
            window.App.ITEMS[itemId].toLowerCase().includes(query.toLowerCase())
        );

        listContainer.innerHTML = filteredItems.map(itemId => `
            <span class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onclick="window.App.UI.fillItem('${itemId}', ${this.currentItemSearchTargetIndex})">
                ${window.App.ITEMS[itemId]} <span class="text-gray-500 dark:text-gray-400">(${itemId})</span>
            </span>
        `).join('');
    }

    public fillItem(itemId: string, targetIndex: number | null): void {
        if (targetIndex !== null) {
            const itemInput = document.getElementById(`hasitem-item-${targetIndex}`) as HTMLInputElement;
            if (itemInput) {
                itemInput.value = itemId;
            }
        }
        this.modalManager.hide(); // 使用 ModalManager 隐藏
    }

    // location 搜索模态框相关方法
    public showLocationSearchModal(targetIndex: number): void {
        this.currentLocationSearchTargetIndex = targetIndex;
        this.modalManager.show(this.getLocationSearchModalContent());
    }

    public getLocationSearchModalContent(): string {
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

    public filterLocations(query: string): void {
        const listContainer = document.getElementById('location-list-container');
        if (!listContainer) return;

        const filteredSlots = Object.keys(window.App.SLOTS).filter(slotId =>
            slotId.toLowerCase().includes(query.toLowerCase()) ||
            window.App.SLOTS[slotId].toLowerCase().includes(query.toLowerCase())
        );

        listContainer.innerHTML = filteredSlots.map(slotId => `
            <span class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onclick="window.App.UI.fillLocation('${slotId}', ${this.currentLocationSearchTargetIndex})">
                ${window.App.SLOTS[slotId]} <span class="text-gray-500 dark:text-gray-400">(${slotId})</span>
            </span>
        `).join('');
    }

    public fillLocation(slotId: string, targetIndex: number | null): void {
        if (targetIndex !== null) {
            const locationInput = document.getElementById(`hasitem-location-${targetIndex}`) as HTMLInputElement;
            if (locationInput) {
                locationInput.value = slotId;
            }
        }
        this.modalManager.hide();
    }

    public getHasitemEditorModalContent(hasitemConditions: any[]): string {
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

    public addHasitemCondition(): void {
        const container = document.getElementById('hasitem-conditions-container');
        if (!container) return;

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

    public addScoreCondition(): void {
        const container = document.getElementById('score-conditions-container');
        if (!container) return;

        const newIndex = container.children.length;
        const newConditionHtml = `
            <div class="score-condition-item border border-gray-300 dark:border-gray-600 p-4 rounded-md mb-4" data-index="${newIndex}">
                <div class="flex justify-end">
                    <button type="button" onclick="window.App.UI.removeScoreCondition(${newIndex})" class="text-red-500 hover:text-red-700 text-xl">&times;</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">计分项 (objective)</label>
                        <input id="score-objective-${newIndex}" type="text" value="" class="${MODAL_INPUT_CLASSES}" placeholder="money, kills...">
                    </div>
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">分数 (value)</label>
                        <input id="score-value-${newIndex}" type="text" value="" class="${MODAL_INPUT_CLASSES}" placeholder="10, 5.., ..15, 10..12, !10">
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', newConditionHtml);
    }

    public removeHasitemCondition(index: number): void {
        const container = document.getElementById('hasitem-conditions-container');
        if (!container) return;

        const itemToRemove = container.querySelector(`.hasitem-condition-item[data-index="${index}"]`);
        if (itemToRemove) {
            itemToRemove.remove();
            // Re-index remaining items if necessary, or handle dynamically
            // For simplicity, we'll just remove it. Re-indexing can be complex.
        }
    }

    public removeScoreCondition(index: number): void {
        const container = document.getElementById('score-conditions-container');
        if (!container) return;

        const itemToRemove = container.querySelector(`.score-condition-item[data-index="${index}"]`);
        if (itemToRemove) {
            itemToRemove.remove();
        }
    }

    // Helper to format an object into a key=value string
    private formatObjectToKeyValueString(obj: { [key: string]: string | number }): string {
        const parts: string[] = [];
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                parts.push(`${key}=${obj[key]}`);
            }
        }
        return `{${parts.join(',')}}`;
    }

    public applyHasitemEditorChanges(): void {
        const container = document.getElementById('hasitem-conditions-container');
        if (!container) return;

        const conditions: any[] = [];
        Array.from(container.children).forEach(itemElement => {
            const itemInput = itemElement.querySelector('[id^="hasitem-item-"]') as HTMLInputElement;
            const dataInput = itemElement.querySelector('[id^="hasitem-data-"]') as HTMLInputElement;
            const quantityInput = itemElement.querySelector('[id^="hasitem-quantity-"]') as HTMLInputElement;
            const locationInput = itemElement.querySelector('[id^="hasitem-location-"]') as HTMLInputElement;
            const slotInput = itemElement.querySelector('[id^="hasitem-slot-"]') as HTMLInputElement;

            const condition: any = {};
            if (itemInput?.value) condition.item = itemInput.value;
            if (dataInput?.value) condition.data = parseInt(dataInput.value);
            if (quantityInput?.value) condition.quantity = quantityInput.value;
            if (locationInput?.value) condition.location = locationInput.value;
            if (slotInput?.value) condition.slot = slotInput.value;

            if (Object.keys(condition).length > 0) {
                conditions.push(condition);
            }
        });
        console.log('applyHasitemEditorChanges collected conditions:', conditions); // DEBUG

        const tag = this.appState.currentEditingTag;
        if (tag) {
            const selectorInput = document.getElementById('sel-hasitem') as HTMLTextAreaElement;
            if (selectorInput) {
                let formattedHasitem = '';
                if (conditions.length > 1) {
                    formattedHasitem = `[${conditions.map(item => this.formatObjectToKeyValueString(item)).join(',')}]`;
                } else if (conditions.length === 1) {
                    formattedHasitem = this.formatObjectToKeyValueString(conditions[0]);
                }
                selectorInput.value = formattedHasitem;
                console.log('applyHasitemEditorChanges formattedHasitem:', formattedHasitem); // DEBUG
            }
        }
        this.modalManager.hide(); // 关闭子模态框
    }

    public applyScoreEditorChanges(): void {
        const container = document.getElementById('score-conditions-container');
        if (!container) return;

        const conditions: { objective: string; value: string }[] = [];
        Array.from(container.children).forEach(itemElement => {
            const objectiveInput = itemElement.querySelector('[id^="score-objective-"]') as HTMLInputElement;
            const valueInput = itemElement.querySelector('[id^="score-value-"]') as HTMLInputElement;

            const condition: { objective?: string; value?: string } = {};
            if (objectiveInput?.value) condition.objective = objectiveInput.value;
            if (valueInput?.value) condition.value = valueInput.value;

            if (condition.objective && condition.value) { // 确保计分项和值都存在
                conditions.push({ objective: condition.objective, value: condition.value });
            }
        });
        console.log('applyScoreEditorChanges collected conditions:', conditions); // DEBUG

        const tag = this.appState.currentEditingTag;
        if (tag) {
            const selectorInput = document.getElementById('sel-scores') as HTMLTextAreaElement;
            if (selectorInput) {
                let formattedScores = '';
                if (conditions.length > 0) {
                    const scoreParts = conditions.map(c => `${c.objective}=${c.value}`);
                    formattedScores = `{${scoreParts.join(',')}}`;
                }
                selectorInput.value = formattedScores;
                console.log('applyScoreEditorChanges formattedScores:', formattedScores); // DEBUG
            }
        }
        this.modalManager.hide(); // 关闭子模态框
    }

    // 用于隐藏当前模态框，供 HTML 中的 onclick 调用
    public hideCurrentModal(): void {
        this.modalManager.hide();
    }

    // 为计分板名称显示选择器编辑器
    public showSelectorEditorForScoreName(targetInputId: string): void {
        this.currentSelectorTargetInputId = targetInputId;
        // 创建一个临时的 HTMLElement 来传递给 getSelectorModalContent
        // getSelectorModalContent 期望一个 tag.dataset.selector
        // 这里从当前的 score-name input 获取值
        const scoreNameInput = document.getElementById(targetInputId) as HTMLInputElement;
        const tempTag = document.createElement('div');
        tempTag.dataset.selector = scoreNameInput ? scoreNameInput.value : '@p';
        this.modalManager.show(this.getSelectorModalContent(tempTag));
    }

    // 公共方法，填充选择器输入框
    public fillSelectorInput(selector: string): void {
        if (this.currentSelectorTargetInputId) {
            const targetInput = document.getElementById(this.currentSelectorTargetInputId) as HTMLInputElement;
            if (targetInput) {
                targetInput.value = selector;
            }
            this.currentSelectorTargetInputId = null; // 重置
        }
        this.modalManager.hide(); // 关闭选择器模态框
    }

    // 公共方法，检查选择器目标是否已设置
    public isSelectorTargetSet(): boolean {
        return this.currentSelectorTargetInputId !== null;
    }

    // Conditional Editor methods
    public getConditionalEditorContent(tag: HTMLElement): string {
        const currentCondition = JSON.parse(tag.dataset.condition || '{}');
        const currentThen = tag.dataset.then || '[{"text":"Success!"}]';

        let conditionType = 'rawjson'; // Default to rawjson
        if (currentCondition.score) {
            conditionType = 'score';
        } else if (currentCondition.selector) {
            conditionType = 'selector';
        } else if (Object.keys(currentCondition).length > 0) {
            conditionType = 'rawjson'; // If it's not selector or score, assume rawjson
        }


        // Extract score value if it's a score condition
        let scoreValue = '';
        if (conditionType === 'score' && currentCondition.score) {
            const scoreObj = currentCondition.score;
            if (scoreObj.min !== undefined && scoreObj.max !== undefined) {
                scoreValue = `${scoreObj.min}..${scoreObj.max}`;
            } else if (scoreObj.min !== undefined) {
                scoreValue = `${scoreObj.min}..`;
            } else if (scoreObj.max !== undefined) {
                scoreValue = `..${scoreObj.max}`;
            } else if (scoreObj.value !== undefined) {
                scoreValue = `${scoreObj.value}`;
            } else if (scoreObj.not !== undefined) {
                scoreValue = `!${scoreObj.not}`;
            }
        }


        return `
            <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">编辑条件块</h2>
            <div class="space-y-4">
                <!-- IF Condition Section -->
                <div class="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
                    <h3 class="${MODAL_SECTION_TITLE_CLASSES} mb-3">IF (条件)</h3>
                    <div class="mb-4">
                        <label class="${MODAL_LABEL_CLASSES}">条件类型</label>
                        <select id="conditional-type-select" class="${MODAL_INPUT_CLASSES}" onchange="window.App.UI.updateConditionalEditorConditionType(this.value)">
                            <option value="selector" ${conditionType === 'selector' ? 'selected' : ''}>选择器 (selector)</option>
                            <option value="score" ${conditionType === 'score' ? 'selected' : ''}>计分板 (score)</option>
                            <option value="rawjson" ${conditionType === 'rawjson' ? 'selected' : ''}>RawJSON</option>
                        </select>
                    </div>

                    <div id="conditional-selector-editor" class="${conditionType === 'selector' ? '' : 'hidden'} space-y-4">
                        <div>
                            <label class="${MODAL_LABEL_CLASSES}">选择器</label>
                            <div class="flex">
                                <input id="conditional-selector-input" type="text" value="${currentCondition.selector || '@p'}" class="${MODAL_INPUT_CLASSES} flex-grow" placeholder="@p[tag=vip]">
                                <button type="button" onclick="window.App.UI.showSelectorEditorForConditional('conditional-selector-input')" class="ml-2 p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-10 w-10 flex items-center justify-center">?</button>
                            </div>
                        </div>
                    </div>

                    <div id="conditional-score-editor" class="${conditionType === 'score' ? '' : 'hidden'} space-y-4">
                        <div>
                            <label class="${MODAL_LABEL_CLASSES}">计分对象</label>
                            <div class="flex">
                                <input id="conditional-score-name" type="text" value="${currentCondition.score?.name || '@p'}" class="${MODAL_INPUT_CLASSES} flex-grow" placeholder="@p, 玩家名...">
                                <button type="button" onclick="window.App.UI.showSelectorEditorForConditional('conditional-score-name')" class="ml-2 p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-10 w-10 flex items-center justify-center">?</button>
                            </div>
                        </div>
                        <div>
                            <label class="${MODAL_LABEL_CLASSES}">计分项</label>
                            <input id="conditional-score-objective" type="text" value="${currentCondition.score?.objective || 'money'}" class="${MODAL_INPUT_CLASSES}" placeholder="分数, 金钱...">
                        </div>
                        <div>
                            <label class="${MODAL_LABEL_CLASSES}">分数 (支持范围, 例如: 10, 5.., ..15, 10..12, !10)</label>
                            <input id="conditional-score-value" type="text" value="${scoreValue}" class="${MODAL_INPUT_CLASSES}" placeholder="10, 5.., ..15, 10..12, !10">
                        </div>
                    </div>

                    <div id="conditional-rawjson-editor" class="${conditionType === 'rawjson' ? '' : 'hidden'} space-y-4">
                        <div>
                            <label class="${MODAL_LABEL_CLASSES}">RawJSON 条件</label>
                            <textarea id="conditional-rawjson-input" class="w-full h-24 font-mono ${MODAL_INPUT_CLASSES}" placeholder='{"test":"value"}\n或者\n{"selector":"@a[tag=admin]"}' >${tag.dataset.condition || ''}</textarea>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">输入一个有效的 JSON 对象作为条件。</p>
                        </div>
                    </div>
                </div>

                <!-- THEN Result Section -->
                <div class="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
                    <h3 class="${MODAL_SECTION_TITLE_CLASSES} mb-3">THEN (结果)</h3>
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">Rawtext JSON 数组</label>
                        <textarea id="conditional-then-input" class="w-full h-24 font-mono ${MODAL_INPUT_CLASSES}" placeholder='[{"text":"You are a VIP!"}]'>${currentThen}</textarea>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">输入一个 Rawtext 数组作为条件成功时显示的内容。</p>
                    </div>
                </div>
            </div>
        `;
    }

    public updateConditionalEditorConditionType(type: string): void {
        const selectorEditor = document.getElementById('conditional-selector-editor');
        const scoreEditor = document.getElementById('conditional-score-editor');
        const rawjsonEditor = document.getElementById('conditional-rawjson-editor');

        if (selectorEditor && scoreEditor && rawjsonEditor) {
            selectorEditor.classList.add('hidden');
            scoreEditor.classList.add('hidden');
            rawjsonEditor.classList.add('hidden');

            if (type === 'selector') {
                selectorEditor.classList.remove('hidden');
            } else if (type === 'score') {
                scoreEditor.classList.remove('hidden');
            } else if (type === 'rawjson') {
                rawjsonEditor.classList.remove('hidden');
            }
        }
    }

    public showSelectorEditorForConditional(targetInputId: string): void {
        this.currentSelectorTargetInputId = targetInputId;
        const targetInput = document.getElementById(targetInputId) as HTMLInputElement;
        const tempTag = document.createElement('div');
        tempTag.dataset.selector = targetInput ? targetInput.value : '@p';
        this.modalManager.show(this.getSelectorModalContent(tempTag));
    }
}
