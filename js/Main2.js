function closeModal() {
    const modal = document.getElementById('functionModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        currentEditingTag = null;
    }, 300); // 等待动画完成
}

function generateParamInputs(type, value = '') {
    const templates = {
        text: (val) => {
            const textVal = val.startsWith('文本:') ? val.substring(3) : val;
            return `<input type="text" class="param-value" value="${escapeHtml(textVal)}" 
                placeholder="输入文本内容">`;
        },
        score: (val) => {
            const [name = '', objective = ''] = val.startsWith('计分板:') ? 
                val.substring(4).split('|') : val.split('|');
            return `
                <input type="text" class="param-name" value="${escapeHtml(name)}" 
                    placeholder="计分板目标 (如: @p)">
                <input type="text" class="param-objective" value="${escapeHtml(objective)}" 
                    placeholder="计分项名称">
            `;
        },
        selector: (val) => {
            const selectorVal = val.startsWith('选择器:') ? val.substring(4) : val;
            return `<input type="text" class="param-selector" value="${escapeHtml(selectorVal)}" 
                placeholder="选择器 (如: @p, @a, @e[type=player])">`;
        }
    };

    return templates[type] ? templates[type](value) : '';
}

// 添加HTML转义函数（如果还没有的话）
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/<//g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generateParamRow(value = '', type = 'text') {
    return `
        <div class="param-row">
            <div class="param-inputs">
                ${generateParamInputs(type, value)}
            </div>
            <select class="param-type" onchange="handleParamTypeChange(this)">
                <option value="text" ${type === 'text' ? 'selected' : ''}>纯文本</option>
                <option value="score" ${type === 'score' ? 'selected' : ''}>计分板</option>
                <option value="selector" ${type === 'selector' ? 'selected' : ''}>选择器</option>
            </select>
            <button type="button" class="remove-param" onclick="removeParamRow(this)">×</button>
            <div class="param-preview"></div>
        </div>
    `;
}

function updateParamPreview(paramRow) {
    const type = paramRow.querySelector('.param-type').value;
    const preview = paramRow.querySelector('.param-preview');
    let previewText = '';

    switch(type) {
        case 'text':
            const text = paramRow.querySelector('.param-value').value;
            previewText = text || '文本示例';
            break;
        case 'score':
            const name = paramRow.querySelector('.param-name').value || '@p';
            const objective = paramRow.querySelector('.param-objective').value || 'score';
            previewText = `[${name}的${objective}]`;
            break;
        case 'selector':
            const selector = paramRow.querySelector('.param-selector').value || '@p';
            previewText = `[${selector}]`;
            break;
    }

    preview.textContent = `预览: ${previewText}`;
    preview.className = `param-preview param-preview-${type}`;
}

function handleParamTypeChange(select) {
    const row = select.closest('.param-row');
    const inputsContainer = row.querySelector('.param-inputs');
    inputsContainer.innerHTML = generateParamInputs(select.value, '');
    updateParamPreview(row);

    // 添加输入监听
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => updateParamPreview(row));
    });
}

function addParamRow() {
    const paramsList = document.getElementById('paramsList');
    paramsList.insertAdjacentHTML('beforeend', generateParamRow());
}

function addParamWithType(type) {
    const paramsList = document.getElementById('paramsList');
    if (!paramsList) return;
    
    const defaultValues = {
        'text': '文本:示例文本',
        'score': '计分板:@p|score',
        'selector': '选择器:@p'
    };

    paramsList.insertAdjacentHTML('beforeend', generateParamRow(defaultValues[type], type));
    
    // 获取并初始化新行
    const newRow = paramsList.lastElementChild;
    updateParamPreview(newRow);
    bindRowEvents(newRow);
}

function bindRowEvents(row) {
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => updateParamPreview(row));
    });
}

function removeParamRow(button) {
    button.closest('.param-row').remove();
}

function generateExistingParams(withData) {
    if (!withData) return '';
    
    try {
        const params = withData.split(',').map(param => {
            param = param.trim();
            if (param.startsWith('计分板:')) {
                return generateParamRow(param.replace('计分板:', ''), 'score');
            } else if (param.startsWith('选择器:')) {
                return generateParamRow(param.replace('选择器:', ''), 'selector');
            } else if (param.startsWith('文本:')) {
                return generateParamRow(param.replace('文本:', ''), 'text');
            } else {
                return generateParamRow(param, 'text');
            }
        });
        return params.join('');
    } catch (e) {
        console.error('解析现有参数失败:', e);
        return '';
    }
}

