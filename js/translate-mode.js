const TranslateMode = {
    // 简单模式处理
    simple: {
        process(translateKey, params) {
            if (!params) return { translate: translateKey };
            
            // 直接分割文本处理参数
            const withArray = params.split(',').map(param => {
                param = param.trim();
                if (param.startsWith('文本:')) {
                    return { text: param.substring(3) };
                } else if (param.startsWith('计分板:')) {
                    const [name, objective] = param.substring(4).split('|');
                    return {
                        score: {
                            name: name.trim() || '@p',
                            objective: objective.trim() || 'score'
                        }
                    };
                } else if (param.startsWith('选择器:')) {
                    return { selector: param.substring(4).trim() || '@p' };
                } else {
                    return { text: param };
                }
            }).filter(Boolean);

            return {
                translate: translateKey,
                with: withArray
            };
        },
        
        generatePreview(translateKey, params) {
            if (!params) return translateKey;
            
            const paramArray = params.split(',').map(p => p.trim());
            return translateKey.replace(/%%([0-9sdf])/g, (match, p1) => {
                let index;
                if (p1 === 's' || p1 === 'd' || p1 === 'f') {
                    index = 0;
                } else {
                    index = parseInt(p1) - 1;
                }
                
                if (index < 0 || index >= paramArray.length) return '?';
                
                const param = paramArray[index];
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
        }
    },

    // Rawtext模式处理
    rawtext: {
        process(translateKey, rawtextData) {
            try {
                const parsedData = JSON.parse(rawtextData);
                return {
                    translate: translateKey,
                    with: parsedData.rawtext || parsedData
                };
            } catch (e) {
                throw new Error('无效的Rawtext JSON格式: ' + e.message);
            }
        },
        
        generatePreview(translateKey, rawtextData) {
            try {
                const data = JSON.parse(rawtextData);
                if (data && data.rawtext) {
                    return data.rawtext.map(item => {
                        if (item.text) return item.text;
                        if (item.score) return `[${item.score.name}的${item.score.objective}]`;
                        if (item.selector) return `[${item.selector}]`;
                        return '';
                    }).join('');
                }
                return translateKey;
            } catch (e) {
                return '[Rawtext格式错误]';
            }
        }
    },

    // 可视化模式处理
    visual: {
        process(translateKey, paramsList) {
            try {
                // 统一将参数转换为字符串处理
                const paramsString = typeof paramsList === 'string' ? 
                    paramsList : 
                    (Array.isArray(paramsList) ? paramsList.join(',') : '');
                    
                return this._processVisualParams(translateKey, paramsString);
            } catch (error) {
                console.error('Visual mode processing error:', error);
                throw error;
            }
        },

        // 确保这个方法可以被外部访问
        _processVisualParams(translateKey, paramsString) {
            if (!paramsString) {
                return { translate: translateKey, with: [] };
            }

            const withArray = paramsString.split(',')
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
                    }
                    if (param.startsWith('选择器:')) {
                        return { selector: param.substring(4).trim() || '@p' };
                    }
                    if (param.startsWith('文本:')) {
                        return { text: param.substring(3).trim() };
                    }
                    return { text: param };
                });

            return {
                translate: translateKey,
                with: withArray
            };
        }
    }
};

window.TranslateMode = TranslateMode;

// ...existing code...

// 确保 switchMode 函数在全局作用域可用
window.switchMode = function(mode, shouldLoadSavedData = false) {
    const paramEditArea = document.getElementById('paramEditArea');
    if (!paramEditArea || !currentEditingTag) return;

    try {
        // 更新模式按钮状态和模式值
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        const selectedButton = document.querySelector(`.mode-btn[onclick*="${mode}"]`);
        if (selectedButton) selectedButton.classList.add('active');

        document.getElementById('translate_mode').value = mode === 'simple' ? 'simple' : 'rawtext';
        document.getElementById('rawtext_mode').value = mode === 'advanced' ? 'advanced' : 'simple';

        // 获取已保存的数据
        const savedWith = shouldLoadSavedData ? (currentEditingTag.getAttribute('data-with') || '') : '';
        const savedMode = currentEditingTag.getAttribute('data-translate-mode') || 'simple';
        const savedRawtextMode = currentEditingTag.getAttribute('data-rawtext-mode') || 'simple';

        let content = '';
        switch(mode) {
            case 'simple':
                // 如果是初始化且有保存的数据，使用保存的数据
                const simpleValue = shouldLoadSavedData ? savedWith : '';
                content = `
                    <div class="form-group">
                        <label>参数列表（用逗号分隔）:</label>
                        <input type="text" id="simple_params" class="form-control"
                            placeholder="示例: text1, text2, text3"
                            value="${escapeHtml(simpleValue)}">
                        <div class="hint">多个参数用逗号分隔，将按顺序替换占位符</div>
                    </div>
                    <div class="examples-section">
                        <h4>快速示例</h4>
                        <div class="example-item" onclick="setExample('simple', '示例文本1, 示例文本2')">示例: 示例文本1, 示例文本2</div>
                    </div>
                `;
                break;

            case 'visual':
                content = `
                    <div class="visual-params">
                        <div class="param-tools">
                            <button type="button" onclick="addParamWithType('text')">添加文本</button>
                            <button type="button" onclick="addParamWithType('score')">添加计分板</button>
                            <button type="button" onclick="addParamWithType('selector')">添加选择器</button>
                        </div>
                        <div id="paramsList"></div>
                        <div class="hint">可视化编辑参数，每项参数可独立设置类型</div>
                    </div>
                    <div class="examples-section">
                        <h4>快速示例</h4>
                        <div class="example-item" onclick="setExample('visual', '文本:示例文本, 计分板:@p|score, 选择器:@a')">示例: 文本:示例文本, 计分板:@p|score, 选择器:@a</div>
                    </div>
                `;
                break;

            case 'advanced':
                // 如果是初始化且有保存的数据，尝试解析JSON
                let advancedValue = '[]';
                if (shouldLoadSavedData && savedWith) {
                    try {
                        // 尝试解析已保存的数据
                        if (savedMode === 'simple') {
                            // 从简单模式转换
                            advancedValue = formatForAdvanced(savedWith);
                        } else {
                            // 已经是JSON格式
                            advancedValue = savedWith;
                        }
                    } catch (e) {
                        console.error('解析已保存数据失败:', e);
                    }
                }
                content = `
                    <div class="form-group">
                        <label>Raw JSON:</label>
                        <textarea id="advanced_json" rows="6" 
                            placeholder='[{"text":"示例"},{"selector":"@p"}]'>${advancedValue}</textarea>
                        <div class="hint">直接编辑JSON数组，完整支持所有功能</div>
                    </div>
                    // ...existing code...
                `;
                break;
        }

        paramEditArea.innerHTML = content;

        // 如果是可视化模式且需要加载已保存的数据
        if (mode === 'visual' && shouldLoadSavedData && savedWith) {
            loadVisualModeData(savedWith);
        }

    } catch (error) {
        console.error('Mode switch error:', error);
        paramEditArea.innerHTML = `
            <div class="error-message">切换模式时出错: ${error.message}</div>
        `;
    }
};

