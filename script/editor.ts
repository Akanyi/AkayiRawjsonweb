// script/editor.ts
import { AppState } from './utils.js';
import { JsonConverter } from './converter.js';
import { UI } from './ui.js';

export class RichTextEditor {
    private appState: AppState;
    private jsonConverter: JsonConverter;
    private ui: UI;
    private editor: HTMLElement;

    constructor(appState: AppState, jsonConverter: JsonConverter, ui: UI) {
        this.appState = appState;
        this.jsonConverter = jsonConverter;
        this.ui = ui;
        this.editor = document.getElementById('richTextEditor') as HTMLElement;
    }

    public init(): void {
        this.editor.addEventListener('input', () => this.handleInput());
        this.editor.addEventListener('paste', (e) => this.handlePaste(e));
        // Add event listeners for feature buttons
        document.querySelector('button[onclick="App.RichTextEditor.insertFeature(\'score\')"]')?.addEventListener('click', () => this.insertFeature('score'));
        document.querySelector('button[onclick="App.RichTextEditor.insertFeature(\'selector\')"]')?.addEventListener('click', () => this.insertFeature('selector'));
        document.querySelector('button[onclick="App.RichTextEditor.insertFeature(\'translate\')"]')?.addEventListener('click', () => this.insertFeature('translate'));
        document.querySelector('button[onclick="App.RichTextEditor.insertFeature(\'conditional\')"]')?.addEventListener('click', () => this.insertFeature('conditional'));
    }

    private handleInput(): void {
        this.jsonConverter.generateJson();
    }

    private handlePaste(e: ClipboardEvent): void {
        e.preventDefault();
        const text = e.clipboardData?.getData('text/plain');
        if (text) {
            document.execCommand('insertText', false, text);
        }
    }

    public insertCode(code: string): void {
        document.execCommand('insertText', false, code);
        this.jsonConverter.generateJson();
    }

    public insertFeature(type: string): void {
        this.editor.focus();

        const selection = window.getSelection();
        if (!selection?.rangeCount) return;
        const range = selection.getRangeAt(0);

        const tag = document.createElement('span');
        tag.className = 'function-tag';
        tag.contentEditable = 'false';
        tag.dataset.type = type;

        switch (type) {
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

        const space = document.createTextNode('\u00A0');
        range.setStartAfter(tag);
        range.insertNode(space);
        range.setStartAfter(space);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        this.jsonConverter.generateJson();
    }

    // 新增一个辅助函数来格式化hasitem条件对象
    private formatHasitemCondition(condition: any): string {
        const parts: string[] = [];
        for (const key in condition) {
            if (Object.prototype.hasOwnProperty.call(condition, key)) {
                parts.push(`${key}=${condition[key]}`);
            }
        }
        return `{${parts.join(',')}}`;
    }

    public updateTagContent(tag: HTMLElement): void {
        let text = `[${tag.dataset.type}]`;
        switch (tag.dataset.type) {
            case 'score':
                text = `[${tag.dataset.name}:${tag.dataset.objective}]`;
                break;
            case 'selector':
                let selectorText = tag.dataset.selector || '@p';
                // 检查并解析hasitem参数，以便在显示时进行美化
                const hasitemMatch = selectorText.match(/hasitem=({[^}]*}|\[.*?\])/); // 匹配 hasitem={...} 或 hasitem=[...]
                if (hasitemMatch) {
                    try {
                        const hasitemString = hasitemMatch[1];
                        let displayValue = '';

                        const parseKeyValueString = (str: string) => {
                            const obj: { [key: string]: string } = {};
                            str.split(',').forEach(part => {
                                const [key, value] = part.split('=');
                                if (key && value) {
                                    obj[key.trim()] = value.trim();
                                }
                            });
                            return obj;
                        };

                        if (hasitemString.startsWith('[') && hasitemString.endsWith(']')) {
                            // 处理数组形式：[{k=v,...},{k=v,...}]
                            const innerContent = hasitemString.substring(1, hasitemString.length - 1);
                            const parsedArray = innerContent.split('},{').map(itemStr => {
                                const cleanedItemStr = itemStr.replace(/^{|}$/g, ''); // 移除可能存在的花括号
                                return parseKeyValueString(cleanedItemStr);
                            });
                            displayValue = `[${parsedArray.map(item => this.formatHasitemCondition(item)).join(',')}]`;
                        } else if (hasitemString.startsWith('{') && hasitemString.endsWith('}')) {
                            // 处理单个对象形式：{k=v,...}
                            const innerContent = hasitemString.substring(1, hasitemString.length - 1);
                            const parsedObject = parseKeyValueString(innerContent);
                            displayValue = this.formatHasitemCondition(parsedObject);
                        } else {
                            // 如果格式不符合预期，直接使用原始字符串
                            displayValue = hasitemString;
                        }
                        selectorText = selectorText.replace(hasitemMatch[0], `hasitem=${displayValue}`);
                    } catch (e) {
                        console.error("hasitem 显示解析失败", e);
                    }
                }
                text = `[${selectorText}]`;
                break;
            case 'translate':
                text = `[t:${tag.dataset.translate}]`;
                break;
            case 'conditional':
                try {
                    const cond = JSON.parse(tag.dataset.condition || '{}');
                    const condType = Object.keys(cond)[0] || '...';
                    text = `[IF ${condType} THEN ...]`;
                } catch (e) {
                    text = '[IF ... THEN ...]';
                }
                break;
        }
        tag.textContent = text;
    }

