function generateJson() {
    try {
        const editor = document.getElementById("richTextEditor");
        let rawText = [];
        let currentText = "";

        function processTextContent(text) {
            if (!text) return;
            
            // 分割换行符
            const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
            
            // 处理每一行
            lines.forEach((line, index) => {
                // 添加当前行
                if (line.length > 0) {
                    rawText.push({ "text": line });
                }
                // 添加换行
                rawText.push({ "text": "\n" });
            });

            // 如果原文本不以换行符结尾，移除最后添加的换行
            if (!text.endsWith('\n')) {
                rawText.pop();
            }
        }

        function processNodes(node) {
            if (!node) return;

            if (node.nodeType === Node.TEXT_NODE) {
                processTextContent(node.textContent);
            } else if (node.classList && node.classList.contains('function-tag')) {
                // 处理功能标签
                const type = node.getAttribute('data-type');
                switch(type) {
                    case 'score':
                        rawText.push({
                            score: {
                                name: node.getAttribute('data-name') || '@p',
                                objective: node.getAttribute('data-objective') || 'score'
                            }
                        });
                        break;
                    case 'selector':
                        rawText.push({
                            selector: node.getAttribute('data-selector') || '@p'
                        });
                        break;
                    case 'translate':
                        try {
                            const translateData = {
                                translate: node.getAttribute('data-translate') || '',
                                mode: node.getAttribute('data-translate-mode') || 'simple',
                                rawtextMode: node.getAttribute('data-rawtext-mode') || 'advanced',
                                withValue: node.getAttribute('data-with')
                            };
                            // 使用全局对象
                            rawText.push(TranslateUtils.processTranslateData(translateData));
                        } catch (e) {
                            console.error('处理翻译数据失败:', e);
                            rawText.push({ text: '[翻译处理错误]' });
                        }
                        break;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
                rawText.push({ "text": "\n" });
            } else if (node.childNodes) {
                Array.from(node.childNodes).forEach(processNodes);
            }
        }

        // 处理编辑器内容
        processNodes(editor);

        // 移除末尾的空换行
        while (rawText.length > 0 && 
               rawText[rawText.length - 1].text === "\n" && 
               rawText[rawText.length - 2]?.text === "\n") {
            rawText.pop();
        }

        // 处理最后的文本
        if (currentText) {
            rawText.push({ "text": currentText });
        }

        // 确保内容不为空
        if (rawText.length === 0) {
            throw new Error('没有可用的文本内容');
        }

        const jsonOutput = { "rawtext": rawText };
        const outputElement = document.getElementById("jsonOutput");
        outputElement.innerHTML = `
            <div class="copy-buttons">
                <button class="copy-button" onclick="copyJson()">复制</button>
                <button class="copy-plain-button" onclick="copyPlainJson()">复制纯文本</button>
            </div>
            <pre>${JSON.stringify(jsonOutput, null, 2)}</pre>
        `;

        outputElement.classList.add('expanded');
        updatePreview(rawText);
        
    } catch (error) {
        console.error('JSON生成错误:', error);
        document.getElementById("jsonOutput").innerHTML = `
            <div class="error">错误：${error.message}</div>
        `;
    }
}

// 复制JSON
function copyJson() {
    const jsonText = document.querySelector('#jsonOutput pre').textContent;
    navigator.clipboard.writeText(jsonText).then(() => {
        const copyBtn = document.querySelector('.copy-button');
        copyBtn.textContent = '已复制！';
        setTimeout(() => copyBtn.textContent = '复制', 2000);
    });
}

// 纯文本JSON
function copyPlainJson() {
    const jsonText = document.querySelector('#jsonOutput pre').textContent;
    const plainText = JSON.stringify(JSON.parse(jsonText));
    navigator.clipboard.writeText(plainText).then(() => {
        const copyBtn = document.querySelector('.copy-plain-button');
        copyBtn.textContent = '已复制！';
        setTimeout(() => copyBtn.textContent = '复制纯文本', 2000);
    });
}

// 使用事件监听器绑定生成按钮
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('generateJsonBtn').addEventListener('click', generateJson);
    bindInsertButtons();
});

