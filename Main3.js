function generateJson() {
    try {
        const editor = document.getElementById("richTextEditor");
        let rawText = [];
        let currentText = "";
        let currentFormat = {};
        
        function processTextContent(text) {
            if (!text) return;
            
            // 确保处理所有类型的换行符
            const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            const segments = normalizedText.split(/(\n)/g);
            
            segments.forEach(segment => {
                if (segment === '\n') {
                    if (currentText) {
                        rawText.push({ "text": currentText, ...currentFormat });
                        currentText = "";
                    }
                    rawText.push({ "text": "\n" });
                } else if (segment) {
                    currentText += segment;
                }
            });
        }

        function processNodes(node) {
            if (!node) return;

            if (node.nodeType === Node.TEXT_NODE) {
                processTextContent(node.textContent);
            } else if (node.classList && node.classList.contains('function-tag')) {
                // 处理功能标签前的累积文本
                if (currentText) {
                    rawText.push({ "text": currentText, ...currentFormat });
                    currentText = "";
                }
                
                const type = node.getAttribute('data-type');
                switch(type) {
                    case 'score':
                        const scoreObj = {
                            score: {
                                name: node.getAttribute('data-name') || '@p',
                                objective: node.getAttribute('data-objective') || 'score'
                            }
                        };
                        const value = node.getAttribute('data-value');
                        if (value && !isNaN(value)) {
                            scoreObj.score.value = parseInt(value);
                        }
                        rawText.push(scoreObj);
                        break;
                    case 'selector':
                        rawText.push({
                            selector: node.getAttribute('data-selector') || '@p'
                        });
                        break;
                    case 'translate':
                        const translateObj = {
                            translate: node.getAttribute('data-translate') || ''
                        };
                        const mode = node.getAttribute('data-translate-mode') || 'simple';
                        const withValue = node.getAttribute('data-with');
                        
                        if (withValue) {
                            if (mode === 'simple') {
                                translateObj.with = withValue.split(',')
                                    .map(p => p.trim())
                                    .filter(p => p.length > 0);
                            } else {
                                try {
                                    translateObj.with = JSON.parse(withValue);
                                } catch (e) {
                                    console.warn('Invalid rawtext JSON:', withValue);
                                }
                            }
                        }
                        rawText.push(translateObj);
                        break;
                }
            } else if (node.childNodes) {
                Array.from(node.childNodes).forEach(processNodes);
            }
        }

        // 处理编辑器内容
        processNodes(editor);
        
        // 处理最后的文本
        if (currentText) {
            rawText.push({ "text": currentText, ...currentFormat });
        }

        // 移除最后的多余换行符
        if (rawText.length > 0 && rawText[rawText.length - 1].text === "\n") {
            rawText.pop();
        }

        // 确保有东西
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

        // 展开json输出区域
        outputElement.classList.add('expanded');

        // 更新预览
        updatePreview(rawText);
        
        // Re绑定插入按钮的点击事件
        bindInsertButtons();
        
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
    const plainText = JSON.stringify(JSON.parse(jsonText), null, 2);
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