// 添加加载可视化模式数据的辅助函数
function loadVisualModeData(savedWith) {
    const paramsList = document.getElementById('paramsList');
    if (!paramsList) return;

    try {
        const params = savedWith.split(',').map(param => param.trim());
        params.forEach(param => {
            let type = 'text';
            if (param.startsWith('计分板:')) type = 'score';
            else if (param.startsWith('选择器:')) type = 'selector';
            paramsList.insertAdjacentHTML('beforeend', generateParamRow(param, type));
        });
        
        // 绑定事件到新创建的行
        paramsList.querySelectorAll('.param-row').forEach(bindRowEvents);
    } catch (e) {
        console.error('加载可视化模式数据失败:', e);
    }
}

// ...existing code...

function getCurrentValue() {
    try {
        const translateMode = document.getElementById('translate_mode');
        const rawtextMode = document.getElementById('rawtext_mode');
        
        if (!translateMode || !rawtextMode) {
            return '';
        }
        
        if (translateMode.value === 'simple') {
            const simpleParams = document.getElementById('simple_params');
            return simpleParams ? simpleParams.value : '';
        }
        
        if (rawtextMode.value === 'advanced') {
            const advancedJson = document.getElementById('advanced_json');
            return advancedJson ? advancedJson.value : '';
        }
        
        // 可视化模式
        const paramsList = document.getElementById('paramsList');
        if (!paramsList) return '';
        
        const paramRows = paramsList.querySelectorAll('.param-row');
        if (!paramRows.length) return '';
        
        const params = Array.from(paramRows)
            .map(row => {
                const type = row.querySelector('.param-type');
                if (!type) return '';
                
                try {
                    switch(type.value) {
                        case 'text':
                            const textValue = row.querySelector('.param-value');
                            return textValue ? `文本:${textValue.value}` : '';
                        case 'score':
                            const name = row.querySelector('.param-name');
                            const objective = row.querySelector('.param-objective');
                            if (!name || !objective) return '';
                            return `计分板:${name.value || '@p'}|${objective.value || 'score'}`;
                        case 'selector':
                            const selector = row.querySelector('.param-selector');
                            return selector ? `选择器:${selector.value || '@p'}` : '';
                        default:
                            return '';
                    }
                } catch (e) {
                    console.error('处理参数行错误:', e);
                    return '';
                }
            })
            .filter(Boolean);

        return params.join(',');
    } catch (error) {
        console.error('获取当前值错误:', error);
        return '';
    }
}

// 添加格式转换辅助函数
function formatForSimple(value) {
    try {
        if (!value) return '';
        if (value.includes('文本:') || value.includes('计分板:') || value.includes('选择器:')) {
            return value; // 已经是simple格式
        }
        // 尝试解析JSON
        const json = JSON.parse(value);
        return json.map(item => {
            if (item.text) return item.text;
            if (item.score) return `${item.score.name}的${item.score.objective}`;
            if (item.selector) return item.selector;
            return '';
        }).join(', ');
    } catch (e) {
        return value;
    }
}

function formatForAdvanced(value) {
    try {
        if (!value) return '[]';
        if (value.startsWith('[')) {
            return value; // 已经是JSON格式
        }
        // 转换simple/visual格式到JSON
        const params = value.split(',').map(param => {
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
            } else {
                return { text: param };
            }
        });
        return JSON.stringify(params, null, 2);
    } catch (e) {
        return '[]';
    }
}

function setExample(mode, example) {
    switch(mode) {
        case 'simple':
            document.getElementById('simple_params').value = example;
            break;
        case 'visual':
            const paramsList = document.getElementById('paramsList');
            paramsList.innerHTML = '';
            const params = example.split(',').map(param => param.trim());
            params.forEach(param => {
                if (param.startsWith('文本:')) {
                    paramsList.insertAdjacentHTML('beforeend', generateParamRow(param, 'text'));
                } else if (param.startsWith('计分板:')) {
                    paramsList.insertAdjacentHTML('beforeend', generateParamRow(param, 'score'));
                } else if (param.startsWith('选择器:')) {
                    paramsList.insertAdjacentHTML('beforeend', generateParamRow(param, 'selector'));
                }
            });
            break;
        case 'advanced':
            document.getElementById('advanced_json').value = example;
            break;
    }
}
