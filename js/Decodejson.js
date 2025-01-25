function decodeJson() {
    try {
        const jsonInput = document.getElementById('jsonInput').value;
        const jsonObject = JSON.parse(jsonInput);
        
        if (!jsonObject.rawtext || !Array.isArray(jsonObject.rawtext)) {
            throw new Error('无效的 JSON 格式');
        }

        // 添加BETA水印到解析窗口
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            const betaTag = document.createElement('span');
            betaTag.className = 'decode-beta-tag';
            betaTag.textContent = 'BETA';
            betaTag.style.cssText = `
                background: #ff5555;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
                margin-left: 8px;
                font-weight: bold;
                vertical-align: middle;
                opacity: 0;
                transform: translateY(-2px);
                transition: all 0.3s ease;
            `;
            modalTitle.appendChild(betaTag);
            // 添加动画效果
            setTimeout(() => {
                betaTag.style.opacity = '1';
                betaTag.style.transform = 'translateY(0)';
            }, 100);
        }

        const editor = document.getElementById("richTextEditor");
        editor.innerHTML = '';

        // 检测是否包含translate功能
        const hasTranslate = jsonObject.rawtext.some(item => item.translate);

        jsonObject.rawtext.forEach(item => {
            if (item.text) {
                // 处理文本节点
                const textContent = item.text.replace(/\u200B/g, ''); // 移除可能存在的零宽空格
                const textNode = document.createTextNode(textContent);
                editor.appendChild(textNode);
            } else if (item.selector || item.translate || item.score) {
                // 创建功能标签
                const tag = document.createElement('span');
                tag.className = 'function-tag';
                tag.setAttribute('contenteditable', 'false');
                
                if (item.selector) {
                    tag.setAttribute('data-type', 'selector');
                    tag.setAttribute('data-selector', item.selector);
                } else if (item.translate) {
                    tag.setAttribute('data-type', 'translate');
                    tag.setAttribute('data-translate', item.translate);
                    
                    // 处理with参数
                    if (item.with) {
                        if (Array.isArray(item.with)) {
                            tag.setAttribute('data-translate-mode', 'simple');
                            const params = item.with.map(param => {
                                if (typeof param === 'string') return `文本:${param}`;
                                if (param.score) return `计分板:${param.score.name}|${param.score.objective}`;
                                if (param.selector) return `选择器:${param.selector}`;
                                return '';
                            }).filter(Boolean);
                            tag.setAttribute('data-with', params.join(','));
                        } else {
                            tag.setAttribute('data-translate-mode', 'rawtext');
                            tag.setAttribute('data-rawtext-mode', 'advanced');
                            tag.setAttribute('data-with', JSON.stringify(item.with));
                        }
                    }

                    // 添加Preview标记
                    const previewBadge = document.createElement('span');
                    previewBadge.className = 'preview-badge';
                    previewBadge.textContent = 'Preview';
                    previewBadge.style.cssText = `
                        position: absolute;
                        top: -8px;
                        right: -8px;
                        background: #3498db;
                        color: white;
                        font-size: 10px;
                        padding: 2px 4px;
                        border-radius: 3px;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    `;
                    tag.appendChild(previewBadge);
                    
                    // 添加悬停效果
                    tag.addEventListener('mouseenter', () => previewBadge.style.opacity = '1');
                    tag.addEventListener('mouseleave', () => previewBadge.style.opacity = '0');
                } else if (item.score) {
                    tag.setAttribute('data-type', 'score');
                    tag.setAttribute('data-name', item.score.name);
                    tag.setAttribute('data-objective', item.score.objective);
                }

                tag.addEventListener('click', () => editFunction(tag));
                updateTagPreview(tag);
                editor.appendChild(tag);
            }
        });

        // 更新预览区域
        RichTextEditor.updatePreview(jsonObject.rawtext);
        
        // 显示成功提示
        const modal = document.getElementById('decodeModal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            showToast('JSON解析成功！');
        }, 300);

    } catch (error) {
        console.error('JSON解析错误:', error);
        showToast('JSON解析错误: ' + error.message, 'error');
    }
}

// 添加提示框功能
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // 显示动画
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    });
}

// 修改打开解析窗口的函数
function openDecodeModal() {
    const modal = document.getElementById('decodeModal');
    // 移除旧的beta标签(如果存在)
    const oldBetaTag = modal.querySelector('.decode-beta-tag');
    if (oldBetaTag) {
        oldBetaTag.remove();
    }
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
        // 重新添加beta标签并添加动画
        const modalTitle = document.getElementById('modalTitle');
        const betaTag = document.createElement('span');
        betaTag.className = 'decode-beta-tag';
        betaTag.textContent = 'BETA';
        betaTag.style.cssText = `
            background: #ff5555;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 8px;
            font-weight: bold;
            vertical-align: middle;
            opacity: 0;
            transform: translateY(-2px);
            transition: all 0.3s ease;
        `;
        modalTitle.appendChild(betaTag);
        setTimeout(() => {
            betaTag.style.opacity = '1';
            betaTag.style.transform = 'translateY(0)';
        }, 100);
    }, 10);
}