    public editFeature(tag: HTMLElement): void {
        this.appState.currentEditingTag = tag;
        if (tag.dataset.type === 'selector') {
            window.App.UI.modalManager.show(window.App.UI.getSelectorModalContent(tag));
        } else {
            window.App.UI.modalManager.show(window.App.UI.getEditModalContent(tag.dataset.type || ''));
        }
    }

    public applyEdit(): void {
        const tag = this.appState.currentEditingTag;
        if (!tag) return;

        switch (tag.dataset.type) {
            case 'score':
                tag.dataset.name = (document.getElementById('score-name') as HTMLInputElement)?.value || '';
                tag.dataset.objective = (document.getElementById('score-objective') as HTMLInputElement)?.value || '';
                break;
            case 'translate':
                tag.dataset.translate = (document.getElementById('translate-key') as HTMLInputElement)?.value || '';
                tag.dataset.with = (document.getElementById('translate-with') as HTMLTextAreaElement)?.value || '';
                break;
            case 'conditional':
                const conditionType = (document.getElementById('conditional-type-select') as HTMLSelectElement)?.value;
                let condition: any = {};

                if (conditionType === 'selector') {
                    const selectorInput = (document.getElementById('conditional-selector-input') as HTMLInputElement)?.value;
                    if (selectorInput) {
                        condition.selector = selectorInput;
                    }
                } else if (conditionType === 'score') {
                    const scoreName = (document.getElementById('conditional-score-name') as HTMLInputElement)?.value;
                    const scoreObjective = (document.getElementById('conditional-score-objective') as HTMLInputElement)?.value;
                    const scoreValue = (document.getElementById('conditional-score-value') as HTMLInputElement)?.value;

                    const scoreObj: any = {};
                    if (scoreName) scoreObj.name = scoreName;
                    if (scoreObjective) scoreObj.objective = scoreObjective;

                    if (scoreValue) {
                        if (scoreValue.includes('..')) {
                            const parts = scoreValue.split('..');
                            if (parts[0] !== '') scoreObj.min = parseInt(parts[0]);
                            if (parts[1] !== '') scoreObj.max = parseInt(parts[1]);
                        } else if (scoreValue.startsWith('!')) {
                            scoreObj.not = parseInt(scoreValue.substring(1));
                        } else {
                            scoreObj.value = parseInt(scoreValue);
                        }
                    }

                    if (Object.keys(scoreObj).length > 0) {
                        condition.score = scoreObj;
                    }
                } else if (conditionType === 'rawjson') {
                    const rawjsonInput = (document.getElementById('conditional-rawjson-input') as HTMLTextAreaElement)?.value;
                    if (rawjsonInput) {
                        try {
                            condition = JSON.parse(rawjsonInput);
                        } catch (e) {
                            console.error("Invalid RawJSON condition:", e);
                            alert("RawJSON 条件格式不正确，请检查！");
                            return; // Stop applying edit if JSON is invalid
                        }
                    }
                }
                tag.dataset.condition = JSON.stringify(condition);
                tag.dataset.then = (document.getElementById('conditional-then-input') as HTMLTextAreaElement)?.value || '';
                break;
        }

        this.updateTagContent(tag);
        this.jsonConverter.generateJson();
        window.App.UI.hideCurrentModal(); // 使用新的隐藏方法
    }

