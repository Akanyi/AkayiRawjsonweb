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

    public updateTagContent(tag: HTMLElement): void {
        let text = `[${tag.dataset.type}]`;
        switch (tag.dataset.type) {
            case 'score':
                text = `[${tag.dataset.name}:${tag.dataset.objective}]`;
                break;
            case 'selector':
                let selectorText = tag.dataset.selector || '@p';
                // 检查并解析hasitem参数，以便在显示时进行美化
                const hasitemMatch = selectorText.match(/hasitem=({.*?}|\[.*?\])/);
                if (hasitemMatch) {
                    try {
                        const hasitemValue = JSON.parse(hasitemMatch[1]);
                        let displayValue = '';
                        if (Array.isArray(hasitemValue)) {
                            displayValue = `[${hasitemValue.map(item => `{item=${item.item || '?'}}`).join(',')}]`;
                        } else if (typeof hasitemValue === 'object') {
                            displayValue = `{item=${hasitemValue.item || '?'}}`;
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
                tag.dataset.condition = (document.getElementById('conditional-condition') as HTMLTextAreaElement)?.value || '';
                tag.dataset.then = (document.getElementById('conditional-then') as HTMLTextAreaElement)?.value || '';
                break;
        }

        this.updateTagContent(tag);
        this.jsonConverter.generateJson();
        window.App.UI.hideCurrentModal(); // 使用新的隐藏方法
    }

    public applySelectorEdit(): void {
        const tag = this.appState.currentEditingTag;
        if (!tag) return;

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
                    // 尝试解析为JSON，确保格式正确
                    const parsedHasitem = JSON.parse(hasitemInput);
                    // 如果解析成功，将其作为字符串添加到参数中
                    params.push(`hasitem=${JSON.stringify(parsedHasitem)}`);
                } catch (e) {
                    console.error("hasitem 参数解析失败，请检查JSON格式", e);
                    alert("hasitem 参数解析失败，请检查JSON格式！");
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

        tag.dataset.selector = selector;
        this.updateTagContent(tag);
        this.jsonConverter.generateJson();
        window.App.UI.hideCurrentModal();
    }
}
