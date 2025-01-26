function openChangelogModal() {
    const modal = document.getElementById('changelogModal');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10); // 确保动画效果
}

function closeChangelogModal() {
    const modal = document.getElementById('changelogModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // 等待动画完成
}

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

function openAboutModal() {
    const modal = document.getElementById('aboutModal');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10); // 确保动画效果
}

function closeAboutModal() {
    const modal = document.getElementById('aboutModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // 等待动画完成
}

function toggleMenu() {
    const menu = document.querySelector('.menu');
    const menuButton = menu.querySelector('.menu-button');
    
    if (!menu) return;
    
    // 检查当前状态
    const isOpening = !menu.classList.contains('show');
    
    // 如果正在打开菜单
    if (isOpening) {
        menu.classList.add('show');
        menuButton.style.transform = 'rotate(90deg)';
        
        // 添加点击外部关闭事件
        const closeMenu = function(e) {
            if (!menu.contains(e.target) && e.target !== menuButton) {
                menu.classList.remove('show');
                menuButton.style.transform = 'rotate(0deg)';
                document.removeEventListener('click', closeMenu);
            }
        };
        
        // 延迟添加事件监听器，避免立即触发
        requestAnimationFrame(() => {
            document.addEventListener('click', closeMenu);
        });
    } else {
        // 如果正在关闭菜单
        menu.classList.remove('show');
        menuButton.style.transform = 'rotate(0deg)';
    }
}

// 移除原有的DOMContentLoaded事件监听器
document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('.menu');
    if (!menu) return;

    // 阻止菜单内的点击事件冒泡
    menu.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    initDarkMode();
});

function editFunction(element) {
    if (!window.switchMode) {
        console.error('switchMode 函数未定义');
        return;
    }

    currentEditingTag = element;
    const type = element.getAttribute('data-type');
    const modal = document.getElementById('functionModal');
    const form = document.getElementById('modalForm');
    
    if (!modal || !form) {
        console.error('找不到必要的DOM元素');
        return;
    }
    
    form.innerHTML = '';
    
    try {
        if (type === 'translate') {
            const currentMode = element.getAttribute('data-translate-mode') || 'simple';
            const currentRawtextMode = element.getAttribute('data-rawtext-mode') || 'simple';
            
            form.innerHTML = `
                <input type="hidden" id="translate_mode" value="${currentMode}">
                <input type="hidden" id="rawtext_mode" value="${currentRawtextMode}">
                
                <div class="translate-help">
                    <p>占位符说明：</p>
                    <ul>
                        <li>%%s - 按顺序替换参数</li>
                        <li>%%1, %%2, ... - 指定使用第几个参数</li>
                    </ul>
                </div>
                
                <div class="form-group">
                    <label for="modal_translate">翻译键:</label>
                    <input type="text" id="modal_translate" 
                        placeholder="%%s购买了%%s" 
                        value="${element.getAttribute('data-translate') || ''}">
                </div>

                <div class="mode-switcher">
                    <h4>参数编辑方式</h4>
                    <div class="mode-options">
                        <button class="mode-btn ${currentMode === 'simple' ? 'active' : ''}" 
                                onclick="switchMode('simple')">
                            简单文本
                            <span class="mode-desc">直接输入文本列表</span>
                        </button>
                        <button class="mode-btn ${currentMode === 'rawtext' && currentRawtextMode === 'simple' ? 'active' : ''}" 
                                onclick="switchMode('visual')">
                            可视化
                            <span class="mode-desc">图形界面编辑参数</span>
                        </button>
                        <button class="mode-btn ${currentMode === 'rawtext' && currentRawtextMode === 'advanced' ? 'active' : ''}" 
                                onclick="switchMode('advanced')">
                            高级JSON
                            <span class="mode-desc">直接编辑JSON</span>
                        </button>
                    </div>
                </div>

                <div id="paramEditArea">
                    <!-- 根据模式动态生成内容 -->
                </div>

                <div class="modal-footer">
                    <button class="cancel-btn" onclick="closeModal()">取消</button>
                    <button class="apply-btn" onclick="applyFunction()">应用更改</button>
                </div>
            `;
            
            // 初始化编辑区域并加载已保存的数据
            window.switchMode(currentMode === 'rawtext' ? 
                (currentRawtextMode === 'advanced' ? 'advanced' : 'visual') : 
                'simple', true);
            
            // 设置初始数据
            if (currentEditingTag) {
                const savedWith = currentEditingTag.getAttribute('data-with') || '';
                if (savedWith) {
                    try {
                        // 尝试解析已保存的数据
                        if (currentMode === 'simple') {
                            document.getElementById('simple_params').value = savedWith;
                        } else if (currentMode === 'rawtext') {
                            if (currentRawtextMode === 'visual') {
                                // 可视化模式：使用simple格式
                                const params = savedWith.split(',').map(param => param.trim());
                                params.forEach(param => {
                                    let type = 'text';
                                    if (param.startsWith('计分板:')) type = 'score';
                                    else if (param.startsWith('选择器:')) type = 'selector';
                                    const paramsList = document.getElementById('paramsList');
                                    if (paramsList) {
                                        paramsList.insertAdjacentHTML('beforeend', generateParamRow(param, type));
                                    }
                                });
                            } else {
                                // 高级模式：原始JSON
                                document.getElementById('advanced_json').value = savedWith;
                            }
                        }
                    } catch (e) {
                        console.error('加载已保存数据失败:', e);
                    }
                }
            }
        } else if (type === 'score') {
            form.innerHTML = `
                <div class="form-group">
                    <label for="modal_name">计分对象名称:</label>
                    <input type="text" id="modal_name" placeholder="例如: @p, @a, 玩家名" value="${element.getAttribute('data-name') || '@p'}">
                    <div class="hint">选择要显示分数的目标</div>
                </div>
                <div class="form-group">
                    <label for="modal_objective">计分项:</label>
                    <input type="text" id="modal_objective" placeholder="例如: money, score" value="${element.getAttribute('data-objective') || ''}">
                    <div class="hint">计分板中的计分项名称</div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn" onclick="closeModal()">取消</button>
                    <button class="apply-btn" onclick="applyFunction()">应用更改</button>
                </div>
            `;
        } else if (type === 'selector') {
            form.innerHTML = `
                <div class="form-group">
                    <label for="modal_selector">选择器:</label>
                    <input type="text" id="modal_selector" 
                        placeholder="例如: @p, @a[r=10], @e[type=player]" 
                        value="${element.getAttribute('data-selector') || '@p'}">
                    <div class="hint">
                        <p>基岩版选择器说明：</p>
                        <p>@p — 最近的玩家</p>
                        <p>@r — 随机玩家</p>
                        <p>@a — 所有玩家</p>
                        <p>@e — 所有实体（包括：玩家、怪物、掉落物等）</p>
                        <p>@s — 命令的执行者</p>
                        <p>@initiator — 触发事件的实体</p>
                        <p>例如：@e[type=player,r=10]，@a[scores={score=10}]</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn" onclick="closeModal()">取消</button>
                    <button class="apply-btn" onclick="applyFunction()">应用更改</button>
                </div>
            `;
        }
        
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    } catch (error) {
        console.error('编辑窗口打开失败:', error);
        alert('编辑窗口打开失败: ' + error.message);
    }
}

// 确保 currentEditingTag 变量在全局作用域可用
window.currentEditingTag = null;

function closeModal() {
    const modal = document.getElementById('functionModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        currentEditingTag = null;
    }, 300); // 等待动画完成
}