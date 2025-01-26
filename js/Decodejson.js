function decodeJson() {
    try {
        const jsonInput = document.getElementById('jsonInput').value;
        const useVisualTranslate = document.getElementById('visualTranslate').checked;
        
        // 添加确认检查
        if (useVisualTranslate) {
            // 检查是否包含复杂结构
            const jsonObject = JSON.parse(jsonInput);
            const hasComplexStructure = checkComplexStructure(jsonObject);
            
            if (hasComplexStructure && !confirm(
                '警告：检测到复杂的translate结构。\n\n' +
                '可视化模式不支持以下情况：\n' +
                '- translate嵌套translate\n' +
                '- 复杂的rawtext参数结构\n' +
                '- 自定义参数格式\n\n' +
                '建议对复杂结构使用原始JSON模式解析。\n\n' +
                '是否仍要使用可视化模式解析？'
            )) {
                // 用户选择取消，自动切换到原始模式
                document.getElementById('visualTranslate').checked = false;
                return;
            }
        }

        const jsonObject = JSON.parse(jsonInput);
        
        if (!jsonObject.rawtext || !Array.isArray(jsonObject.rawtext)) {
            throw new Error('无效的 JSON 格式');
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
                        // 统一转换为数组格式
                        let withArray = Array.isArray(item.with) ? item.with :
                            (item.with.rawtext || item.with.parameters || []);
                        
                        if (useVisualTranslate) {
                            // 改进参数转换逻辑
                            const visualParams = withArray.map(param => {
                                if (typeof param === 'string') {
                                    return `文本:${param}`;
                                }
                                if (param.score) {
                                    return `计分板:${param.score.name}|${param.score.objective}`;
                                }
                                if (param.selector) {
                                    return `选择器:${param.selector}`;
                                }
                                if (param.text) {
                                    return `文本:${param.text}`;
                                }
                                // 对于复杂结构，转为JSON字符串
                                return JSON.stringify(param);
                            }).filter(Boolean);

                            tag.setAttribute('data-translate-mode', 'simple');
                            tag.setAttribute('data-with', visualParams.join(','));
                        } else {
                            // 保持原始JSON格式
                            tag.setAttribute('data-translate-mode', 'rawtext');
                            tag.setAttribute('data-rawtext-mode', 'advanced');
                            tag.setAttribute('data-with', JSON.stringify(withArray));
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

// 添加复杂结构检查函数
function checkComplexStructure(jsonObject) {
    if (!jsonObject.rawtext) return false;

    // 递归检查函数
    function checkNode(node) {
        if (!node) return false;
        
        // 检查translate嵌套
        if (node.translate && node.with) {
            const params = Array.isArray(node.with) ? node.with : 
                          (node.with.rawtext || node.with.parameters || []);
            
            // 检查参数中是否有translate
            for (const param of params) {
                if (param.translate) return true;
            }
            
            // 检查复杂的rawtext结构
            if (node.with.rawtext && node.with.rawtext.some(item => item.translate)) {
                return true;
            }
        }
        
        // 检查数组
        if (Array.isArray(node)) {
            return node.some(checkNode);
        }
        
        // 检查对象
        if (typeof node === 'object') {
            return Object.values(node).some(checkNode);
        }
        
        return false;
    }

    return checkNode(jsonObject);
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
    const oldBetaTag = modal.querySelector('.decode-beta-tag');
    if (oldBetaTag) oldBetaTag.remove();
    
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeDecodeModal()">&times;</span>
            <h3 id="modalTitle">解析 JSON</h3>
            <div class="beta-indicator"></div>
            <p class="beta-tip">此功能正在测试中，如有问题请反馈</p>
            
            <div class="decode-options">
                <label>
                    <input type="checkbox" id="visualTranslate" checked>
                    将translate解析为可视化模式
                </label>
            </div>
            
            <textarea id="jsonInput" placeholder="在此输入要解析的 JSON"></textarea>
            <div class="decode-buttons">
                <button onclick="decodeJson()">解析</button>
            </div>
        </div>
    `;
    
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
