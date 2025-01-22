function applyFunction() {
    if (!currentEditingTag) return;
    
    const type = currentEditingTag.getAttribute('data-type');
    
    try {
        switch(type) {
            case 'score':
                currentEditingTag.setAttribute('data-name', document.getElementById('modal_name').value || '@p');
                currentEditingTag.setAttribute('data-objective', document.getElementById('modal_objective').value || 'score');
                currentEditingTag.setAttribute('data-value', document.getElementById('modal_value').value || '');
                break;
            case 'selector':
                currentEditingTag.setAttribute('data-selector', document.getElementById('modal_selector').value || '@p');
                break;
            case 'translate':
                const mode = document.getElementById('translate_mode').value;
                const translateValue = document.getElementById('modal_translate').value;
                
                if (!translateValue) {
                    throw new Error('翻译键不能为空');
                }
                
                currentEditingTag.setAttribute('data-translate', translateValue);
                currentEditingTag.setAttribute('data-translate-mode', mode);
                
                if (mode === 'simple') {
                    const simpleValue = document.getElementById('modal_with_simple').value || '';
                    currentEditingTag.setAttribute('data-with', simpleValue);
                } else {
                    const rawtextValue = document.getElementById('modal_with_rawtext').value || '';
                    try {
                        // 验证JSON格式
                        JSON.parse(rawtextValue);
                        currentEditingTag.setAttribute('data-with', rawtextValue);
                    } catch (e) {
                        throw new Error('Rawtext JSON 格式无效');
                    }
                }
                break;
        }
        
        updateTagPreview(currentEditingTag);
        closeModal();
        
    } catch (error) {
        console.error('应用更改时出错:', error);
        alert(error.message);
    }
}

function closeModal() {
    document.getElementById('functionModal').style.display = 'none';
    currentEditingTag = null;
}

// 添加光标处理函数
function isCaretInEditor() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    const range = selection.getRangeAt(0);
    const editor = document.getElementById("richTextEditor");
    return editor.contains(range.commonAncestorContainer);
}

function focusEditor() {
    const editor = document.getElementById("richTextEditor");
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// 文本处理函数v2，修复bug与速度
function processTextContent(text) {
    if (!text) return;
    
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const segments = normalizedText.split(/(\n|§[0-9a-fk-or])/g);
    
    segments.forEach(segment => {
        if (segment === '\n') {
            if (currentText) {
                rawText.push({ "text": currentText, ...currentFormat });
                currentText = "";
            }
            if (!node) return;

            if (node.nodeType === Node.TEXT_NODE) {
                rawText.push({ "text": currentText });
                currentText = "";
            }
            const code = segment[1];
            switch(code) {
                //删除后有bug
                case 'k': currentFormat.obfuscated = true; break;
                case 'l': currentFormat.bold = true; break;
                case 'm': currentFormat.strikethrough = true; break;
                case 'n': currentFormat.underline = true; break;
                case 'o': currentFormat.italic = true; break;
                case 'r': currentFormat = {}; break;
                default:
                    if ('0123456789abcdef'.includes(code)) {
                        currentFormat.color = code;
                    }
            }
        } else if (segment) {
            currentText += segment;
        }
    });
}

function updatePreview(rawText) {
    const preview = document.getElementById('preview');
    const previewContent = document.getElementById('previewContent');
    
    if (!rawText || rawText.length === 0) {
        preview.style.display = 'none';
        return;
    }

    preview.style.display = 'block';
    let previewText = rawText.map(item => {
        if (item.text === '\n') return '<br>';
        if (item.text) {
            // §修饰符相关处理，贴合游戏本身
            const cleanedText = item.text.replace(/§./g, '');
            return `<span>${escapeHtml(cleanedText)}</span>`;
        }
        if (item.selector) return `<span class="preview-selector">[${escapeHtml(item.selector)}]</span>`;
        if (item.translate) {
            let translatedText = escapeHtml(item.translate);
            if (item.with) {
                if (Array.isArray(item.with)) {
                    item.with.forEach((param, index) => {
                        //多情况支持，wiki说可以这么干
                        const placeholder = new RegExp(`%%[sdf]`, 'g');
                        translatedText = translatedText.replace(placeholder, escapeHtml(param));
                    });
                } else {
                    translatedText = JSON.stringify(item.with, null, 2);
                }
            }
            return `<span class="preview-translate">${translatedText}</span>`;
        }
        if (item.score) {
            const value = item.score.value ? `: ${item.score.value}` : '';
            return `<span class="preview-score">[${escapeHtml(item.score.name)}的${escapeHtml(item.score.objective)}${value}]</span>`;
        }
        return '';
    }).join('');
    
    previewContent.innerHTML = `
        <span style="color:#f1c40f">参考预览</span><br>
        <div class="preview-content">${previewText || '空内容'}</div>
    `;
}