function updateTagPreview(tag) {
    const type = tag.getAttribute('data-type');
    let previewText = '';

    switch(type) {
        case 'score':
            const name = tag.getAttribute('data-name') || '@p';
            const objective = tag.getAttribute('data-objective') || 'score';
            previewText = `[${name}的${objective}]`;
            break;
        case 'selector':
            const selector = tag.getAttribute('data-selector') || '@p';
            previewText = `[${selector}]`;
            break;
        case 'translate':
            const translateKey = tag.getAttribute('data-translate') || '';
            const mode = tag.getAttribute('data-translate-mode') || 'simple';
            const withValue = tag.getAttribute('data-with') || '';
            previewText = `翻译: ${translateKey}`;
            if (mode === 'simple') {
                previewText += ` (${withValue.split(',').map(p => p.trim()).join(', ')})`;
            } else {
                try {
                    const withJson = JSON.parse(withValue);
                    previewText += ` (${JSON.stringify(withJson)})`;
                } catch (e) {
                    previewText += ` (无效的JSON)`;
                }
            }
            break;
    }

    tag.setAttribute('data-preview', previewText);
    tag.innerHTML = previewText;
}

function applyFunction() {
    if (!currentEditingTag) return;
    
    const type = currentEditingTag.getAttribute('data-type');
    
    try {
        if (type === 'translate') {
            const translateData = {
                translate: document.getElementById('modal_translate').value,
                mode: document.getElementById('translate_mode').value,
                rawtextMode: document.getElementById('rawtext_mode').value,
                withValue: getTranslateWithValue()
            };
            
            // 检查参数合法性
            if(!translateData.translate) {
                throw new Error('翻译键不能为空');
            }
            
            // 根据当前模式获取参数值
            let paramValue = '';
            if (translateData.mode === 'simple') {
                const simpleInput = document.getElementById('simple_params');
                paramValue = simpleInput ? simpleInput.value.trim() : '';
            } else if (translateData.mode === 'rawtext') {
                if (translateData.rawtextMode === 'advanced') {
                    try {
                        const jsonInput = document.getElementById('advanced_json');
                        const jsonValue = jsonInput ? jsonInput.value : '[]';
                        // 验证JSON格式
                        JSON.parse(jsonValue);
                        paramValue = jsonValue;
                    } catch(e) {
                        throw new Error('无效的JSON格式');
                    }
                } else {
                    // visual模式
                    const paramsList = document.querySelectorAll('#paramsList .param-row');
                    const params = Array.from(paramsList)
                        .map(row => {
                            const type = row.querySelector('.param-type').value;
                            const values = {
                                text: () => {
                                    const value = row.querySelector('.param-value').value.trim();
                                    return value ? `文本:${value}` : '';
                                },
                                score: () => {
                                    const name = row.querySelector('.param-name').value.trim() || '@p';
                                    const obj = row.querySelector('.param-objective').value.trim() || 'score';
                                    return `计分板:${name}|${obj}`;
                                },
                                selector: () => {
                                    const sel = row.querySelector('.param-selector').value.trim() || '@p';
                                    return `选择器:${sel}`;
                                }
                            };
                            return values[type] ? values[type]() : '';
                        })
                        .filter(Boolean);
                    paramValue = params.join(',');
                }
            }
            
            // 更新标签属性
            currentEditingTag.setAttribute('data-translate', translateData.translate);
            currentEditingTag.setAttribute('data-translate-mode', translateData.mode);
            currentEditingTag.setAttribute('data-rawtext-mode', translateData.rawtextMode);
            currentEditingTag.setAttribute('data-with', paramValue);
            
            // 更新预览
            updateTagPreview(currentEditingTag);
            closeModal();
        } else {
            // ...处理其他类型...
        }
    } catch (error) {
        console.error('应用更改失败:', error);
        alert(error.message);
    }
}

function getTranslateWithValue() {
    const mode = document.getElementById('translate_mode').value;
    const rawtextMode = document.getElementById('rawtext_mode').value;
    
    if (mode === 'simple') {
        return document.getElementById('modal_with_simple').value;
    }
    
    if (mode === 'rawtext') {
        if (rawtextMode === 'advanced') {
            return document.getElementById('modal_with_rawtext').value;
        }
        
        return Array.from(document.querySelectorAll('#paramsList .param-row'))
            .map(row => {
                const type = row.querySelector('.param-type').value;
                switch(type) {
                    case 'text':
                        return `文本:${row.querySelector('.param-value').value}`;
                    case 'score':
                        return `计分板:${row.querySelector('.param-name').value}|${row.querySelector('.param-objective').value}`;
                    case 'selector':
                        return `选择器:${row.querySelector('.param-selector').value}`;
                }
                return '';
            })
            .filter(Boolean)
            .join(',');
    }
    
    return '';
}

function initParamsList() {
    // 初始化参数列表的事件监听器
    const addButton = document.querySelector('.params-toolbar button');
    if (addButton) {
        addButton.addEventListener('click', addParamRow);
    }
}