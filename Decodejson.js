function openDecodeModal() {
    const modal = document.getElementById('decodeModal');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10); // 确保动画效果
}

function closeDecodeModal() {
    const modal = document.getElementById('decodeModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // 等待动画完成
}

function toggleMenu() {
    const menu = document.querySelector('.menu');
    menu.classList.toggle('show');
}

function decodeJson() {
    try {
        const jsonInput = document.getElementById('jsonInput').value;
        const jsonObject = JSON.parse(jsonInput);
        
        if (!jsonObject.rawtext || !Array.isArray(jsonObject.rawtext)) {
            throw new Error('无效的 JSON 格式');
        }

        const editor = document.getElementById("richTextEditor");
        editor.innerHTML = '';

        jsonObject.rawtext.forEach(item => {
            if (item.text) {
                const textNode = document.createTextNode(item.text);
                editor.appendChild(textNode);
            } else if (item.selector) {
                const span = document.createElement('span');
                span.className = 'function-tag';
                span.setAttribute('data-type', 'selector');
                span.setAttribute('data-selector', item.selector);
                span.setAttribute('contenteditable', 'false');
                span.onclick = function() { editFunction(this); };
                updateTagPreview(span);
                editor.appendChild(span);
            } else if (item.translate) {
                const span = document.createElement('span');
                span.className = 'function-tag';
                span.setAttribute('data-type', 'translate');
                span.setAttribute('data-translate', item.translate);
                span.setAttribute('data-with', JSON.stringify(item.with || []));
                span.setAttribute('contenteditable', 'false');
                span.onclick = function() { editFunction(this); };
                updateTagPreview(span);
                editor.appendChild(span);
            } else if (item.score) {
                const span = document.createElement('span');
                span.className = 'function-tag';
                span.setAttribute('data-type', 'score');
                span.setAttribute('data-name', item.score.name);
                span.setAttribute('data-objective', item.score.objective);
                if (item.score.value) {
                    span.setAttribute('data-value', item.score.value);
                }
                span.setAttribute('contenteditable', 'false');
                span.onclick = function() { editFunction(this); };
                updateTagPreview(span);
                editor.appendChild(span);
            }
        });

        // 显眼的颜色提示预览
        const preview = document.getElementById('preview');
        preview.style.display = 'block';
        preview.style.backgroundColor = '#ffeb3b'; // 黄色背景
        preview.innerHTML = '<div id="previewContent"></div><div class="preview-note">注：预览效果不显示颜色修饰，与实际游戏中不同，仅供参考</div>';
        setTimeout(() => {
            preview.style.backgroundColor = ''; // 恢复原背景色
        }, 2000); // 2秒后恢复

        closeDecodeModal();

    } catch (error) {
        console.error('JSON解析错误:', error);
        alert('JSON解析错误: ' + error.message);
    }
}
