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
            } else if (item.selector || item.translate || item.score) {
                const span = document.createElement('span');
                span.className = 'function-tag';
                span.setAttribute('contenteditable', 'false');
                span.style.opacity = '0';
                span.style.transform = 'translateY(-5px)';
                span.style.transition = 'all 0.3s ease';
                
                if (item.selector) {
                    span.setAttribute('data-type', 'selector');
                    span.setAttribute('data-selector', item.selector);
                } else if (item.translate) {
                    span.setAttribute('data-type', 'translate');
                    span.setAttribute('data-translate', item.translate);
                    if (item.with) {
                        if (Array.isArray(item.with)) {
                            span.setAttribute('data-translate-mode', 'simple');
                            span.setAttribute('data-with', item.with.join(', '));
                        } else {
                            span.setAttribute('data-translate-mode', 'rawtext');
                            span.setAttribute('data-with', JSON.stringify(item.with));
                        }
                    }
                } else if (item.score) {
                    span.setAttribute('data-type', 'score');
                    span.setAttribute('data-name', item.score.name);
                    span.setAttribute('data-objective', item.score.objective);
                    if (item.score.value !== undefined) {
                        span.setAttribute('data-value', item.score.value);
                    }
                }

                span.onclick = function() { editFunction(this); };
                updateTagPreview(span);
                editor.appendChild(span);

                // 添加淡入动画
                requestAnimationFrame(() => {
                    span.style.opacity = '1';
                    span.style.transform = 'translateY(0)';
                });
            }
        });

        // 更新预览区域
        const preview = document.getElementById('preview');
        const previewContent = document.getElementById('previewContent');
        preview.style.display = 'block';
        preview.style.opacity = '0';
        preview.style.transform = 'translateY(-10px)';
        preview.style.transition = 'all 0.3s ease';

        // 更新预览内容
        updatePreview(jsonObject.rawtext);

        // 添加预览区域的动画效果
        requestAnimationFrame(() => {
            preview.style.opacity = '1';
            preview.style.transform = 'translateY(0)';
            
            // 在淡入动画完成后添加颜色覆盖强调动画
            setTimeout(() => {
                // 创建覆盖层
                const overlay = document.createElement('div');
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(52, 152, 219, 0.2)'; // 使用半透明的蓝色
                overlay.style.pointerEvents = 'none'; // 确保不影响下面元素的交互
                overlay.style.transition = 'opacity 0.5s ease';
                
                preview.style.position = 'relative'; // 确保覆盖层定位正确
                preview.appendChild(overlay);

                // 淡出覆盖层
                setTimeout(() => {
                    overlay.style.opacity = '0';
                    // 移除覆盖层
                    setTimeout(() => overlay.remove(), 500);
                }, 400);
            }, 400); // 等待淡入动画完成
        });

        // 清空输入框并关闭模态框
        document.getElementById('jsonInput').value = '';
        closeDecodeModal();

    } catch (error) {
        console.error('JSON解析错误:', error);
        alert('JSON解析错误: ' + error.message);
    }
}
