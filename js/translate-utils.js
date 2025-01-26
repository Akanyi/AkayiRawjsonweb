// 参数类型常量
const PARAM_TYPES = {
    TEXT: 'text',
    SCORE: 'score',
    SELECTOR: 'selector'
};

// 转换simple格式到rawtext格式
function simpleToRawtext(simpleParams) {
    if (!simpleParams) return [];
    
    return simpleParams.split(',').map(param => {
        param = param.trim();
        if (param.startsWith('计分板:')) {
            const [name, objective] = param.substring(4).split('|');
            return {
                score: {
                    name: name.trim() || '@p',
                    objective: objective.trim() || 'score'
                }
            };
        } else if (param.startsWith('选择器:')) {
            // 选择器直接使用值，不需要type包装
            return { selector: param.substring(4).trim() || '@p' };
        } else if (param.startsWith('文本:')) {
            return { text: param.substring(3).trim() };
        }
        return { text: param };
    }).filter(Boolean);
}

// 转换rawtext格式到simple格式
function rawtextToSimple(rawtextArray) {
    if (!Array.isArray(rawtextArray)) return '';
    
    return rawtextArray.map(item => {
        if (item.text) return `文本:${item.text}`;
        if (item.score) return `计分板:${item.score.name}|${item.score.objective}`;
        if (item.selector) return `选择器:${item.selector}`; // 直接使用selector值
        return '';
    }).filter(Boolean).join(',');
}

// 验证并处理translate数据
function processTranslateData(data) {
    try {
        if (!data || !data.translate) {
            throw new Error('无效的翻译数据');
        }

        const result = {
            translate: data.translate,
            with: []
        };

        if (!data.withValue) {
            return result;
        }

        // 根据模式直接调用对应的处理函数
        if (data.mode === 'simple') {
            result.with = simpleToRawtext(data.withValue);
        } else if (data.mode === 'rawtext') {
            if (data.rawtextMode === 'visual') {
                // 可视化模式：直接使用simpleToRawtext处理
                result.with = simpleToRawtext(data.withValue);
            } else {
                // 高级模式：解析JSON
                try {
                    const parsedData = JSON.parse(data.withValue);
                    result.with = Array.isArray(parsedData) ? parsedData :
                        (parsedData.rawtext || parsedData.parameters || []);
                } catch (e) {
                    console.error('JSON解析失败:', e);
                    result.with = simpleToRawtext(data.withValue);
                }
            }
        }

        // 确保所有参数都是有效的格式
        result.with = result.with.filter(item => {
            return item && (
                item.text !== undefined ||
                item.score !== undefined ||
                item.selector !== undefined ||
                item.translate !== undefined
            );
        });

        return result;
    } catch (error) {
        console.error('翻译数据处理错误:', error);
        throw error;
    }
}

// 处理简单模式参数
function processSimpleMode(value) {
    if (!value) return [];
    return simpleToRawtext(value);
}

// 处理可视化模式参数
function processVisualMode(value) {
    if (!value) return [];
    
    const params = value.split(',').filter(Boolean).map(param => {
        param = param.trim();
        if (param.startsWith('计分板:')) {
            const [name, objective] = param.substring(4).split('|');
            return {
                score: {
                    name: name.trim() || '@p',
                    objective: objective.trim() || 'score'
                }
            };
        } else if (param.startsWith('选择器:')) {
            return { selector: param.substring(4).trim() || '@p' };
        } else if (param.startsWith('文本:')) {
            return { text: param.substring(3).trim() };
        }
        return { text: param };
    });

    return params;
}

// 处理高级模式参数
function processAdvancedMode(value) {
    if (!value) return [];
    
    try {
        if (typeof value === 'string') {
            if (value.trim().startsWith('[') || value.trim().startsWith('{')) {
                const parsedData = JSON.parse(value);
                return Array.isArray(parsedData) ? parsedData :
                    (parsedData.rawtext || parsedData.parameters || []);
            }
            throw new Error('无效的JSON格式');
        }
        return Array.isArray(value) ? value : [value];
    } catch (error) {
        throw new Error('解析JSON失败: ' + error.message);
    }
}

