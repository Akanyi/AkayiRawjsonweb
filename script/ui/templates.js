// script/ui/templates.ts
// 所有模态框和提示框的 HTML 模板
import { MODAL_INPUT_CLASSES, MODAL_LABEL_CLASSES } from '../utils.js';
// ====== 简单对话框模板 ======
export function getCopyPreferencePromptTemplate() {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">选择复制格式</h2>
            <p class="mb-4 text-gray-600 dark:text-gray-400">你希望如何复制 JSON？此偏好将被记住。</p>
            <div class="space-y-2">
                <button onclick="window.App.UI.setCopyPreferenceAndCopy('formatted')" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">格式化（易读）</button>
                <button onclick="window.App.UI.setCopyPreferenceAndCopy('compressed')" class="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">压缩（单行）</button>
            </div>
            <p class="mt-4 text-xs text-gray-500 dark:text-gray-400">可在菜单 → 设置 中修改此偏好</p>
        </div>
    `;
}
export function getAutoSavePromptTemplate() {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">开启动态保存？</h2>
            <p class="mb-4 text-gray-600 dark:text-gray-400">开启后，编辑内容会自动保存到浏览器，刷新页面不会丢失。</p>
            <div class="space-y-2">
                <button onclick="window.App.UI.setAutoSavePreference(true)" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">开启</button>
                <button onclick="window.App.UI.setAutoSavePreference(false)" class="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">不用了</button>
            </div>
            <p class="mt-4 text-xs text-gray-500 dark:text-gray-400">可在菜单 → 设置 中修改</p>
        </div>
    `;
}
export function getClearAllConfirmTemplate() {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">确认清空？</h2>
            <p class="mb-4 text-gray-600 dark:text-gray-400">这将清除所有编辑内容，且无法恢复。</p>
            <div class="flex space-x-2">
                <button onclick="window.App.UI.hideCurrentModal()" class="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded">取消</button>
                <button onclick="window.App.UI.confirmClear()" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">清空</button>
            </div>
        </div>
    `;
}
// ====== 设置模态框 ======
export function getSettingsModalTemplate(currentFormat, autoSaveEnabled) {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">设置</h2>
                <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" aria-label="Close modal">&times;</button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="${MODAL_LABEL_CLASSES}">复制 JSON 格式</label>
                    <select id="settings-copy-format" class="${MODAL_INPUT_CLASSES}">
                        <option value="formatted" ${currentFormat === 'formatted' ? 'selected' : ''}>格式化（易读）</option>
                        <option value="compressed" ${currentFormat === 'compressed' ? 'selected' : ''}>压缩（单行）</option>
                    </select>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">选择复制 JSON 时的默认格式</p>
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <label class="${MODAL_LABEL_CLASSES}">动态保存</label>
                        <p class="text-xs text-gray-500 dark:text-gray-400">自动保存编辑内容，避免刷新后丢失</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="settings-auto-save" class="sr-only peer" ${autoSaveEnabled ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
            <div class="mt-6 flex justify-end space-x-2">
                <button onclick="window.App.UI.hideCurrentModal()" class="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded">取消</button>
                <button onclick="window.App.UI.saveSettings()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">保存</button>
            </div>
        </div>
    `;
}
export function getSimulatorModalTemplate(settings) {
    return `
        <div class="modal-content bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-white">模拟器</h2>
                <button class="close-modal-btn text-gray-400 hover:text-white text-2xl" aria-label="Close modal">&times;</button>
            </div>
            
            <!-- 预览区 -->
            <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-400 mb-2">预览</h3>
                <div id="simulator-preview" class="mc-preview min-h-[80px] whitespace-pre-wrap break-words border border-gray-700 rounded"></div>
            </div>

            <!-- Mock 设置 -->
            <div class="space-y-4">
                <h3 class="text-sm font-medium text-gray-400">选择器 Mock</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">@p 显示为</label>
                        <input type="text" id="mock-p" value="${settings.selectorNames['@p']}" class="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm" oninput="window.App.UI.updateSimulatorPreview()">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">@r 显示为</label>
                        <input type="text" id="mock-r" value="${settings.selectorNames['@r']}" class="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm" oninput="window.App.UI.updateSimulatorPreview()">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">@a 显示为</label>
                        <input type="text" id="mock-a" value="${settings.selectorNames['@a']}" class="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm" oninput="window.App.UI.updateSimulatorPreview()">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">@s 显示为</label>
                        <input type="text" id="mock-s" value="${settings.selectorNames['@s']}" class="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm" oninput="window.App.UI.updateSimulatorPreview()">
                    </div>
                </div>

                <h3 class="text-sm font-medium text-gray-400 mt-4">其他 Mock</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">计分板显示为</label>
                        <input type="text" id="mock-score" value="${settings.scoreMockValue}" class="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm" oninput="window.App.UI.updateSimulatorPreview()">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">翻译显示为</label>
                        <input type="text" id="mock-translate" value="${settings.translateMockValue}" class="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm" oninput="window.App.UI.updateSimulatorPreview()">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-xs text-gray-500 mb-1">条件块显示为</label>
                        <input type="text" id="mock-condition" value="${settings.conditionMockValue}" class="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm" oninput="window.App.UI.updateSimulatorPreview()">
                    </div>
                </div>
            </div>

            <div class="mt-6 flex justify-end space-x-2">
                <button onclick="window.App.UI.saveMockSettings()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">保存设置</button>
            </div>
        </div>
    `;
}
// ====== 关于和解析模态框 ======
export function getAboutModalTemplate(changelogHtml) {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-gray-800 dark:text-gray-200 max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">关于</h2>
                <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" aria-label="Close modal">&times;</button>
            </div>
            <p class="mb-4">这是一款用于 Minecraft 基岩版 RawJSON 文本生成的工具，由 Akanyi 创建。</p>
            <a href="https://github.com/Akanyi/AkayiRawjsonweb" target="_blank" class="text-blue-500 dark:text-blue-400 hover:underline">访问 GitHub 仓库</a>
            <a href="https://github.com/Akanyi/AkayiRawjsonweb/blob/master/LICENSE" target="_blank" class="text-blue-500 dark:text-blue-400 hover:underline">查看许可证</a>
            <p class="mt-4">鸣谢：MCBEID/ProjectXero</p>
            <div class="mt-6">
                <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">更新日志</h3>
                <ul class="list-disc list-inside text-sm space-y-1 font-mono">
                    ${changelogHtml}
                </ul>
            </div>
        </div>
    `;
}
export function getDecodeModalTemplate() {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">解析 JSON</h2>
                <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" aria-label="Close modal">&times;</button>
            </div>
            <textarea id="json-input-area" class="w-full h-40 p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" placeholder="在此粘贴你的 RawJSON..."></textarea>
            <button onclick="window.App.UI.handleDecodeJson()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">解析</button>
        </div>
    `;
}
// ====== 编辑模态框 ======
export function getScoreEditTemplate(name, objective) {
    return `
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">编辑计分板</h2>
        <div class="space-y-4">
            <div>
                <label class="${MODAL_LABEL_CLASSES}">计分对象</label>
                <div class="flex">
                    <input id="score-name" type="text" value="${name}" class="${MODAL_INPUT_CLASSES} flex-grow" placeholder="@p, 玩家名...">
                    <button type="button" aria-label="Open selector editor" onclick="window.App.UI.showSelectorEditorForScoreName('score-name')" class="ml-2 p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-10 w-10 flex items-center justify-center">?</button>
                </div>
            </div>
            <div>
                <label class="${MODAL_LABEL_CLASSES}">计分项</label>
                <input id="score-objective" type="text" value="${objective}" class="${MODAL_INPUT_CLASSES}" placeholder="分数, 金钱...">
            </div>
        </div>
    `;
}
export function getTranslateEditTemplate(translate, withValue) {
    return `
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">编辑翻译</h2>
        <div class="space-y-4">
            <div>
                <label class="${MODAL_LABEL_CLASSES}">翻译键</label>
                <input id="translate-key" type="text" value="${translate}" class="${MODAL_INPUT_CLASSES}" placeholder="welcome.message.1">
            </div>
            <div>
                <label class="${MODAL_LABEL_CLASSES}">参数 (JSON 数组格式)</label>
                <textarea id="translate-with" class="w-full h-24 ${MODAL_INPUT_CLASSES}" placeholder='[{"text":"玩家"}]'>${withValue}</textarea>
            </div>
        </div>
    `;
}
export function wrapEditModalContent(innerContent) {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center">
                <div></div>
                <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" aria-label="Close modal">&times;</button>
            </div>
            ${innerContent}
            <div class="mt-6 flex justify-end space-x-2">
                <button onclick="window.App.UI.hideCurrentModal()" class="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded">取消</button>
                <button onclick="window.App.RichTextEditor.applyEdit()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">保存</button>
            </div>
        </div>
    `;
}
// ====== 帮助模态框 ======
export function getRotationHelpTemplate() {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto text-gray-800 dark:text-gray-200">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">旋转角度帮助</h2>
                <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" aria-label="Close modal">&times;</button>
            </div>
            <div class="space-y-4">
                <p>黄色空心箭头Zlocal代表当前实体朝向；如图绿色区域为rxm=-90,rx=90时（x_rotation=-90..90）所表示的角度范围。由于实体朝向处在绿色角度范围内，故可选中该实体；</p>
                <img src="static/The_x_rotation_rxm_rx_Of_Entity_Selector.png" alt="rx/rxm explanation" class="w-full h-auto rounded-md">
                <p>黄色空心箭头Zlocal代表当前实体朝向，Z'代表实体朝向在XZ平面上的投影；绿色区域为rym=-45,ry=45时（y_rotation=-45..45）所表示的角度范围。由于Z'投影处在绿色角度范围内，故该实体可被选中</p>
                <img src="static/The_y_rotation_rym_ry_Of_Entity_Selector.png" alt="ry/rym explanation" class="w-full h-auto rounded-md">
            </div>
        </div>
    `;
}
export function getDimensionHelpTemplate() {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto text-gray-800 dark:text-gray-200">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">维度选择帮助</h2>
                <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" aria-label="Close modal">&times;</button>
            </div>
            <div class="space-y-4">
                <p>绿色方块即dx dy dz所形成的检测区域，蓝色方块表示某实体的判定箱，紫色区域即它们的相交部分；</p>
                <img src="static/The_dx_dy_dz_Of_Entity_Selector.png" alt="dx/dy/dz explanation" class="w-full h-auto rounded-md">
            </div>
        </div>
    `;
}
export function getFamilyTypesDocTemplate(familyTypesHtml) {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto text-gray-800 dark:text-gray-200">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">可用族类型</h2>
                <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" aria-label="Close modal">&times;</button>
            </div>
            <input type="text" id="family-search-input" class="${MODAL_INPUT_CLASSES} mb-4" placeholder="搜索族类型..." oninput="window.App.UI.filterFamilyTypes(this.value)">
            <div id="family-types-list" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${familyTypesHtml}
            </div>
            <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
                这些是 Minecraft 基岩版中可用于选择器的 'family' 参数的族类型。点击可快速填入。
            </div>
        </div>
    `;
}
// ====== 搜索模态框 ======
export function getItemSearchModalTemplate(itemsHtml) {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto text-gray-800 dark:text-gray-200">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">物品查询</h2>
                <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" aria-label="Close modal">&times;</button>
            </div>
            <input type="text" id="item-search-input" class="${MODAL_INPUT_CLASSES} mb-4" placeholder="搜索物品ID或名称..." oninput="window.App.UI.filterItems(this.value)">
            <div id="item-list-container" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${itemsHtml}
            </div>
            <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
                点击物品可快速填入。
            </div>
        </div>
    `;
}
export function getLocationSearchModalTemplate(slotsHtml) {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto text-gray-800 dark:text-gray-200">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">槽位查询</h2>
                <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" aria-label="Close modal">&times;</button>
            </div>
            <input type="text" id="location-search-input" class="${MODAL_INPUT_CLASSES} mb-4" placeholder="搜索槽位ID或名称..." oninput="window.App.UI.filterLocations(this.value)">
            <div id="location-list-container" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${slotsHtml}
            </div>
            <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
                点击槽位可快速填入。
            </div>
        </div>
    `;
}
// ====== 编辑器模态框 ======
export function getHasitemConditionItemTemplate(index, condition) {
    return `
        <div class="hasitem-condition-item border border-gray-300 dark:border-gray-600 p-4 rounded-md mb-4" data-index="${index}">
            <div class="flex justify-end">
                <button type="button" aria-label="Remove condition" onclick="window.App.UI.removeHasitemCondition(${index})" class="text-red-500 hover:text-red-700 text-xl">&times;</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="${MODAL_LABEL_CLASSES}">物品ID (item)</label>
                    <div class="flex">
                        <input id="hasitem-item-${index}" type="text" value="${condition.item || ''}" class="${MODAL_INPUT_CLASSES} flex-grow" placeholder="minecraft:apple">
                        <button type="button" aria-label="Search items" onclick="window.App.UI.showItemSearchModal(${index})" class="ml-2 p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-10 w-10 flex items-center justify-center">?</button>
                    </div>
                </div>
                <div>
                    <label class="${MODAL_LABEL_CLASSES}">数据值 (data)</label>
                    <input id="hasitem-data-${index}" type="number" value="${condition.data || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="0-32767">
                </div>
                <div>
                    <label class="${MODAL_LABEL_CLASSES}">数量 (quantity)</label>
                    <input id="hasitem-quantity-${index}" type="text" value="${condition.quantity || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="1.., 1-10, !0">
                </div>
                <div>
                    <label class="${MODAL_LABEL_CLASSES}">物品栏 (location)</label>
                    <div class="flex">
                        <input id="hasitem-location-${index}" type="text" value="${condition.location || ''}" class="${MODAL_INPUT_CLASSES} flex-grow" placeholder="slot.hotbar">
                        <button type="button" aria-label="Search slots" onclick="window.App.UI.showLocationSearchModal(${index})" class="ml-2 p-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white rounded h-10 w-10 flex items-center justify-center">?</button>
                    </div>
                </div>
                <div>
                    <label class="${MODAL_LABEL_CLASSES}">槽位 (slot)</label>
                    <input id="hasitem-slot-${index}" type="text" value="${condition.slot || ''}" class="${MODAL_INPUT_CLASSES}" placeholder="0..8">
                </div>
            </div>
        </div>
    `;
}
export function getHasitemEditorModalTemplate(conditionsHtml) {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">hasitem 可视化编辑器</h2>
                <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" aria-label="Close modal">&times;</button>
            </div>

            <div id="hasitem-conditions-container" class="space-y-4">
                ${conditionsHtml}
            </div>

            <button type="button" onclick="window.App.UI.addHasitemCondition()" class="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">添加条件</button>

            <div class="mt-6 flex justify-end space-x-2">
                <button onclick="window.App.UI.hideCurrentModal()" class="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded">取消</button>
                <button onclick="window.App.UI.applyHasitemEditorChanges()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">保存</button>
            </div>
        </div>
    `;
}
export function getScoreConditionItemTemplate(index, objective, value) {
    return `
        <div class="score-condition-item border border-gray-300 dark:border-gray-600 p-4 rounded-md mb-4" data-index="${index}">
            <div class="flex justify-end">
                <button type="button" aria-label="Remove condition" onclick="window.App.UI.removeScoreCondition(${index})" class="text-red-500 hover:text-red-700 text-xl">&times;</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="${MODAL_LABEL_CLASSES}">计分项 (objective)</label>
                    <input id="score-objective-${index}" type="text" value="${objective}" class="${MODAL_INPUT_CLASSES}" placeholder="money, kills...">
                </div>
                <div>
                    <label class="${MODAL_LABEL_CLASSES}">分数 (value)</label>
                    <input id="score-value-${index}" type="text" value="${value}" class="${MODAL_INPUT_CLASSES}" placeholder="10, 5.., ..15, 10..12, !10">
                </div>
            </div>
        </div>
    `;
}
export function getScoreEditorModalTemplate(conditionsHtml) {
    return `
        <div class="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">计分板可视化编辑器</h2>
                <button class="close-modal-btn text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" aria-label="Close modal">&times;</button>
            </div>

            <div id="score-conditions-container" class="space-y-4">
                ${conditionsHtml}
            </div>

            <button type="button" onclick="window.App.UI.addScoreCondition()" class="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">添加条件</button>

            <div class="mt-6 flex justify-end space-x-2">
                <button onclick="window.App.UI.hideCurrentModal()" class="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white font-bold py-2 px-4 rounded">取消</button>
                <button onclick="window.App.UI.applyScoreEditorChanges()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">保存</button>
            </div>
        </div>
    `;
}
