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
    const { translate, mode, rawtextMode, withValue } = data;
    
    if (!translate) {
        throw new Error('翻译键不能为空');
    }

    const result = {
        translate: translate
    };

    if (!withValue) return result;

    try {
        if (mode === 'simple') {
            // 使用数组存储参数
            const params = withValue.split(',')
                .map(p => p.trim())
                .filter(Boolean);
            
            // 直接设置为数组，而不是包装在parameters对象中
            result.with = params;
        } else if (mode === 'rawtext') {
            if (rawtextMode === 'advanced') {
                // 直接使用完整JSON
                result.with = JSON.parse(withValue);
            } else {
                result.with = simpleToRawtext(withValue);
            }
        }
    } catch (e) {
        throw new Error(`处理参数失败: ${e.message}`);
    }

    return result;
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

const TranslateUtils = {
    PARAM_TYPES: {
        TEXT: 'text',
        SCORE: 'score',
        SELECTOR: 'selector'
    },

    simpleToRawtext(simpleParams) {
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
    },

    rawtextToSimple(rawtextArray) {
        if (!Array.isArray(rawtextArray)) return '';
        
        return rawtextArray.map(item => {
            if (item.text) return `文本:${item.text}`;
            if (item.score) return `计分板:${item.score.name}|${item.score.objective}`;
            if (item.selector) return `选择器:${item.selector}`; // 直接使用selector值
            return '';
        }).filter(Boolean).join(',');
    },

    processTranslateData(data) {
        const { translate, mode, rawtextMode, withValue } = data;
        
        if (!translate) {
            throw new Error('翻译键不能为空');
        }
    
        const result = {
            translate: translate
        };
    
        if (!withValue) return result;
    
        try {
            if (mode === 'simple') {
                // 使用数组存储参数
                const params = withValue.split(',')
                    .map(p => p.trim())
                    .filter(Boolean);
                
                // 直接设置为数组，而不是包装在parameters对象中
                result.with = params;
            } else if (mode === 'rawtext') {
                if (rawtextMode === 'advanced') {
                    // 直接使用完整JSON
                    result.with = JSON.parse(withValue);
                } else {
                    result.with = simpleToRawtext(withValue);
                }
            }
        } catch (e) {
            throw new Error(`处理参数失败: ${e.message}`);
        }
    
        return result;
    },

    generateParamPreview(type, data) {
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
};

window.TranslateUtils = TranslateUtils;
