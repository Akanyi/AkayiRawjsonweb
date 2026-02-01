// script/converter.ts
import { RawTextComponent, createFunctionTag } from './utils.js';

export class JsonConverter {
    private richTextEditor: HTMLElement;
    private jsonOutput: HTMLElement;
    private preview: HTMLElement;

    constructor() {
        this.richTextEditor = document.getElementById('richTextEditor') as HTMLElement;
        this.jsonOutput = document.getElementById('jsonOutput') as HTMLElement;
        this.preview = document.getElementById('preview') as HTMLElement;
    }

    public generateJson(): void {
        const rawtext = this.parseNodes(this.richTextEditor);
        const json = { rawtext };
        this.jsonOutput.textContent = JSON.stringify(json, null, 2);
        this.updatePreview(rawtext);
    }

    private parseNodes(node: Node): RawTextComponent[] {
        let result: RawTextComponent[] = [];
        for (const child of Array.from(node.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) {
                if (child.textContent) {
                    result.push({ text: child.textContent.replace(/\u00A0/g, ' ') });
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const element = child as HTMLElement;
                if (element.classList.contains('function-tag')) {
                    const data = { ...element.dataset };
                    const type = data.type;
                    delete data.type;

                    let obj: RawTextComponent = {};
                    if (type === 'translate') {
                        try {
                            const withParams = JSON.parse(data.with || '[]');
                            obj = { translate: data.translate, with: withParams };
                        } catch (e) {
                            obj = { translate: data.translate, with: [] };
                            console.error("解析翻译参数失败", e);
                        }
                    } else if (type === 'score') {
                        obj = { score: { name: data.name || '', objective: data.objective || '' } };
                    } else if (type === 'selector') {
                        obj = { selector: data.selector };
                    } else if (type === 'conditional') {
                        try {
                            const condition = JSON.parse(data.condition || '{}');
                            const thenBlock = JSON.parse(data.then || '[]');
                            obj = {
                                translate: "%%2",
                                with: {
                                    rawtext: [
                                        condition,
                                        { rawtext: thenBlock }
                                    ]
                                }
                            };
                        } catch (e) {
                            console.error("解析条件块失败", e);
                            obj = { text: "[条件块解析错误]" };
                        }
                    }
                    result.push(obj);
                } else if (element.tagName === 'DIV' || element.tagName === 'P') {
                    // 每个 DIV/P 都表示一个换行，保留多个连续换行
                    result.push({ text: '\n' });
                    result = result.concat(this.parseNodes(element));
                } else {
                    result = result.concat(this.parseNodes(element));
                }
            }
        }
        // 合并连续的文本节点
        return result.reduce((acc: RawTextComponent[], curr: RawTextComponent) => {
            const last = acc[acc.length - 1];
            if (last && last.text !== undefined && curr.text !== undefined) {
                last.text += curr.text;
            } else {
                acc.push(curr);
            }
            return acc;
        }, []);
    }

    private updatePreview(rawtext: RawTextComponent[]): void {
        this.preview.innerHTML = '';
        this.preview.className = 'mc-preview min-h-[50px] whitespace-pre-wrap break-words';

        const isEffectiveEmpty = !rawtext || rawtext.length === 0 || rawtext.every(item => item.text !== undefined && item.text.trim() === '' && Object.keys(item).length === 1);

        if (isEffectiveEmpty) {
            this.preview.innerHTML = '<span class="text-gray-500 italic">预览将显示在这里...</span>';
            return;
        }

        rawtext.forEach(item => {
            if (item.text) {
                // 解析颜色和格式代码
                this.appendFormattedText(item.text);
            } else if (item.score) {
                const span = document.createElement('span');
                span.textContent = `${item.score.name}`;
                span.className = 'mc-mock-score';
                span.title = `计分板: ${item.score.objective}`;
                this.preview.appendChild(span);
            } else if (item.selector) {
                const span = document.createElement('span');
                // Mock: 显示示例玩家名
                span.textContent = this.getMockSelectorName(item.selector);
                span.className = 'mc-mock-selector';
                span.title = `选择器: ${item.selector}`;
                this.preview.appendChild(span);
            } else if (item.translate === "%%2" && item.with) {
                const span = document.createElement('span');
                span.textContent = '[条件内容]';
                span.className = 'mc-mock-condition';
                span.title = '条件块';
                this.preview.appendChild(span);
            } else if (item.translate) {
                const span = document.createElement('span');
                span.textContent = `[${item.translate}]`;
                span.className = 'mc-mock-translate';
                span.title = `翻译键`;
                this.preview.appendChild(span);
            }
        });
    }

    private appendFormattedText(text: string): void {
        // MC 颜色代码映射
        const colorMap: { [key: string]: string } = {
            '0': 'mc-0', '1': 'mc-1', '2': 'mc-2', '3': 'mc-3',
            '4': 'mc-4', '5': 'mc-5', '6': 'mc-6', '7': 'mc-7',
            '8': 'mc-8', '9': 'mc-9', 'a': 'mc-a', 'b': 'mc-b',
            'c': 'mc-c', 'd': 'mc-d', 'e': 'mc-e', 'f': 'mc-f',
            'g': 'mc-g'
        };
        const formatMap: { [key: string]: string } = {
            'l': 'mc-l', 'o': 'mc-o', 'n': 'mc-n', 'm': 'mc-m', 'k': 'mc-k'
        };

        let currentClasses: string[] = ['mc-f']; // 默认白色
        let buffer = '';
        let i = 0;

        const flushBuffer = () => {
            if (buffer) {
                const span = document.createElement('span');
                span.textContent = buffer;
                span.className = currentClasses.join(' ');
                this.preview.appendChild(span);
                buffer = '';
            }
        };

        while (i < text.length) {
            if (text[i] === '§' && i + 1 < text.length) {
                flushBuffer();
                const code = text[i + 1].toLowerCase();
                if (code === 'r') {
                    currentClasses = ['mc-f']; // 重置
                } else if (colorMap[code]) {
                    // 颜色会重置格式
                    currentClasses = [colorMap[code]];
                } else if (formatMap[code]) {
                    currentClasses.push(formatMap[code]);
                }
                i += 2;
            } else {
                buffer += text[i];
                i++;
            }
        }
        flushBuffer();
    }

    private getMockSelectorName(selector: string): string {
        // 根据选择器类型返回模拟名称
        if (selector.startsWith('@p')) return 'Steve';
        if (selector.startsWith('@r')) return 'Alex';
        if (selector.startsWith('@a')) return 'Steve, Alex, ...';
        if (selector.startsWith('@e')) return '[实体]';
        if (selector.startsWith('@s')) return '[执行者]';
        return selector;
    }

    public decodeJson(jsonInput: string, editor: HTMLElement, updateTagContent: (tag: HTMLElement) => void, editFeature: (tag: HTMLElement) => void, hideModal: () => void): void {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.rawtext || !Array.isArray(parsed.rawtext)) {
                throw new Error("无效的 RawJSON 格式");
            }

            editor.innerHTML = '';

            parsed.rawtext.forEach((item: RawTextComponent) => {
                if (item.text) {
                    editor.appendChild(document.createTextNode(item.text));
                } else {
                    let type: string | undefined;
                    let initialDataset: { [key: string]: string } = {};

                    if (item.translate === "%%2") {
                        const withContent = (item.with as any).rawtext || item.with; // Support both {rawtext: [...]} and [...]
                        if (Array.isArray(withContent) && withContent.length === 2) {
                            const conditionalContent = withContent[1];
                            if (typeof conditionalContent === 'object' && conditionalContent !== null) {
                                type = 'conditional';
                                initialDataset = {
                                    condition: JSON.stringify(withContent[0] || {}),
                                    then: JSON.stringify((conditionalContent as any).rawtext || conditionalContent || [])
                                };
                            }
                        }
                    } else if (item.score) {
                        type = 'score';
                        initialDataset = { name: item.score.name, objective: item.score.objective };
                    } else if (item.selector) {
                        type = 'selector';
                        initialDataset = { selector: item.selector };
                    } else if (item.translate) {
                        type = 'translate';
                        initialDataset = { translate: item.translate, with: JSON.stringify(item.with || []) };
                    }

                    if (type) {
                        const tag = createFunctionTag(type, initialDataset, updateTagContent, editFeature);
                        editor.appendChild(tag);
                    }
                }
            });

            this.generateJson();
            hideModal();

        } catch (e: any) {
            alert("JSON 解析失败: " + e.message);
        }
    }
}
