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
    const menuItems = menu.querySelectorAll('.menu-content button, .menu-content a');
    
    menu.classList.toggle('show');
    
    // 添加按钮旋转动画
    if (menu.classList.contains('show')) {
        menuButton.style.transform = 'rotate(180deg)';
        // 重置所有菜单项的过渡延迟
        menuItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.05}s`;
        });
    } else {
        menuButton.style.transform = 'rotate(0deg)';
        // 关闭时移除延迟
        menuItems.forEach(item => {
            item.style.transitionDelay = '0s';
        });
    }
}

// 添加自动收起菜单功能
document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('.menu');
    const menuButton = menu.querySelector('.menu-button');

    // 处理点击事件
    document.addEventListener('click', (event) => {
        // 如果菜单是展开的，并且点击的不是菜单内的元素
        if (menu.classList.contains('show') && 
            !menu.contains(event.target) && 
            event.target !== menuButton) {
            // 收起菜单
            menu.classList.remove('show');
            menuButton.style.transform = 'rotate(0deg)';
            // 重置所有菜单项的过渡延迟
            const menuItems = menu.querySelectorAll('.menu-content button, .menu-content a');
            menuItems.forEach(item => {
                item.style.transitionDelay = '0s';
            });
        }
    });

    // 阻止菜单内的点击事件冒泡
    menu.addEventListener('click', (event) => {
        if (event.target !== menuButton) {
            event.stopPropagation();
        }
    });
});

function editFunction(element) {
    currentEditingTag = element;
    const type = element.getAttribute('data-type');
    const modal = document.getElementById('functionModal');
    const form = document.getElementById('modalForm');
    
    form.innerHTML = '';
    
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
        
        // 初始化编辑区域
        switchMode(currentMode === 'rawtext' ? 
            (currentRawtextMode === 'advanced' ? 'advanced' : 'visual') : 
            'simple', true);
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
}

function closeModal() {
    const modal = document.getElementById('functionModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        currentEditingTag = null;
    }, 300); // 等待动画完成
}