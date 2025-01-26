const JsonBuilder = {
    // 主要生成函数
    build(editor) {
        if (!editor) return null;

        try {
            const rawtext = this.processContent(editor);
            if (!rawtext.length) {
                throw new Error('没有可用的文本内容');
            }

            return {
                rawtext: this.cleanupRawtext(rawtext)
            };
        } catch (error) {
            console.error('构建JSON失败:', error);
            throw error;
        }
    },

    // 处理内容
    processContent(node) {
        const rawtext = [];
        
        if (!node) return rawtext;

        if (node.nodeType === Node.TEXT_NODE) {
            this.processTextContent(node.textContent, rawtext);
        } else if (node.classList?.contains('function-tag')) {
            this.processTag(node, rawtext);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
            rawtext.push({ text: "\n" });
        } else if (node.childNodes) {
            Array.from(node.childNodes).forEach(child => {
                rawtext.push(...this.processContent(child));
            });
        }

        return rawtext;
    },

    // 处理文本内容
    processTextContent(text, rawtext) {
        if (!text) return;
        
        const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        lines.forEach((line, index) => {
            if (line.length > 0) {
                rawtext.push({ text: line });
            }
            rawtext.push({ text: "\n" });
        });

        if (!text.endsWith('\n')) {
            rawtext.pop();
        }
    },

    // 处理功能标签
    processTag(tag, rawtext) {
        const type = tag.getAttribute('data-type');
        
        try {
            switch(type) {
                case 'score':
                    rawtext.push({
                        score: {
                            name: tag.getAttribute('data-name') || '@p',
                            objective: tag.getAttribute('data-objective') || 'score'
                        }
                    });
                    break;

                case 'selector':
                    rawtext.push({
                        selector: tag.getAttribute('data-selector') || '@p'
                    });
                    break;

                case 'translate':
                    const translateData = this.processTranslateTag(tag);
                    if (translateData) {
                        rawtext.push(translateData);
                    }
                    break;

                default:
                    console.warn('未知的标签类型:', type);
                    rawtext.push({ text: `[未知标签:${type}]` });
            }
        } catch (error) {
            console.error(`处理${type}标签时出错:`, error);
            rawtext.push({ text: `[${type}处理错误]` });
        }
    },

    // 处理翻译标签
    processTranslateTag(tag) {
        try {
            const translateKey = tag.getAttribute('data-translate');
            const mode = tag.getAttribute('data-translate-mode') || 'simple';
            const rawtextMode = tag.getAttribute('data-rawtext-mode') || 'simple';
            const withValue = tag.getAttribute('data-with') || '';

            // 构建翻译数据对象
            return {
                translate: translateKey,
                with: mode === 'rawtext' && rawtextMode === 'visual' ? 
                    // 可视化模式：直接使用simple格式处理
                    TranslateMode.visual._processVisualParams(translateKey, withValue).with :
                    // 其他模式：使用TranslateUtils处理
                    TranslateMode[mode === 'simple' ? 'simple' : 'rawtext']
                        .process(translateKey, withValue).with
            };
        } catch (error) {
            console.error('处理翻译标签失败:', error);
            throw new Error('翻译处理错误: ' + error.message);
        }
    },

    // 清理并优化rawtext数组
    cleanupRawtext(rawtext) {
        // 移除末尾的空换行
        while (rawtext.length > 1 && 
               rawtext[rawtext.length - 1].text === "\n" && 
               rawtext[rawtext.length - 2]?.text === "\n") {
            rawtext.pop();
        }

        // 合并相邻的纯文本节点
        return rawtext.reduce((acc, curr, i, arr) => {
            if (i > 0 && 
                curr.text !== undefined && 
                arr[i-1].text !== undefined && 
                curr.text !== "\n" && 
                arr[i-1].text !== "\n") {
                acc[acc.length - 1].text += curr.text;
            } else {
                acc.push(curr);
            }
            return acc;
        }, []);
    }
};

window.JsonBuilder = JsonBuilder;
