export class JsonConverter {
    constructor() {
        this.richTextEditor = document.getElementById('richTextEditor');
        this.jsonOutput = document.getElementById('jsonOutput');
        this.preview = document.getElementById('preview');
    }
    generateJson() {
        const rawtext = this.parseNodes(this.richTextEditor);
        const json = { rawtext };
        this.jsonOutput.textContent = JSON.stringify(json, null, 2);
        this.updatePreview(rawtext);
    }
    parseNodes(node) {
        let result = [];
        for (const child of Array.from(node.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) {
                if (child.textContent) {
                    result.push({ text: child.textContent.replace(/\u00A0/g, ' ') });
                }
            }
            else if (child.nodeType === Node.ELEMENT_NODE) {
                const element = child;
                if (element.classList.contains('function-tag')) {
                    const data = { ...element.dataset };
                    const type = data.type;
                    delete data.type;
                    let obj = {};
                    if (type === 'translate') {
                        try {
                            const withParams = JSON.parse(data.with || '[]');
                            obj = { translate: data.translate, with: withParams };
                        }
                        catch (e) {
                            obj = { translate: data.translate, with: [] };
                            console.error("解析翻译参数失败", e);
                        }
                    }
                    else if (type === 'score') {
                        obj = { score: { name: data.name || '', objective: data.objective || '' } };
                    }
                    else if (type === 'selector') {
                        obj = { selector: data.selector };
                    }
                    else if (type === 'conditional') {
                        try {
                            const condition = JSON.parse(data.condition || '{}');
                            const thenBlock = JSON.parse(data.then || '[]');
                            obj = {
                                translate: "%%2",
                                with: [
                                    condition,
                                    { rawtext: thenBlock }
                                ]
                            };
                        }
                        catch (e) {
                            console.error("解析条件块失败", e);
                            obj = { text: "[条件块解析错误]" };
                        }
                    }
                    result.push(obj);
                }
                else if (element.tagName === 'DIV' || element.tagName === 'P') {
                    const lastResult = result[result.length - 1];
                    if (result.length > 0 && lastResult && lastResult.text !== undefined && !lastResult.text.endsWith('\n')) {
                        result.push({ text: '\n' });
                    }
                    result = result.concat(this.parseNodes(element));
                }
                else {
                    result = result.concat(this.parseNodes(element));
                }
            }
        }
        // 合并连续的文本节点
        return result.reduce((acc, curr) => {
            const last = acc[acc.length - 1];
            if (last && last.text !== undefined && curr.text !== undefined) {
                last.text += curr.text;
            }
            else {
                acc.push(curr);
            }
            return acc;
        }, []);
    }
    updatePreview(rawtext) {
        this.preview.innerHTML = '';
        if (!rawtext)
            return;
        rawtext.forEach(item => {
            const span = document.createElement('span');
            if (item.text) {
                span.textContent = item.text;
            }
            else if (item.score) {
                span.textContent = `[${item.score.name}:${item.score.objective}]`;
                span.className = 'text-red-400';
            }
            else if (item.selector) {
                span.textContent = `[${item.selector}]`;
                span.className = 'text-green-400';
            }
            else if (item.translate === "%%2" && Array.isArray(item.with) && item.with.length === 2) {
                span.textContent = `[IF...THEN...]`;
                span.className = 'text-purple-400';
            }
            else if (item.translate) {
                span.textContent = `[t:${item.translate}]`;
                span.className = 'text-yellow-400';
            }
            this.preview.appendChild(span);
        });
    }
    decodeJson(jsonInput, editor, updateTagContent, editFeature, hideModal) {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.rawtext || !Array.isArray(parsed.rawtext)) {
                throw new Error("无效的 RawJSON 格式");
            }
            editor.innerHTML = '';
            parsed.rawtext.forEach((item) => {
                if (item.text) {
                    editor.appendChild(document.createTextNode(item.text));
                }
                else if (item.translate === "%%2" && Array.isArray(item.with) && item.with.length === 2 && item.with[1].rawtext) {
                    const type = 'conditional';
                    const tag = document.createElement('span');
                    tag.className = 'function-tag';
                    tag.contentEditable = 'false';
                    tag.dataset.type = type;
                    tag.dataset.condition = JSON.stringify(item.with[0] || {});
                    tag.dataset.then = JSON.stringify(item.with[1].rawtext || []);
                    updateTagContent(tag);
                    tag.addEventListener('click', () => editFeature(tag));
                    editor.appendChild(tag);
                }
                else if (item.score || item.selector || item.translate) {
                    const type = Object.keys(item)[0];
                    const tag = document.createElement('span');
                    tag.className = 'function-tag';
                    tag.contentEditable = 'false';
                    tag.dataset.type = type;
                    if (type === 'score' && item.score) {
                        tag.dataset.name = item.score.name;
                        tag.dataset.objective = item.score.objective;
                    }
                    else if (type === 'selector' && item.selector) {
                        tag.dataset.selector = item.selector;
                    }
                    else if (type === 'translate' && item.translate) {
                        tag.dataset.translate = item.translate;
                        tag.dataset.with = JSON.stringify(item.with || []);
                    }
                    updateTagContent(tag);
                    tag.addEventListener('click', () => editFeature(tag));
                    editor.appendChild(tag);
                }
            });
            this.generateJson();
            hideModal();
        }
        catch (e) {
            alert("JSON 解析失败: " + e.message);
        }
    }
}
