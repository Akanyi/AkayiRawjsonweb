function applyFunction() {
    if (!currentEditingTag) return;
    
    const type = currentEditingTag.getAttribute('data-type');
    
    try {
        switch(type) {
            case 'score':
                currentEditingTag.setAttribute('data-name', document.getElementById('modal_name').value || '@p');
                currentEditingTag.setAttribute('data-objective', document.getElementById('modal_objective').value || 'score');
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