    public applySelectorEdit(): void {
        const advancedForm = document.getElementById('selector-advanced-form');
        const manualForm = document.getElementById('selector-manual-form');
        let selector = '';

        if (manualForm && !manualForm.classList.contains('hidden')) {
            // Manual mode is active
            selector = (document.getElementById('manual-selector-input') as HTMLTextAreaElement)?.value || '';
        } else if (advancedForm && !advancedForm.classList.contains('hidden')) {
            // Advanced mode is active
            const base = (document.getElementById('sel-base') as HTMLSelectElement)?.value || 'p';
            let params: string[] = [];

            const fields = ['type', 'name', 'c', 'family', 'x', 'y', 'z', 'r', 'rm', 'rx', 'rxm', 'ry', 'rym', 'dx', 'dy', 'dz', 'm', 'lm', 'l'];
            fields.forEach(id => {
                const el = document.getElementById(`sel-${id}`) as HTMLInputElement | HTMLSelectElement;
                if (el && el.value !== '') { // 确保空字符串不被添加
                    params.push(`${id}=${el.value}`);
                }
            });

            const hasitemInput = (document.getElementById('sel-hasitem') as HTMLTextAreaElement)?.value;
            if (hasitemInput && hasitemInput.trim() !== '') {
                try {
                    // 自定义解析hasitem参数
                    const parseKeyValueString = (str: string) => {
                        const obj: { [key: string]: string } = {};
                        str.split(',').forEach(part => {
                            const [key, value] = part.split('=');
                            if (key && value) {
                                obj[key.trim()] = value.trim();
                            }
                        });
                        return obj;
                    };

                    let parsedHasitem: any;
                    const trimmedInput = hasitemInput.trim();

                    if (trimmedInput.startsWith('[') && trimmedInput.endsWith(']')) {
                        // 处理数组形式：[{k=v,...},{k=v,...}]
                        const innerContent = trimmedInput.substring(1, trimmedInput.length - 1);
                        parsedHasitem = innerContent.split('},{').map(itemStr => {
                            const cleanedItemStr = itemStr.replace(/^{|}$/g, ''); // 移除可能存在的花括号
                            return parseKeyValueString(cleanedItemStr);
                        });
                    } else if (trimmedInput.startsWith('{') && trimmedInput.endsWith('}')) {
                        // 处理单个对象形式：{k=v,...}
                        const innerContent = trimmedInput.substring(1, trimmedInput.length - 1);
                        parsedHasitem = parseKeyValueString(innerContent);
                    } else {
                        throw new Error("hasitem 参数格式不正确，必须用 {} 或 []{} 框起来。");
                    }

                    // 检查hasitem参数是否包含必要的'item'字段
                    let isValidHasitem = true;
                    if (Array.isArray(parsedHasitem)) {
                        for (const condition of parsedHasitem) {
                            if (typeof condition !== 'object' || condition === null || !condition.hasOwnProperty('item') || condition.item === '') {
                                isValidHasitem = false;
                                break;
                            }
                        }
                    } else if (typeof parsedHasitem === 'object' && parsedHasitem !== null) {
                        if (!parsedHasitem.hasOwnProperty('item') || parsedHasitem.item === '') {
                            isValidHasitem = false;
                        }
                    } else {
                        isValidHasitem = false; // 既不是对象也不是数组，格式不正确
                    }

                    if (!isValidHasitem) {
                        alert("hasitem 参数中缺少必要的 'item' 字段或格式不正确，请检查！");
                        return; // 阻止应用编辑，等待用户修正
                    }

                    // 如果解析成功且通过验证，将其作为字符串添加到参数中
                    // 这里需要将解析后的对象/数组重新格式化回 hasitem 的字符串形式
                    const formatKeyValueObject = (obj: { [key: string]: string }) => {
                        const parts: string[] = [];
                        for (const key in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                                parts.push(`${key}=${obj[key]}`);
                            }
                        }
                        return `{${parts.join(',')}}`;
                    };

                    let formattedHasitem = '';
                    if (Array.isArray(parsedHasitem)) {
                        formattedHasitem = `[${parsedHasitem.map(item => formatKeyValueObject(item)).join(',')}]`;
                    } else if (typeof parsedHasitem === 'object') {
                        formattedHasitem = formatKeyValueObject(parsedHasitem);
                    }

                    params.push(`hasitem=${formattedHasitem}`);

                } catch (e: any) {
                    console.error("hasitem 参数解析失败，请检查格式", e);
                    alert("hasitem 参数解析失败: " + e.message);
                    return; // 阻止应用编辑，等待用户修正
                }
            }

            const scoresInput = (document.getElementById('sel-scores') as HTMLTextAreaElement)?.value;
            if (scoresInput && scoresInput.trim() !== '') {
                try {
                    // 验证 scores 参数的格式是否为 {key=value,...}
                    const trimmedInput = scoresInput.trim();
                    if (!trimmedInput.startsWith('{') || !trimmedInput.endsWith('}')) {
                        throw new Error("scores 参数格式不正确，必须用 {} 框起来。");
                    }
                    // 进一步验证内部格式，确保是 key=value 对
                    const innerContent = trimmedInput.substring(1, trimmedInput.length - 1);
                    const scorePairs = innerContent.split(',');
                    for (const pair of scorePairs) {
                        if (!pair.includes('=')) {
                            throw new Error(`scores 参数中的 "${pair}" 格式不正确，应为 key=value。`);
                        }
                    }
                    params.push(`scores=${trimmedInput}`);
                } catch (e: any) {
                    console.error("scores 参数解析失败，请检查格式", e);
                    alert("scores 参数解析失败: " + e.message);
                    return; // 阻止应用编辑，等待用户修正
                }
            }

            const tagsInput = (document.getElementById('sel-tag') as HTMLInputElement)?.value;
            const tags = tagsInput ? tagsInput.split(',').filter(t => t.trim() !== '') : [];
            tags.forEach(t => {
                params.push(`tag=${t.trim()}`);
            });

            selector = `@${base}`;
            if (params.length > 0) {
                selector += `[${params.join(',')}]`;
            }
        }

        // 根据 currentSelectorTargetInputId 更新对应的输入框
        if (this.ui.isSelectorTargetSet()) { // 使用公共方法判断
            this.ui.fillSelectorInput(selector); // 调用 UI 的公共方法
        } else {
            // 否则，保持原有逻辑，更新 tag.dataset.selector
            const tag = this.appState.currentEditingTag;
            if (!tag) return; // 确保 tag 存在
            tag.dataset.selector = selector;
            this.updateTagContent(tag);
        }

        this.jsonConverter.generateJson();
        window.App.UI.hideCurrentModal();
    }
}
