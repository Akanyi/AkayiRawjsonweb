function insertCode(code) {
    const editor = document.getElementById("richTextEditor");
    if (!isCaretInEditor()) {
        focusEditor();
    }
    
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const textNode = document.createTextNode(code);
    range.insertNode(textNode);
    
    // 移动光标到插入的文本后面
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // 修复多选删除后渲染异常问题
    editor.normalize();
}

function toggleWithInputType() {
    const type = document.getElementById('withType').value;
    document.getElementById('simpleWithInput').style.display = 
        type === 'simple' ? 'block' : 'none';
    document.getElementById('rawtextWithInput').style.display = 
        type === 'rawtext' ? 'block' : 'none';
}

function useTemplate(type) {
    switch(type) {
        case 'simple':
            document.getElementById('translateInput').value = '%%s喜欢唱，跳，rap，%%s';
            document.getElementById('withType').value = 'simple';
            document.getElementById('withParams').value = '坤坤, 篮球';
            break;
        case 'selector':
            document.getElementById('translateInput').value = '§e%%s购买vip成功';
            document.getElementById('withType').value = 'rawtext';
            document.getElementById('withRawtext').value = 
                JSON.stringify({"rawtext":[{"selector":"@p"}]}, null, 2);
            break;
        case 'gamemode':
            document.getElementById('translateInput').value = '%%2';
            document.getElementById('withType').value = 'rawtext';
            document.getElementById('withRawtext').value = 
                JSON.stringify({"rawtext":[{"selector":"@s[m=1]"},{"text":"创造模式"}]}, null, 2);
            break;
    }
    toggleWithInputType();
}

let currentEditingTag = null;

function updateTagPreview(element) {
    const type = element.getAttribute('data-type');
    let preview = '';
    
    switch(type) {
        case 'score':
            const name = element.getAttribute('data-name') || '@p';
            const objective = element.getAttribute('data-objective') || 'score';
            const value = element.getAttribute('data-value');
            preview = value ? `${name}: ${value}` : `${name} 的 ${objective}`;
            break;
        case 'selector':
            preview = element.getAttribute('data-selector') || '@p';
            break;
        case 'translate':
            const translate = element.getAttribute('data-translate') || '';
            const withParams = element.getAttribute('data-with') || '';
            if (withParams) {
                // 替换 %%s 为实际参数
                let params = withParams.split(',').map(p => p.trim());
                let text = translate;
                params.forEach(param => {
                    text = text.replace('%%s', param);
                });
                preview = text;
            } else {
                preview = translate;
            }
            break;
    }
    
    element.setAttribute('data-preview', preview);
}

function insertFeature(type) {
    const editor = document.getElementById("richTextEditor");
    if (!isCaretInEditor()) {
        focusEditor();
    }
    
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    
    const tagId = 'func_' + Math.random().toString(36).substr(2, 9);
    let span = document.createElement('span');
    span.id = tagId;
    span.className = 'function-tag';
    span.setAttribute('data-type', type);
    span.setAttribute('contenteditable', 'false');
    span.onclick = function() { editFunction(this); };
    
    switch(type) {
        case 'score':
            span.setAttribute('data-name', '@p');
            span.setAttribute('data-objective', 'score');
            break;
        case 'selector':
            span.setAttribute('data-selector', '@p');
            break;
        case 'translate':
            span.setAttribute('data-translate', '%%s很厉害');
            span.setAttribute('data-with', 'Steve');
            break;
    }
    
    // 更新预览文本
    updateTagPreview(span);
    
    range.deleteContents();
    range.insertNode(span);
    
    // 移动光标到插入的标签后面
    range.setStartAfter(span);
    range.setEndAfter(span);
    selection.removeAllRanges();
    selection.addRange(range);
    
    editor.focus();
    
    // 修复多选删除后渲染异常问题
    editor.normalize();
}

function selectTranslateMode(mode) {
    try {
        // 更新隐藏的输入字段
        const modeInput = document.getElementById('translate_mode');
        if (modeInput) {
            modeInput.value = mode;
        }

        // 更新视觉效果
        const options = document.querySelectorAll('.mode-option');
        options.forEach(opt => opt.classList.remove('selected'));
        
        const selectedOption = document.querySelector(`.mode-option[data-mode="${mode}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        // 切换显示区域
        const simpleArea = document.getElementById('simpleParamsArea');
        const rawtextArea = document.getElementById('withRawtextArea');
        
        if (simpleArea) {
            simpleArea.style.display = mode === 'simple' ? 'block' : 'none';
        }
        if (rawtextArea) {
            rawtextArea.style.display = mode === 'rawtext' ? 'block' : 'none';
        }
    } catch (error) {
        console.error('模式切换错误:', error);
    }
}

function useTranslateExample(type) {
    const translateInput = document.getElementById('modal_translate');
    const withSimpleInput = document.getElementById('modal_with_simple');
    const withRawtextInput = document.getElementById('modal_with_rawtext');
    
    switch(type) {
        case 'simple':
            translateInput.value = '%%s喜欢唱，跳，rap，%%s';
            selectTranslateMode('simple');
            withSimpleInput.value = '坤坤, 篮球';
            break;
        case 'vip':
            translateInput.value = '§e%%s购买vip成功';
            selectTranslateMode('rawtext');
            withRawtextInput.value = JSON.stringify({
                "rawtext": [{"selector": "@p"}]
            }, null, 2);
            break;
        case 'gamemode':
            translateInput.value = '%%2';
            selectTranslateMode('rawtext');
            withRawtextInput.value = JSON.stringify({
                "rawtext": [
                    {"selector": "@s[m=1]"},
                    {"text": "创造模式"}
                ]
            }, null, 2);
            break;
    }
}

function bindInsertButtons() {
    const buttons = document.querySelectorAll('#colorButtons button, .feature-buttons button');
    buttons.forEach(button => {
        button.onclick = function() {
            const code = this.getAttribute('onclick').match(/insertCode\('(.+?)'\)/);
            if (code) {
                insertCode(code[1]);
            } else {
                const feature = this.getAttribute('onclick').match(/insertFeature\('(.+?)'\)/);
                if (feature) {
                    insertFeature(feature[1]);
                }
            }
        };
    });
}