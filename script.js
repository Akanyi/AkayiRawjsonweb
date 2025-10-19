const App = {
    state: {
        isDarkMode: false,
        isMenuOpen: false,
        isModalOpen: false,
        currentEditingTag: null,
    },

    // --- 初始化 ---
    init() {
        this.UI.initTheme();
        this.UI.initMenu();
        this.UI.initModals();
        this.UI.renderColorButtons();
        this.RichTextEditor.init();

        console.log("应用已初始化");
    },

    // --- UI 模块 ---
    UI: {
        initTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                App.state.isDarkMode = true;
                document.documentElement.classList.add('dark');
            }
            document.getElementById('toggle-dark-mode').addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        },

        toggleTheme() {
            App.state.isDarkMode = !App.state.isDarkMode;
            document.documentElement.classList.toggle('dark', App.state.isDarkMode);
            localStorage.setItem('theme', App.state.isDarkMode ? 'dark' : 'light');
        },

        initMenu() {
            const menuButton = document.getElementById('menu-button');
            const menuContent = document.getElementById('menu-content');
            
            menuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                App.state.isMenuOpen = !App.state.isMenuOpen;
                menuContent.classList.toggle('hidden', !App.state.isMenuOpen);
            });

            document.addEventListener('click', () => {
                if (App.state.isMenuOpen) {
                    App.state.isMenuOpen = false;
                    menuContent.classList.add('hidden');
                }
            });
        },
        
        initModals() {
            document.getElementById('about-btn').addEventListener('click', (e) => { e.preventDefault(); this.showModal(this.getAboutModalContent()); });
            document.getElementById('decode-json-btn').addEventListener('click', (e) => { e.preventDefault(); this.showModal(this.getDecodeModalContent()); });
            document.getElementById('modal-backdrop').addEventListener('click', () => this.hideModal());
            document.getElementById('copy-json-btn').addEventListener('click', () => this.copyJson());
        },

        showModal(content) {
            if (App.state.isModalOpen) return;
            App.state.isModalOpen = true;

            const modalContainer = document.getElementById('modal-container');
            const modalBackdrop = document.getElementById('modal-backdrop');

            modalContainer.innerHTML = content;
            modalContainer.classList.remove('hidden');
            modalBackdrop.classList.remove('hidden');

            modalContainer.querySelector('.modal-content').classList.add('fade-in');

            // 添加关闭事件
            modalContainer.querySelector('.close-modal-btn').addEventListener('click', () => this.hideModal());
        },

        hideModal() {
            if (!App.state.isModalOpen) return;

            const modalContainer = document.getElementById('modal-container');
            const modalBackdrop = document.getElementById('modal-backdrop');
            const modalContent = modalContainer.querySelector('.modal-content');
            
            if (modalContent) {
                modalContent.classList.remove('fade-in');
                modalContent.classList.add('fade-out');
            }

            setTimeout(() => {
                modalContainer.classList.add('hidden');
                modalBackdrop.classList.add('hidden');
                modalContainer.innerHTML = '';
                App.state.isModalOpen = false;
                App.state.currentEditingTag = null;
            }, 300);
        },

        renderColorButtons() {
            const colors = [
                { name: '§0 黑', code: '§0', bg: '#000000', text: 'white' }, { name: '§1 深蓝', code: '§1', bg: '#0000AA', text: 'white' },
                { name: '§2 深绿', code: '§2', bg: '#00AA00', text: 'white' }, { name: '§3 湖蓝', code: '§3', bg: '#00AAAA', text: 'white' },
                { name: '§4 深红', code: '§4', bg: '#AA0000', text: 'white' }, { name: '§5 紫', code: '§5', bg: '#AA00AA', text: 'white' },
                { name: '§6 金', code: '§6', bg: '#FFAA00', text: 'white' }, { name: '§7 灰', code: '§7', bg: '#AAAAAA', text: 'black' },
                { name: '§8 深灰', code: '§8', bg: '#555555', text: 'white' }, { name: '§9 蓝', code: '§9', bg: '#5555FF', text: 'white' },
                { name: '§a 绿', code: '§a', bg: '#55FF55', text: 'black' }, { name: '§b 水蓝', code: '§b', bg: '#55FFFF', text: 'black' },
                { name: '§c 红', code: '§c', bg: '#FF5555', text: 'white' }, { name: '§d 粉', code: '§d', bg: '#FF55FF', text: 'white' },
                { name: '§e 黄', code: '§e', bg: '#FFFF55', text: 'black' }, { name: '§f 白', code: '§f', bg: '#FFFFFF', text: 'black', border: true },
                { name: '§k 随机', code: '§k', bg: '#555555', text: 'white' }, { name: '§l 粗体', code: '§l', bg: '#555555', text: 'white', bold: true },
                { name: '§o 斜体', code: '§o', bg: '#555555', text: 'white', italic: true }, { name: '§r 重置', code: '§r', bg: '#888888', text: 'white' }
            ];
            const container = document.getElementById('colorButtons');
            container.innerHTML = colors.map(color => `
                <button 
                    style="background-color:${color.bg}; color:${color.text}; ${color.border ? 'border: 1px solid #ccc;' : ''} ${color.bold ? 'font-weight:bold;' : ''} ${color.italic ? 'font-style:italic;' : ''}"
                    class="p-2 rounded shadow transition-transform transform hover:scale-110"
                    onclick="App.RichTextEditor.insertCode('${color.code}')">
                    ${color.name}
                </button>
            `).join('');
        },
        
        copyJson() {
            const jsonText = document.getElementById('jsonOutput').textContent;
            navigator.clipboard.writeText(jsonText).then(() => {
                const btn = document.getElementById('copy-json-btn');
                const originalText = btn.textContent;
                btn.textContent = '已复制!';
                setTimeout(() => btn.textContent = originalText, 2000);
            }).catch(err => console.error('复制失败:', err));
        },

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
        },

        getDecodeModalContent() {
            return `
                <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">解析 JSON</h2>
                        <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
                    </div>
                    <textarea id="json-input-area" class="w-full h-40 p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" placeholder="在此粘贴你的 RawJSON..."></textarea>
                    <button onclick="App.JsonLogic.decodeJson()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">解析</button>
                </div>
            `;
        },
        
        getEditModalContent(type) {
            const tag = App.state.currentEditingTag;
            let content = '';
            const inputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200";
            const labelClasses = "block mb-1 font-semibold text-gray-700 dark:text-gray-300";

            switch(type) {
                case 'score':
                    content = `
                        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">编辑计分板</h2>
                        <div class="space-y-4">
                            <div>
                                <label class="${labelClasses}">计分对象</label>
                                <input id="score-name" type="text" value="${tag.dataset.name}" class="${inputClasses}" placeholder="@p, 玩家名...">
                            </div>
                            <div>
                                <label class="${labelClasses}">计分项</label>
                                <input id="score-objective" type="text" value="${tag.dataset.objective}" class="${inputClasses}" placeholder="分数, 金钱...">
                            </div>
                        </div>
                    `;
                    break;
                case 'selector':
                     content = `
                        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">编辑选择器</h2>
                        <div>
                            <label class="${labelClasses}">选择器</label>
                            <input id="selector-value" type="text" value="${tag.dataset.selector}" class="${inputClasses}" placeholder="@p, @a[tag=vip]...">
                        </div>
                    `;
                    break;
                case 'translate':
                    content = `
                        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">编辑翻译</h2>
                        <div class="space-y-4">
                            <div>
                                <label class="${labelClasses}">翻译键</label>
                                <input id="translate-key" type="text" value="${tag.dataset.translate}" class="${inputClasses}" placeholder="welcome.message.1">
                            </div>
                            <div>
                                <label class="${labelClasses}">参数 (JSON 数组格式)</label>
                                <textarea id="translate-with" class="w-full h-24 ${inputClasses}" placeholder='[{"text":"玩家"}]'>${tag.dataset.with || ''}</textarea>
                            </div>
                        </div>
                    `;
                    break;
                case 'conditional':
                    content = `
                        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">编辑条件块</h2>
                        <div class="space-y-4">
                            <div>
                                <label class="${labelClasses}">IF (条件 - JSON 对象)</label>
                                <textarea id="conditional-condition" class="w-full h-24 font-mono ${inputClasses}" placeholder='{"selector":"@p[tag=vip]"}\n或者\n{"score":{"name":"@p","objective":"money","min":100}}'>${tag.dataset.condition || ''}</textarea>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">输入单个 JSON 对象作为条件。</p>
                            </div>
                            <div>
                                <label class="${labelClasses}">THEN (结果 - Rawtext JSON 数组)</label>
                                <textarea id="conditional-then" class="w-full h-24 font-mono ${inputClasses}" placeholder='[{"text":"You are a VIP!"}]'>${tag.dataset.then || ''}</textarea>
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
                        <button onclick="App.UI.hideModal()" class="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded">取消</button>
                        <button onclick="App.RichTextEditor.applyEdit()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">保存</button>
                    </div>
                </div>
            `;
        }
    },

    // --- 富文本编辑器模块 ---
    RichTextEditor: {
        init() {
            const editor = document.getElementById('richTextEditor');
            editor.addEventListener('input', this.handleInput);
            editor.addEventListener('paste', this.handlePaste);
        },

        handleInput() {
            App.JsonLogic.generateJson();
        },
        
        handlePaste(e) {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        },
        
        insertCode(code) {
            document.execCommand('insertText', false, code);
            App.JsonLogic.generateJson();
        },
        
        insertFeature(type) {
            const editor = document.getElementById('richTextEditor');
            editor.focus();

            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);

            const tag = document.createElement('span');
            tag.className = 'function-tag';
            tag.contentEditable = false;
            tag.dataset.type = type;

            switch(type) {
                case 'score':
                    tag.dataset.name = '@p';
                    tag.dataset.objective = 'score';
                    break;
                case 'selector':
                    tag.dataset.selector = '@p';
                    break;
                case 'translate':
                    tag.dataset.translate = 'key.example';
                    tag.dataset.with = '[{"text":"example"}]';
                    break;
                case 'conditional':
                    tag.dataset.condition = '{"selector":"@p"}';
                    tag.dataset.then = '[{"text":"Success!"}]';
                    break;
            }
            
            this.updateTagContent(tag);
            tag.addEventListener('click', () => this.editFeature(tag));
            
            range.deleteContents();
            range.insertNode(tag);

            // 将光标移动到标签后面
            const space = document.createTextNode('\u00A0'); // 插入一个不间断空格
            range.setStartAfter(tag);
            range.insertNode(space);
            range.setStartAfter(space);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            
            App.JsonLogic.generateJson();
        },

        updateTagContent(tag) {
            let text = `[${tag.dataset.type}]`;
            switch(tag.dataset.type) {
                case 'score': 
                    text = `[${tag.dataset.name}:${tag.dataset.objective}]`; 
                    break;
                case 'selector': 
                    text = `[${tag.dataset.selector}]`; 
                    break;
                case 'translate': 
                    text = `[t:${tag.dataset.translate}]`; 
                    break;
                case 'conditional':
                    try {
                        const cond = JSON.parse(tag.dataset.condition);
                        const condType = Object.keys(cond)[0] || '...';
                        text = `[IF ${condType} THEN ...]`;
                    } catch(e) {
                        text = '[IF ... THEN ...]';
                    }
                    break;
            }
            tag.textContent = text;
        },
        
        editFeature(tag) {
            App.state.currentEditingTag = tag;
            App.UI.showModal(App.UI.getEditModalContent(tag.dataset.type));
        },
        
        applyEdit() {
            const tag = App.state.currentEditingTag;
            if (!tag) return;
            
            switch(tag.dataset.type) {
                case 'score':
                    tag.dataset.name = document.getElementById('score-name').value;
                    tag.dataset.objective = document.getElementById('score-objective').value;
                    break;
                case 'selector':
                    tag.dataset.selector = document.getElementById('selector-value').value;
                    break;
                case 'translate':
                    tag.dataset.translate = document.getElementById('translate-key').value;
                    tag.dataset.with = document.getElementById('translate-with').value;
                    break;
                case 'conditional':
                    tag.dataset.condition = document.getElementById('conditional-condition').value;
                    tag.dataset.then = document.getElementById('conditional-then').value;
                    break;
            }

            this.updateTagContent(tag);
            App.JsonLogic.generateJson();
            App.UI.hideModal();
        }
    },

    // --- JSON 逻辑模块 ---
    JsonLogic: {
        generateJson() {
            const editor = document.getElementById('richTextEditor');
            const rawtext = this.parseNodes(editor);
            
            const json = { rawtext };
            document.getElementById('jsonOutput').textContent = JSON.stringify(json, null, 2);
            this.updatePreview(rawtext);
        },

        parseNodes(node) {
            let result = [];
            for (const child of node.childNodes) {
                if (child.nodeType === Node.TEXT_NODE) {
                    if (child.textContent) {
                       result.push({ text: child.textContent.replace(/\u00A0/g, ' ') }); // 替换不间断空格
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    if (child.classList.contains('function-tag')) {
                        const data = { ...child.dataset };
                        const type = data.type;
                        delete data.type;
                        
                        let obj = {};
                        if (type === 'translate') {
                            try {
                                const withParams = JSON.parse(data.with);
                                obj = { translate: data.translate, with: withParams };
                            } catch (e) {
                                obj = { translate: data.translate, with: [] };
                                console.error("解析翻译参数失败", e);
                            }
                        } else if (type === 'score') {
                            obj = { score: { name: data.name, objective: data.objective } };
                        } else if (type === 'selector') {
                            obj = { selector: data.selector };
                        } else if (type === 'conditional') {
                            try {
                                const condition = JSON.parse(data.condition);
                                const thenBlock = JSON.parse(data.then);
                                obj = {
                                    translate: "%%2",
                                    with: [
                                        condition,
                                        { rawtext: thenBlock }
                                    ]
                                };
                            } catch (e) {
                                console.error("解析条件块失败", e);
                                obj = { text: "[条件块解析错误]" };
                            }
                        }
                        result.push(obj);
                    } else if (child.tagName === 'DIV' || child.tagName === 'P') {
                        if (result.length > 0 && result[result.length - 1].text && !result[result.length - 1].text.endsWith('\n')) {
                            result.push({text: '\n'});
                        }
                        result = result.concat(this.parseNodes(child));
                    } else {
                        result = result.concat(this.parseNodes(child));
                    }
                }
            }
             // 合并连续的文本节点
            return result.reduce((acc, curr) => {
                if (acc.length > 0 && acc[acc.length - 1].text && curr.text) {
                    acc[acc.length - 1].text += curr.text;
                } else {
                    acc.push(curr);
                }
                return acc;
            }, []);
        },
        
        updatePreview(rawtext) {
            const preview = document.getElementById('preview');
            preview.innerHTML = '';
            if (!rawtext) return;
            
            rawtext.forEach(item => {
                const span = document.createElement('span');
                if(item.text) {
                    span.textContent = item.text;
                } else if (item.score) {
                    span.textContent = `[${item.score.name}:${item.score.objective}]`;
                    span.className = 'text-red-400';
                } else if (item.selector) {
                    span.textContent = `[${item.selector}]`;
                    span.className = 'text-green-400';
                } else if (item.translate === "%%2" && Array.isArray(item.with) && item.with.length === 2) {
                    span.textContent = `[IF...THEN...]`;
                    span.className = 'text-purple-400';
                } else if (item.translate) {
                    span.textContent = `[t:${item.translate}]`;
                    span.className = 'text-yellow-400';
                }
                preview.appendChild(span);
            });
        },
        
        decodeJson() {
            const input = document.getElementById('json-input-area').value;
            try {
                const parsed = JSON.parse(input);
                if (!parsed.rawtext || !Array.isArray(parsed.rawtext)) {
                    throw new Error("无效的 RawJSON 格式");
                }
                
                const editor = document.getElementById('richTextEditor');
                editor.innerHTML = '';
                
                parsed.rawtext.forEach(item => {
                    if (item.text) {
                        editor.appendChild(document.createTextNode(item.text));
                    } else if (item.translate === "%%2" && Array.isArray(item.with) && item.with.length === 2 && item.with[1].rawtext) {
                        const type = 'conditional';
                        const tag = document.createElement('span');
                        tag.className = 'function-tag';
                        tag.contentEditable = false;
                        tag.dataset.type = type;

                        tag.dataset.condition = JSON.stringify(item.with[0] || {});
                        tag.dataset.then = JSON.stringify(item.with[1].rawtext || []);

                        App.RichTextEditor.updateTagContent(tag);
                        tag.addEventListener('click', () => App.RichTextEditor.editFeature(tag));
                        editor.appendChild(tag);
                    } else if (item.score || item.selector || item.translate) {
                        const type = Object.keys(item)[0];
                        const tag = document.createElement('span');
                        tag.className = 'function-tag';
                        tag.contentEditable = false;
                        tag.dataset.type = type;

                        if (type === 'score') {
                            tag.dataset.name = item.score.name;
                            tag.dataset.objective = item.score.objective;
                        } else if (type === 'selector') {
                            tag.dataset.selector = item.selector;
                        } else if (type === 'translate') {
                            tag.dataset.translate = item.translate;
                            tag.dataset.with = JSON.stringify(item.with || []);
                        }
                        
                        App.RichTextEditor.updateTagContent(tag);
                        tag.addEventListener('click', () => App.RichTextEditor.editFeature(tag));
                        editor.appendChild(tag);
                    }
                });
                
                App.JsonLogic.generateJson();
                App.UI.hideModal();

            } catch(e) {
                alert("JSON 解析失败: " + e.message);
            }
        },
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