// 生成参数预览文本
function generateParamPreview(type, data) {
    switch(type) {
        case PARAM_TYPES.TEXT:
            return data || '文本示例';
        case PARAM_TYPES.SCORE:
            const { name = '@p', objective = 'score' } = data || {};
            return `[${name}的${objective}]`;
        case PARAM_TYPES.SELECTOR:
            return `[${data || '@p'}]`;
        default:
            return '';
    }
}

// 添加预览生成函数
function generateTranslatePreview(translateKey, params) {
    if (!translateKey) return '[空翻译]';
    if (!params) return translateKey;

    try {
        let paramArray = [];
        if (typeof params === 'string') {
            // 处理简单模式的参数字符串
            paramArray = params.split(',').map(p => {
                p = p.trim();
                if (p.startsWith('计分板:')) {
                    const [name, obj] = p.substring(4).split('|');
                    return `[${name.trim()}的${obj.trim()}]`;
                }
                if (p.startsWith('选择器:')) {
                    return `[${p.substring(4).trim()}]`;
                }
                if (p.startsWith('文本:')) {
                    return p.substring(3).trim();
                }
                return p;
            });
        } else if (Array.isArray(params)) {
            // 处理数组格式的参数
            paramArray = params.map(p => {
                if (typeof p === 'string') return p;
                if (p.score) return `[${p.score.name}的${p.score.objective}]`;
                if (p.selector) return `[${p.selector}]`;
                if (p.text) return p.text;
                return JSON.stringify(p);
            });
        }

        // 替换翻译键中的占位符
        return translateKey.replace(/%%([0-9sdf])/g, (match, p1) => {
            let index = p1 === 's' || p1 === 'd' || p1 === 'f' ? 0 : parseInt(p1) - 1;
            return index < paramArray.length ? paramArray[index] : '?';
        });
    } catch (e) {
        console.error('生成预览错误:', e);
        return '[预览错误]';
    }
}

// 翻译处理工具类
const TranslateUtils = {
    processTranslateData(data) {
        try {
            if (!data || !data.translate) {
                throw new Error('无效的翻译数据');
            }

            const result = {
                translate: data.translate
            };

            if (!data.withValue) {
                return result;
            }

            switch (data.mode) {
                case 'simple':
                    return TranslateMode.simple.process(data.translate, data.withValue);
                    
                case 'rawtext':
                    if (data.rawtextMode === 'visual') {
                        // 可视化模式：不需要解析JSON，直接使用simpleToRawtext处理
                        return {
                            translate: data.translate,
                            with: simpleToRawtext(data.withValue)
                        };
                    } else {
                        return TranslateMode.rawtext.process(data.translate, data.withValue);
                    }
                    
                default:
                    throw new Error('未支持的翻译模式');
            }
        } catch (error) {
            console.error('翻译数据处理错误:', error);
            throw new Error('翻译处理错误: ' + error.message);
        }
    },

    generatePreview(data) {
        try {
            if (!data || !data.translate) return '[空翻译]';

            if (!data.withValue) return data.translate;

            switch (data.mode) {
                case 'simple':
                    return TranslateMode.simple.generatePreview(data.translate, data.withValue);
                    
                case 'rawtext':
                    if (data.rawtextMode === 'visual') {
                        // 可视化模式：使用generateTranslatePreview直接处理
                        return generateTranslatePreview(data.translate, data.withValue);
                    } else {
                        return TranslateMode.rawtext.generatePreview(data.translate, data.withValue);
                    }
                    
                default:
                    return '[未知模式]';
            }
        } catch (e) {
            console.error('生成预览错误:', e);
            return '[预览错误]';
        }
    }
};

window.TranslateUtils = TranslateUtils;
