function editFunction(element) {
    currentEditingTag = element;
    const type = element.getAttribute('data-type');
    const modal = document.getElementById('functionModal');
    const form = document.getElementById('modalForm');
    
    form.innerHTML = '';
    
    if (type === 'translate') {
        const currentMode = element.getAttribute('data-translate-mode') || 'simple';
        form.innerHTML = `
            <div class="translate-help">
                <p>在文本中使用以下占位符：</p>
                <ul>
                    <li>%%s - 按顺序替换参数</li>
                    <li>%%1, %%2, ... - 指定使用第几个参数</li>
                    <li>%%d, %%f - 与%%s作用相同</li>
                </ul>
            </div>
            <div class="form-group">
                <label for="modal_translate">翻译键:</label>
                <input type="text" id="modal_translate" 
                    placeholder="例如: %%s喜欢%%s, commands.gamemode.success" 
                    value="${element.getAttribute('data-translate') || ''}">
                <div class="hint">可以是游戏内建翻译键或自定义文本</div>
            </div>
            
            <input type="hidden" id="translate_mode" value="${currentMode}">
            
            <div class="translate-mode-selector">
                <label>参数模式:</label>
                <div class="mode-options">
                    <div class="mode-option ${currentMode === 'simple' ? 'selected' : ''}" 
                         data-mode="simple"
                         onclick="selectTranslateMode('simple')">
                        <h4>简单模式</h4>
                        <p>使用简单文本列表作为参数</p>
                    </div>
                    <div class="mode-option ${currentMode === 'rawtext' ? 'selected' : ''}"
                         data-mode="rawtext"
                         onclick="selectTranslateMode('rawtext')">
                        <h4>Rawtext模式</h4>
                        <p>使用高级对象作为参数</p>
                    </div>
                </div>
            </div>

            <div id="simpleParamsArea" style="display: ${currentMode === 'simple' ? 'block' : 'none'}">
                <div class="form-group">
                    <label for="modal_with_simple">参数列表（用逗号分隔）:</label>
                    <input type="text" id="modal_with_simple" 
                        placeholder="例如: 坤坤, 篮球, 唱歌"
                        value="${currentMode === 'simple' ? (element.getAttribute('data-with') || '') : ''}">
                    <div class="hint">多个参数用逗号分隔，将按顺序替换占位符</div>
                </div>
            </div>

            <div id="withRawtextArea" style="display: ${currentMode === 'rawtext' ? 'block' : 'none'}">
                <div class="form-group">
                    <label for="modal_with_rawtext">Rawtext JSON:</label>
                    <textarea id="modal_with_rawtext"
                    placeholder='简单的示例：{"rawtext":[{"selector":"@p"},{"text":"创造模式"}]}'>${currentMode === 'rawtext' ? (element.getAttribute('data-with') || ''): ''}</textarea>
                    <div class="hint">可以包含选择器、计分板等复杂对象</div>
                </div>
            </div>

            <div class="examples-section">
                <h4>快速示例:</h4>
                <div class="example-item" onclick="useTranslateExample('simple')">
                    简单示例: %%s喜欢唱，跳，rap，%%s
                </div>
                <div class="example-item" onclick="useTranslateExample('vip')">
                    VIP示例: §e%%s购买vip成功
                </div>
                <div class="example-item" onclick="useTranslateExample('gamemode')">
                    游戏模式示例: %%2 + 判断模式
                </div>
            </div>

            <div class="modal-footer">
                <button class="cancel-btn" onclick="closeModal()">取消</button>
                <button class="apply-btn" onclick="applyFunction()">应用更改</button>
            </div>
        `;

        // 初始化模式选择器
        selectTranslateMode(currentMode);
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
                <input type="text" id="modal_selector" placeholder="例如: @p, @a[r=10], @e[type=player]" value="${element.getAttribute('data-selector') || '@p'}">
                <div class="hint">
                    <p>选择器用于选择目标实体,可携带参数。</p>
                    <p>@p — 选择最近的玩家。</p>
                    <p>@r — 选择一名随机玩家。</p>
                    <p>@a — 选择所有玩家，无论死活。</p>
                    <p>@e — 选择所有活着的实体（包含玩家）。</p>
                    <p>@s — 只选择1个实体：该命令的执行者，无论是否濒死。</p>
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
    }, 10); // 动画效果
}

function closeModal() {
    const modal = document.getElementById('functionModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        currentEditingTag = null;
    }, 300); // 等待动画完成
}