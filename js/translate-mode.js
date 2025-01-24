function switchMode(mode, isInit = false) {
    const paramEditArea = document.getElementById('paramEditArea');
    if (!paramEditArea || !currentEditingTag) return;

    try {
        // 更新模式按钮状态
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        const selectedButton = document.querySelector(`.mode-btn[onclick*="${mode}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // 更新模式值
        document.getElementById('translate_mode').value = mode === 'simple' ? 'simple' : 'rawtext';
        document.getElementById('rawtext_mode').value = mode === 'advanced' ? 'advanced' : 'simple';

        // 生成编辑界面，不保留之前的数据
        let content = '';
        switch(mode) {
            case 'simple':
                // 获取当前标签的with属性，并适当处理
                let currentParams = '';
                if (isInit) {
                    const withValue = currentEditingTag.getAttribute('data-with');
                    // 如果是初始加载且有with属性值
                    if (withValue) {
                        try {
                            // 尝试解析JSON格式（处理从其他模式切换过来的情况）
                            if (withValue.startsWith('[')) {
                                const jsonData = JSON.parse(withValue);
                                currentParams = jsonData.map(item => {
                                    if (typeof item === 'string') return item;
                                    if (item.text) return item.text;
                                    if (item.score) return `${item.score.name}的${item.score.objective}`;
                                    if (item.selector) return item.selector;
                                    return '';
                                }).join(', ');
                            } else {
                                // 直接使用已有的文本格式
                                currentParams = withValue;
                            }
                        } catch (e) {
                            currentParams = withValue; // 如果解析失败，使用原始值
                        }
                    }
                }

                content = `
                    <div class="form-group">
                        <label>参数列表（用逗号分隔）:</label>
                        <input type="text" id="simple_params" 
                            placeholder="示例: text1, text2, text3"
                            value="${escapeHtml(currentParams)}">
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
                content = `
                    <div class="form-group">
                        <label>Raw JSON:</label>
                        <textarea id="advanced_json" rows="6" 
                            placeholder='[{"text":"示例"},{"selector":"@p"}]'></textarea>
                        <div class="hint">直接编辑JSON数组，完整支持所有功能</div>
                    </div>
                    <div class="examples-section">
                        <h4>快速示例</h4>
                        <div class="example-item" onclick="setExample('advanced', '[{"text":"示例文本"},{"score":{"name":"@p","objective":"score"}},{"selector":"@a"}]')">示例: [{"text":"示例文本"},{"score":{"name":"@p","objective":"score"}},{"selector":"@a"}]</div>
                    </div>
                `;
                break;
        }

        paramEditArea.innerHTML = content;

        // 如果是visual模式，添加一个默认的文本参数行
        if (mode === 'visual') {
            addParamWithType('text');
        }

        // 如果是advanced模式，设置默认的空数组
        if (mode === 'advanced') {
            document.getElementById('advanced_json').value = '{"rawtext":[]}';
        }

    } catch (error) {
        console.error('Mode switch error:', error);
        paramEditArea.innerHTML = `
            <div class="error-message">切换模式时出错: ${error.message}</div>
        `;
    }
}

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
        
        // Visual mode
        const paramRows = document.querySelectorAll('#paramsList .param-row');
        if (!paramRows.length) return '';
        
        return Array.from(paramRows)
            .map(row => {
                const type = row.querySelector('.param-type');
                if (!type) return '';
                
                switch(type.value) {
                    case 'text':
                        const textValue = row.querySelector('.param-value');
                        return textValue ? `文本:${textValue.value}` : '';
                    case 'score':
                        const name = row.querySelector('.param-name');
                        const objective = row.querySelector('.param-objective');
                        return (name && objective) ? 
                            `计分板:${name.value}|${objective.value}` : '';
                    case 'selector':
                        const selector = row.querySelector('.param-selector');
                        return selector ? `选择器:${selector.value}` : '';
                    default:
                        return '';
                }
            })
            .filter(Boolean)
            .join(',');
    } catch (error) {
        console.error('Error getting current value:', error);
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
