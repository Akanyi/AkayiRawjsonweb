function applyFunction() {
    if (!currentEditingTag) return;
    
    const type = currentEditingTag.getAttribute('data-type');
    
    try {
        switch(type) {
            case 'score':
                currentEditingTag.setAttribute('data-name', document.getElementById('modal_name').value || '@p');
                currentEditingTag.setAttribute('data-objective', document.getElementById('modal_objective').value || 'score');
                break;
            case 'selector':
                currentEditingTag.setAttribute('data-selector', document.getElementById('modal_selector').value || '@p');
                break;
            case 'translate':
                const mode = document.getElementById('translate_mode')?.value || 'simple';
                const translateValue = document.getElementById('modal_translate')?.value;
                
                if (!translateValue) {
                    throw new Error('翻译键不能为空');
                }
                
                currentEditingTag.setAttribute('data-translate', translateValue);
                currentEditingTag.setAttribute('data-translate-mode', mode);
                
                if (mode === 'simple') {
                    // 修改这里：使用 simple_params 而不是 modal_with_simple
                    const simpleInput = document.getElementById('simple_params');
                    if (!simpleInput) {
                        console.error('找不到simple_params输入框');
                        throw new Error('参数输入框不存在');
                    }
                    const simpleValue = simpleInput.value || '';
                    currentEditingTag.setAttribute('data-with', simpleValue);
                } else {
                    const rawtextInput = document.getElementById('modal_with_rawtext');
                    const rawtextValue = rawtextInput ? rawtextInput.value : '';
                    if (rawtextValue) {
                        try {
                            JSON.parse(rawtextValue);
                            currentEditingTag.setAttribute('data-with', rawtextValue);
                        } catch (e) {
                            throw new Error('Rawtext JSON 格式无效');
                        }
                    } else {
                        currentEditingTag.setAttribute('data-with', '');
                    }
                }
                break;
        }
        
        updateTagPreview(currentEditingTag);
        closeModal();
        
    } catch (error) {
        console.error('应用更改时出错:', error);
        alert(error.message);
    }
}

function closeModal() {
    document.getElementById('functionModal').style.display = 'none';
    currentEditingTag = null;
}

// 添加光标处理函数
function isCaretInEditor() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    const range = selection.getRangeAt(0);
    const editor = document.getElementById("richTextEditor");
    return editor.contains(range.commonAncestorContainer);
}

function focusEditor() {
    const editor = document.getElementById("richTextEditor");
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// 更新教程切换功能
function toggleTutorial(button) {
    const tutorialContent = document.getElementById('tutorialContent');
    
    // 更新按钮状态
    button.classList.toggle('active');
    
    // 切换显示状态
    tutorialContent.classList.toggle('show');
    
    // 如果正在显示，添加内容动画
    if (tutorialContent.classList.contains('show')) {
        // 设置实际的max-height以确保动画正确
        const actualHeight = tutorialContent.scrollHeight;
        tutorialContent.style.maxHeight = `${actualHeight}px`;
    } else {
        tutorialContent.style.maxHeight = '0';
    }
}

// 更新全局配置对象
const AppConfig = {
    betaFeatures: {
        showBetaWatermark: false,     // 控制BETA水印显示
        noticeVersion: '10135-Test', // 测试版本号
        decodeBeta: true,           // JSON解析功能的beta标记
        buildInfo: {
            version: '0.1.6',        // 当前版本
            buildNumber: '10135',    // 构建号
            status: 'Test'           // 构建状态
        }
    }
};

// 替换为直接的功能检查
function checkBetaFeatures() {
    const betaWatermark = document.querySelector('.beta-watermark');
    const betaNotice = document.querySelector('.beta-notice');
    
    if (betaWatermark) {
        betaWatermark.style.display = AppConfig.betaFeatures.showBetaWatermark ? 'block' : 'none';
    }
    
    if (betaNotice && AppConfig.betaFeatures.showTestNotice) {
        betaNotice.style.display = 'block';
        const versionElement = betaNotice.querySelector('p:first-child');
        if (versionElement) {
            versionElement.textContent = `Build ${AppConfig.betaFeatures.buildInfo.buildNumber}-${AppConfig.betaFeatures.buildInfo.status}`;
        }
    }
}

// 自动进行功能检查
checkBetaFeatures();

// 添加切换功能的方法
function toggleBetaFeatures(feature) {
    switch(feature) {
        case 'watermark':
            AppConfig.betaFeatures.showBetaWatermark = !AppConfig.betaFeatures.showBetaWatermark;
            const watermark = document.querySelector('.beta-watermark');
            if (watermark) {
                watermark.style.display = AppConfig.betaFeatures.showBetaWatermark ? 'block' : 'none';
            }
            break;
        case 'notice':
            AppConfig.betaFeatures.showTestNotice = !AppConfig.betaFeatures.showTestNotice;
            const notice = document.querySelector('.beta-notice');
            if (notice) {
                notice.style.display = AppConfig.betaFeatures.showTestNotice ? 'block' : 'none';
            }
            break;
    }
}

// 更新深色模式切换功能
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    
    // 更新菜单项文本和图标
    const darkModeText = document.querySelector('.dark-mode-text');
    const darkModeIcon = document.querySelector('.dark-mode-icon');
    if (darkModeText) {
        darkModeText.textContent = isDarkMode ? '浅色模式' : '深色模式';
    }
    if (darkModeIcon) {
        darkModeIcon.textContent = isDarkMode ? '🌞' : '🌓';
    }
}

function initDarkMode() {
    // 检查本地存储中的深色模式设置
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        const darkModeText = document.querySelector('.dark-mode-text');
        const darkModeIcon = document.querySelector('.dark-mode-icon');
        if (darkModeText) {
            darkModeText.textContent = '浅色模式';
        }
        if (darkModeIcon) {
            darkModeIcon.textContent = '🌞';
        }
    }
}

