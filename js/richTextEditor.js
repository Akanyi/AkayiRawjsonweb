window.RichTextEditor = (() => {
    let currentText = "";
    let rawText = [];
    
    function getEditor() {
        return document.getElementById("richTextEditor");
    }
    editor = getEditor();
    // 修改事件处理逻辑
    document.addEventListener('DOMContentLoaded', function() {
        const editor = getEditor();
        if (!editor) return;
        
        bindEditorEvents(editor);
    });

    // 移除独立的事件监听器
    // 删除这段代码:
    // editor.addEventListener('input', function(e) {...});

    // 修改成在bindEditorEvents中统一处理所有事件
    function bindEditorEvents(editor) {
        if (!editor) return;

        // 基础事件
        editor.addEventListener('input', handleInput);
        editor.addEventListener('blur', handleBlur);
        editor.addEventListener('keydown', handleKeyDown);
        editor.addEventListener('paste', handlePaste);
        editor.addEventListener('drop', handleDrop);
        editor.addEventListener('beforeinput', handleBeforeInput);

        // 添加额外的输入处理事件
        editor.addEventListener('input', function(e) {
            // 首先检查编辑器是否为空
            if (editor.innerHTML.trim() === '') {
                editor.innerHTML = '';
                editor.removeAttribute('style');
                return;
            }

            // 延迟执行以确保内容已更新
            requestAnimationFrame(() => {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                
                const range = selection.getRangeAt(0);
                const node = range.startContainer;

                // 如果是文本节点且不在功能标签内
                if (node.nodeType === Node.TEXT_NODE && 
                    !node.parentElement.classList.contains('function-tag')) {
                    
                    // 获取当前节点的父元素
                    let parent = node.parentElement;
                    
                    // 如果父元素不是编辑器本身，说明文本可能带有样式
                    if (parent && parent !== editor) {
                        // 保存当前光标位置
                        const offset = range.startOffset;
                        
                        // 创建新的文本节点，保持原始内容
                        const newText = document.createTextNode(node.textContent);
                        
                        // 替换带样式的节点
                        parent.parentNode.replaceChild(newText, parent);
                        
                        // 恢复光标位置
                        const newRange = document.createRange();
                        newRange.setStart(newText, offset);
                        newRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                    }
                }

                // 清理空节点和多余属性
                cleanupEditor(editor);
            });
        });
    }

    function handleInput(e) {
        const editor = getEditor();
        if (editor.innerHTML.trim() === '') {
            resetEditor();
        } else {
            cleanupContent();
        }
    }

    function handleBlur(e) {
        const editor = getEditor();
        if (editor.innerHTML.trim() === '') {
            editor.innerHTML = '';
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            handleDelete(e);
        }
    }

    function handlePaste(e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    }

    function handleDrop(e) {
        e.preventDefault();
    }

    function handleBeforeInput(e) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        if (isWithinFunctionTag(range)) {
            handleFunctionTagInput(e, range);
        }
    }

    function resetEditor() {
        const editor = getEditor();
        editor.innerHTML = '';
        editor.removeAttribute('style');
    }

    function cleanupContent() {
        requestAnimationFrame(() => {
            removeInheritedStyles();
            cleanupEditor(getEditor());
        });
    }

    function isWithinFunctionTag(range) {
        const container = document.createElement('div');
        container.appendChild(range.cloneContents());
        return container.querySelector('.function-tag') !== null;
    }

    function handleFunctionTagInput(e, range) {
        e.preventDefault();
        const text = e.data || '';
        if (text) {
            insertPlainText(text, range);
        }
    }

    function insertPlainText(text, range) {
        const textNode = document.createTextNode(text);
        range.deleteContents();
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        range.collapse(false);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

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
            const type = node.getAttribute('data-type');
            try {
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
                        const translateData = {
                            translate: node.getAttribute('data-translate') || '',
                            mode: node.getAttribute('data-translate-mode') || 'simple',
                            rawtextMode: node.getAttribute('data-rawtext-mode') || 'simple',
                            withValue: node.getAttribute('data-with') || ''
                        };

                        // 根据模式直接处理参数
                        if (translateData.mode === 'rawtext' && translateData.rawtextMode === 'visual') {
                            // 直接处理可视化模式的参数，不需要JSON解析
                            const withParams = translateData.withValue.split(',')
                                .filter(Boolean)
                                .map(param => {
                                    param = param.trim();
                                    if (param.startsWith('计分板:')) {
                                        const [name, objective] = param.substring(4).split('|');
                                        return {
                                            score: {
                                                name: name.trim() || '@p',
                                                objective: objective.trim() || 'score'
                                            }
                                        };
                                    } else if (param.startsWith('选择器:')) {
                                        return { selector: param.substring(4).trim() || '@p' };
                                    } else if (param.startsWith('文本:')) {
                                        return { text: param.substring(3).trim() };
                                    }
                                    return { text: param };
                                });

                            rawText.push({
                                translate: translateData.translate,
                                with: withParams
                            });
                        } else {
                            // 使用现有的处理函数处理其他模式
                            const translatedData = TranslateUtils.processTranslateData({
                                ...translateData,
                                withValue: translateData.withValue || '[]'
                            });
                            rawText.push(translatedData);
                        }
                        break;
                }
            } catch (error) {
                console.error(`处理${type}标签时出错:`, error);
                rawText.push({ text: `[${type}处理错误]` });
            }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
            rawText.push({ "text": "\n" });
        } else if (node.childNodes) {
            Array.from(node.childNodes).forEach(processNodes);
        }
    }

    function generateJson() {
        try {
            const editor = getEditor();
            if (!editor) throw new Error('找不到编辑器元素');

            // 使用JsonBuilder构建JSON
            const jsonData = JsonBuilder.build(editor);
            
            // 更新输出
            const outputElement = document.getElementById("jsonOutput");
            outputElement.innerHTML = `
                <div class="copy-buttons">
                    <button class="copy-button" onclick="copyJson()">复制</button>
                    <button class="copy-plain-button" onclick="copyPlainJson()">复制纯文本</button>
                </div>
                <pre>${JSON.stringify(jsonData, null, 2)}</pre>
            `;

            outputElement.classList.add('expanded');
            
            // 更新预览
            updatePreview(jsonData.rawtext);
            
        } catch (error) {
            console.error('生成JSON失败:', error);
            document.getElementById("jsonOutput").innerHTML = `
                <div class="error">错误：${error.message}</div>
            `;
        }
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
                        // 改进占位符处理逻辑
                        translatedText = translatedText.replace(/%%([0-9sdf])/g, (match, p1) => {
                            let index;
                            if (p1 === 's' || p1 === 'd' || p1 === 'f') {
                                index = 0; // %%s, %%d, %%f 使用第一个参数
                            } else {
                                index = parseInt(p1) - 1; // %%1, %%2 等使用对应索引
                            }
                            
                            if (index < 0 || index >= params.length) {
                                return match; // 如果索引无效，保持原样
                            }
                            
                            const param = params[index];
                            // 处理不同类型的参数
                            if (typeof param === 'string') return escapeHtml(param);
                            if (param.text) return escapeHtml(param.text);
                            if (param.score) return `[${escapeHtml(param.score.name)}的${escapeHtml(param.score.objective)}]`;
                            if (param.selector) return `[${escapeHtml(param.selector)}]`;
                            return match; // 如果无法处理则保持原样
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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function insertFeature(type) {
        const editor = getEditor();
        if (!editor) {
            console.error('找不到编辑器元素');
            return;
        }
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // 创建新的功能标签容器
        const container = document.createElement('span');
        container.className = 'function-tag';
        container.setAttribute('contenteditable', 'false');
        container.setAttribute('data-type', type);
        
        // 创建内部预览容器
        const preview = document.createElement('span');
        preview.className = 'tag-preview';
        container.appendChild(preview);

        // 根据类型设置属性
        switch(type) {
            case 'score':
                container.setAttribute('data-name', '@p');
                container.setAttribute('data-objective', 'score');
                preview.textContent = '[计分板]';
                break;
            case 'selector':
                container.setAttribute('data-selector', '@p');
                preview.textContent = '[选择器]';
                break;
            case 'translate':
                container.setAttribute('data-translate', '');
                container.setAttribute('data-translate-mode', 'simple');
                preview.textContent = '[翻译]';
                break;
        }
        
        // 创建编辑图标
        const editIcon = document.createElement('span');
        editIcon.className = 'tag-edit-icon';
        editIcon.textContent = '✎';
        container.appendChild(editIcon);

        // 插入到编辑器中
        range.deleteContents();
        range.insertNode(container);
        
        // 确保标签周围有空格
        container.before('\u200B');
        container.after('\u200B');
        
        // 将光标移到标签后面
        range.setStartAfter(container);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // 添加点击事件
        container.addEventListener('click', () => editFunction(container));
        
        // 更新预览
        updateTagPreview(container);
    }

    function updateTagPreview(element) {
        const preview = element.querySelector('.tag-preview');
        if (!preview) return;

        const type = element.getAttribute('data-type');
        let previewText = '';
        
        switch(type) {
            case 'score':
                const name = element.getAttribute('data-name') || '@p';
                const objective = element.getAttribute('data-objective') || 'score';
                previewText = `[${name}的${objective}]`;
                break;
            case 'selector':
                previewText = `[${element.getAttribute('data-selector') || '@p'}]`;
                break;
            case 'translate':
                const translate = element.getAttribute('data-translate') || '';
                const withValue = element.getAttribute('data-with') || '';
                const mode = element.getAttribute('data-translate-mode') || 'simple';
                
                previewText = translate;
                
                if (withValue && translate) {
                    try {
                        if (mode === 'simple') {
                            // 简单模式处理
                            const params = withValue.split(',').map(p => p.trim());
                            previewText = translate.replace(/%%([0-9sdf])/g, (match, p1) => {
                                let index;
                                if (p1 === 's' || p1 === 'd' || p1 === 'f') {
                                    index = 0; // %%s, %%d, %%f 使用第一个参数
                                } else {
                                    index = parseInt(p1) - 1; // %%1, %%2 等使用对应索引
                                }
                                
                                if (index < 0 || index >= params.length) {
                                    return '?';
                                }
                                
                                const param = params[index];
                                if (param.startsWith('计分板:')) {
                                    const [name, obj] = param.substring(4).split('|');
                                    return `[${name.trim()}的${obj.trim()}]`;
                                }
                                if (param.startsWith('选择器:')) {
                                    return `[${param.substring(4).trim()}]`;
                                }
                                if (param.startsWith('文本:')) {
                                    return param.substring(3).trim();
                                }
                                return param;
                            });
                        } else {
                            // rawtext模式处理
                            const data = JSON.parse(withValue);
                            if (data && data.rawtext) {
                                previewText = data.rawtext.map(item => {
                                    if (item.text) return item.text;
                                    if (item.score) return `[${item.score.name}的${item.score.objective}]`;
                                    if (item.selector) return `[${item.selector}]`;
                                    return '';
                                }).join('');
                            }
                        }
                    } catch (e) {
                        console.error('翻译预览处理错误:', e);
                        previewText = '[预览错误]';
                    }
                }
                
                if (!previewText) {
                    previewText = '[空翻译]';
                }
                break;
        }
        
        preview.textContent = previewText;
    }

    // 添加新的恢复选择方法
    function restoreSelection(range) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    // 添加新的标签清理方法
    function cleanupTags() {
        const editor = getEditor();
        const tags = editor.getElementsByClassName('function-tag');
        
        // 转换为数组以避免实时集合的问题
        Array.from(tags).forEach(tag => {
            // 检查标签前后是否有零宽空格
            const prev = tag.previousSibling;
            const next = tag.nextSibling;
            
            if (!prev || prev.nodeType !== Node.TEXT_NODE || !prev.nodeValue.endsWith('\u200B')) {
                tag.before('\u200B');
            }
            if (!next || next.nodeType !== Node.TEXT_NODE || !next.nodeValue.startsWith('\u200B')) {
                tag.after('\u200B');
            }
        });
    }

    // 修改编辑器的input事件处理
    document.addEventListener('DOMContentLoaded', function() {
        const editor = getEditor();
        
        // 修改input事件监听
        editor.addEventListener('input', function(e) {
            // 检查编辑器是否为空
            if (editor.innerHTML.trim() === '') {
                // 重置编辑器内容
                editor.innerHTML = '';
                // 移除所有样式和状态
                editor.removeAttribute('style');
                Array.from(editor.classList).forEach(cls => {
                    if (cls !== 'richTextEditor') {
                        editor.classList.remove(cls);
                    }
                });
            } else {
                // 正常的清理操作
                setTimeout(cleanupTags, 0);
            }
        });

        // 添加监听以防止空编辑器失去占位符
        editor.addEventListener('blur', function() {
            if (editor.innerHTML.trim() === '') {
                editor.innerHTML = '';
            }
        });

        // 更新删除事件处理
        editor.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                
                // 处理选中范围内的所有标签
                const range = selection.getRangeAt(0);
                const container = document.createElement('div');
                container.appendChild(range.cloneContents());
                
                // 查找选中范围内的所有功能标签
                const tags = container.getElementsByClassName('function-tag');
                const hasTags = tags.length > 0;
                
                if (hasTags) {
                    e.preventDefault();
                    
                    // 保存选区的开始和结束位置
                    const startContainer = range.startContainer;
                    const startOffset = range.startOffset;
                    const endContainer = range.endContainer;
                    const endOffset = range.endOffset;
                    
                    // 删除选中内容
                    range.deleteContents();
                    
                    // 插入光标占位符
                    const cursorNode = document.createTextNode('');
                    range.insertNode(cursorNode);
                    
                    // 设置新的光标位置
                    range.setStart(cursorNode, 0);
                    range.setEnd(cursorNode, 0);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // 清理和规范化编辑器内容
                    setTimeout(() => {
                        editor.normalize();
                        // 移除所有可能的空文本节点
                        const walker = document.createTreeWalker(
                            editor,
                            NodeFilter.SHOW_TEXT,
                            null,
                            false
                        );
                        const emptyNodes = [];
                        let node;
                        while (node = walker.nextNode()) {
                            if (!node.textContent.trim()) {
                                emptyNodes.push(node);
                            }
                        }
                        emptyNodes.forEach(node => node.remove());
                        
                        // 重置编辑器内容以清除任何残留样式
                        const content = editor.innerHTML;
                        editor.innerHTML = content;
                        
                        // 恢复光标位置
                        const newRange = document.createRange();
                        newRange.setStart(cursorNode, 0);
                        newRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                    }, 0);
                }
            }
        });

        // 处理删除事件
        editor.addEventListener('keydown', function(e) {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            const parentNode = node.parentNode;

            // 处理退格键和删除键
            if (e.key === 'Backspace' || e.key === 'Delete') {
                // 查找最近的功能标签
                const tag = parentNode.closest('.function-tag') || 
                            (parentNode.previousElementSibling && parentNode.previousElementSibling.classList.contains('function-tag') ? 
                            parentNode.previousElementSibling : null);

                if (tag) {
                    e.preventDefault();
                    
                    // 创建新的光标位置
                    const newNode = document.createTextNode('\u200B');
                    tag.parentNode.insertBefore(newNode, tag);
                    tag.remove();

                    // 设置光标位置
                    const newRange = document.createRange();
                    newRange.setStart(newNode, 1);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            }
        });

        // 修改删除事件处理
        editor.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                
                const range = selection.getRangeAt(0);
                    const cursor = document.createTextNode('\u200B');
                    
                    // 插入光标占位符并删除标签
                    tag.parentNode.insertBefore(cursor, tag);
                    tag.remove();
                    
                    // 设置新的选区
                    const newRange = document.createRange();
                    newRange.setStart(cursor, 0);
                    newRange.setEnd(cursor, 0);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    
                    // 强制清理编辑器内容
                    requestAnimationFrame(() => {
                        // 清理所有空文本节点和多余的样式
                        cleanupEditor(editor);
                        
                        // 重新规范化文本节点
                        editor.normalize();
                        
                        // 通过临时更改内容来重置样式
                        const content = editor.innerHTML;
                        editor.textContent = '';  // 完全清空内容
                        editor.innerHTML = content;  // 重新插入内容
                        
                        // 恢复光标位置
                        const nodes = editor.childNodes;
                        for (let i = 0; i < nodes.length; i++) {
                            if (nodes[i].nodeType === 3 && nodes[i].nodeValue === '\u200B') {
                                const finalRange = document.createRange();
                                finalRange.setStart(nodes[i], 0);
                                finalRange.collapse(true);
                                selection.removeAllRanges();
                                selection.addRange(finalRange);
                                break;
                            }
                        }
                    });
                }
            }
        );

        // 添加新的编辑器清理函数
        function cleanupEditor(editor) {
            // 移除所有空文本节点
            const walker = document.createTreeWalker(
                editor,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            const emptyNodes = [];
            let node;
            while (node = walker.nextNode()) {
                if (node.nodeValue === '' || (node.nodeValue === '\u200B' && node.nextSibling)) {
                    emptyNodes.push(node);
                }
            }
            emptyNodes.forEach(node => node.remove());

            // 移除所有未使用的样式属性
            const elements = editor.getElementsByTagName('*');
            for (let element of elements) {
                if (!element.classList.contains('function-tag')) {
                    // 保留必要的属性，移除其他所有属性
                    const attrs = element.attributes;
                    const attrsToRemove = [];
                    
                    for (let attr of attrs) {
                        if (!['class', 'id', 'contenteditable', 'data-type'].includes(attr.name)) {
                            attrsToRemove.push(attr.name);
                        }
                    }
                    
                    attrsToRemove.forEach(attr => element.removeAttribute(attr));
                }
            }
        }

        // 修改粘贴事件
        editor.addEventListener('paste', function(e) {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
        editor.addEventListener('drop', function(e) {
            e.preventDefault();
        });

        editor.addEventListener('beforeinput', function(e) {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const container = document.createElement('div');
            container.appendChild(range.cloneContents());
            
            // 检查选区
            const hasFunctionTag = container.querySelector('.function-tag');
            
            if (hasFunctionTag) {
                e.preventDefault();
                
                // 获取输入的文本
                let insertText = '';
                if (e.inputType === 'insertText') {
                    insertText = e.data;
                } else if (e.inputType === 'insertFromPaste') {
                    insertText = e.dataTransfer.getData('text/plain');
                }
                
                if (insertText) {
                    // 创建新的文本节点
                    const textNode = document.createTextNode(insertText);
                    
                    // 删除选中内容并插入新文本
                    range.deleteContents();
                    range.insertNode(textNode);
                    
                    // 移动光标到插入文本的末尾
                    range.setStartAfter(textNode);
                    range.setEndAfter(textNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // 清理和规范化编辑器内容
                    setTimeout(() => {
                        editor.normalize();
                        // 移除所有可能的空文本节点
                        const walker = document.createTreeWalker(
                            editor,
                            NodeFilter.SHOW_TEXT,
                            null,
                            false
                        );
                        const emptyNodes = [];
                        let node;
                        while (node = walker.nextNode()) {
                            if (!node.textContent.trim()) {
                                emptyNodes.push(node);
                            }
                        }
                        emptyNodes.forEach(node => node.remove());
                        
                        // 重置编辑器内容以清除任何残留样式
                        const content = editor.innerHTML;
                        editor.innerHTML = content;
                        
                        // 恢复光标位置到文本末尾
                        const selection = window.getSelection();
                        const range = document.createRange();
                        const lastNode = editor.lastChild;
                        if (lastNode) {
                            range.setStartAfter(lastNode);
                            range.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                    }, 0);
                }
            }
        });
    });


    // 添加输入事件监听器
    editor.addEventListener('input', function(e) {
        // 首先检查编辑器是否为空
        if (editor.innerHTML.trim() === '') {
            editor.innerHTML = '';
            editor.removeAttribute('style');
            return;
        }

        // 延迟执行以确保内容已更新
        requestAnimationFrame(() => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            const node = range.startContainer;

            // 如果是文本节点且不在功能标签内
            if (node.nodeType === Node.TEXT_NODE && 
                !node.parentElement.classList.contains('function-tag')) {
                
                // 获取当前节点的父元素
                let parent = node.parentElement;
                
                // 如果父元素不是编辑器本身，说明文本可能带有样式
                if (parent && parent !== editor) {
                    // 保存当前光标位置
                    const offset = range.startOffset;
                    
                    // 创建新的文本节点，保持原始内容
                    const newText = document.createTextNode(node.textContent);
                    
                    // 替换带样式的节点
                    parent.parentNode.replaceChild(newText, parent);
                    
                    // 恢复光标位置
                    const newRange = document.createRange();
                    newRange.setStart(newText, offset);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            }

            // 清理空节点和多余属性
            cleanupEditor(editor);
        });
    });

    // 优化 cleanupEditor 函数
    function cleanupEditor(editor) {
        // 规范化文本节点
        editor.normalize();

        // 移除所有空文本节点和不必要的 span 标签
        const walker = document.createTreeWalker(
            editor,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const nodesToRemove = [];
        while (walker.nextNode()) {
            const node = walker.currentNode;
            
            // 处理文本节点
            if (node.nodeType === Node.TEXT_NODE) {
                if (!node.textContent.trim() && node.textContent !== '\u200B') {
                    nodesToRemove.push(node);
                }
            }
            // 处理元素节点
            else if (node.nodeType === Node.ELEMENT_NODE) {
                // 如果不是功能标签，移除所有样式相关属性
                if (!node.classList.contains('function-tag')) {
                    // 保留必要的属性，移除其他所有属性
                    const attrs = Array.from(node.attributes);
                    attrs.forEach(attr => {
                        if (!['contenteditable', 'id', 'class'].includes(attr.name)) {
                            node.removeAttribute(attr.name);
                        }
                    });

                    // 如果是空的 span 标签，标记为移除
                    if (node.tagName === 'SPAN' && !node.hasAttributes()) {
                        nodesToRemove.push(node);
                    }
                }
            }
        }

        // 移除标记的节点
        nodesToRemove.forEach(node => {
            if (node.parentNode) {
                if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length > 0) {
                    // 如果是元素节点且有子节点，保留子节点
                    while (node.firstChild) {
                        node.parentNode.insertBefore(node.firstChild, node);
                    }
                }
                node.parentNode.removeChild(node);
            }
        });

        // 最后再次规范化，合并相邻的文本节点
        editor.normalize();
    }

    return {
        generateJson,
        updatePreview,
        insertFeature(type) {
            const editor = getEditor();
            if (editor) {
                insertFeature(type);
            }
        }
    };
})();
