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

    // 如果没有参数值，直接返回基本结构
    if (!withValue || withValue.trim() === '') {
        return result;
    }

    try {
        let withArray = [];
        if (mode === 'simple') {
            // 改进简单模式的参数处理
            withArray = withValue.split(',')
                .map(param => param.trim())
                .filter(Boolean)
                .map(param => ({ text: param }));
        } else if (mode === 'rawtext') {
            if (rawtextMode === 'advanced') {
                const parsedValue = JSON.parse(withValue);
                withArray = Array.isArray(parsedValue) ? parsedValue : [parsedValue];
            } else {
                withArray = simpleToRawtext(withValue);
            }
        }

        // 添加 rawtext 包装
        result.with = {
            rawtext: withArray
        };
    } catch (e) {
        console.error('处理参数失败:', e);
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
    
        if (!withValue || withValue.trim() === '') {
            return result;
        }
    
        try {
            let withArray = [];
            if (mode === 'simple') {
                withArray = withValue.split(',')
                    .map(param => param.trim())
                    .filter(Boolean)
                    .map(param => ({ text: param }));
            } else if (mode === 'rawtext') {
                if (rawtextMode === 'advanced') {
                    const parsedValue = JSON.parse(withValue);
                    withArray = Array.isArray(parsedValue) ? parsedValue : [parsedValue];
                } else {
                    withArray = simpleToRawtext(withValue);
                }
            }
    
            // 添加 rawtext 包装
            result.with = {
                rawtext: withArray
            };
        } catch (e) {
            console.error('处理参数失败:', e);
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