// 绑定插入按钮的点击事件
function bindInsertButtons() {
    const buttons = document.querySelectorAll('#colorButtons button, .feature-buttons button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const code = this.getAttribute('onclick').match(/insertCode\('(.+?)'\)/);
            if (code) {
                insertCode(code[1]);
            } else {
                const feature = this.getAttribute('onclick').match(/insertFeature\('(.+?)'\)/);
                if (feature) {
                    insertFeature(feature[1]);
                }
            }
        });
    });
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updatePreview(rawText) {
    const preview = document.getElementById('preview');
    const previewContent = document.getElementById('previewContent');
    
    if (!rawText || rawText.length === 0) {
        preview.style.display = 'none';
        return;
    }

    preview.style.display = 'block';
    let previewText = rawText.map((item, index, array) => {
        if (item.text === '\n') {
            // 检查是否是连续的换行
            const isConsecutiveNewline = index > 0 && array[index - 1].text === '\n';
            // 如果是连续换行，添加一个空行的高度
            return `<span class="line-break" ${isConsecutiveNewline ? 'style="margin-top: 1.6em;"' : ''}></span>`;
        }
        if (item.text) {
            // 修改换行符的处理逻辑但保留颜色代码
            if (item.text.includes('\n')) {
                return item.text.split('\n').map((text, index, array) => {
                    let formattedText = escapeHtml(text);
                    // 添加颜色类
                    if (item.color) {
                        formattedText = `<span class="color-${item.color}">${formattedText}</span>`;
                    }
                    // 添加修饰效果
                    if (item.bold) formattedText = `<span style="font-weight:bold">${formattedText}</span>`;
                    if (item.italic) formattedText = `<span style="font-style:italic">${formattedText}</span>`;
                    if (item.underline) formattedText = `<span style="text-decoration:underline">${formattedText}</span>`;
                    if (item.strikethrough) formattedText = `<span style="text-decoration:line-through">${formattedText}</span>`;
                    if (item.obfuscated) formattedText = `<span class="obfuscated">${formattedText}</span>`;
                    
                    if (index === array.length - 1) {
                        return `<span>${formattedText}</span>`;
                    }
                    return `<span>${formattedText}</span><span class="line-break"></span>`;
                }).join('');
            }
            // 普通文本处理
            let formattedText = escapeHtml(item.text);
            // 添加颜色和格式
            if (item.color) {
                formattedText = `<span class="color-${item.color}">${formattedText}</span>`;
            }
            if (item.bold) formattedText = `<span style="font-weight:bold">${formattedText}</span>`;
            if (item.italic) formattedText = `<span style="font-style:italic">${formattedText}</span>`;
            if (item.underline) formattedText = `<span style="text-decoration:underline">${formattedText}</span>`;
            if (item.strikethrough) formattedText = `<span style="text-decoration:line-through">${formattedText}</span>`;
            if (item.obfuscated) formattedText = `<span class="obfuscated">${formattedText}</span>`;
            
            return `<span>${formattedText}</span>`;
        }

        // 保持其他类型的处理不变
        if (item.selector) {
            return `<span class="preview-selector">[${escapeHtml(item.selector)}]</span>`;
        }
        if (item.translate) {
            let translatedText = escapeHtml(item.translate);
            if (item.with) {
                // 支持数组和对象两种格式
                const params = Array.isArray(item.with) ? item.with : 
                             (item.with.parameters || []);
                
                if (Array.isArray(params)) {
                    // 顺序替换所有占位符
                    let paramIndex = 0;
                    translatedText = translatedText.replace(/%%[sdf\d]/g, () => {
                        if (paramIndex >= params.length) return '??';
                        const param = params[paramIndex++];
                        // 处理不同类型的参数
                        if (typeof param === 'string') return escapeHtml(param);
                        if (param.text) return escapeHtml(param.text);
                        if (param.score) return `[${escapeHtml(param.score.name)}的${escapeHtml(param.score.objective)}]`;
                        if (param.selector) return `[${escapeHtml(param.selector)}]`;
                        return '??';
                    });
                }
            }
            return `<span class="preview-translate">${translatedText}</span>`;
        }
        if (item.score) {
            return `<span class="preview-score">[${escapeHtml(item.score.name)}的${escapeHtml(item.score.objective)}]</span>`;
        }
        return '';
    }).join('');
    
    previewContent.innerHTML = `
        <span style="color:#f1c40f">参考预览</span><br>
        <div class="preview-content">${previewText || '空内容'}</div>
    `;
}