export interface Locale {
    // Feature Toggles
    featureToggles: string;
    enableTTS: string;
    enableTTSDesc: string;
    enableTranslate: string;
    enableTranslateDesc: string;
    enableExplain: string;
    enableExplainDesc: string;
    enableSummary: string;
    enableSummaryDesc: string;
    enableWordRecognition: string;
    enableWordRecognitionDesc: string;
    
    // TTS Settings
    ttsSettings: string;
    ttsProvider: string;
    ttsProviderDesc: string;
    ttsProviderBrowser: string;
    ttsProviderAPI: string;
    ttsApiUrl: string;
    ttsApiUrlDesc: string;
    ttsApiKey: string;
    ttsApiKeyDesc: string;
    voiceParams: string;
    voiceParamsDesc: string;
    speechSpeed: string;
    speechSpeedDesc: string;
    browserVoice: string;
    browserVoiceDesc: string;
    browserPitch: string;
    browserPitchDesc: string;
    
    // AI Settings
    aiSettings: string;
    aiApiUrl: string;
    aiApiUrlDesc: string;
    aiApiKey: string;
    aiApiKeyDesc: string;
    aiModel: string;
    aiModelDesc: string;
    
    // Translation Settings
    translation: string;
    targetLanguage: string;
    targetLanguageDesc: string;
    customLanguage: string;
    translationPromptTemplate: string;
    translationPromptTemplateDesc: string;
    
    // Explanation Settings
    explanation: string;
    outputLanguage: string;
    outputLanguageDesc: string;
    explanationPromptTemplate: string;
    explanationPromptTemplateDesc: string;
    
    // Summary Settings
    summary: string;
    summaryOutputLanguage: string;
    summaryOutputLanguageDesc: string;
    summaryPromptTemplate: string;
    summaryPromptTemplateDesc: string;
    
    // Word Recognition Settings
    wordRecognition: string;
    wordRecognitionPromptTemplate: string;
    wordRecognitionPromptTemplateDesc: string;
    
    // Buttons
    read: string;
    stop: string;
    translate: string;
    aiSearch: string;
    summarize: string;
    recognize: string;
    pronounce: string;
    copy: string;
    replace: string;
    appendToNote: string;
    refresh: string;
    insertBelow: string;
    
    // Messages
    loading: string;
    translating: string;
    generating: string;
    summarizing: string;
    recognizing: string;
    phonetic: string;
    exampleSentences: string;
    noExamples: string;
    notWordOrPhrase: string;
    copied: string;
    replaced: string;
    appended: string;
    inserted: string;
    
    // Error Messages
    ttsApiFailed: string;
    aiApiFailed: string;
    audioPlaybackFailed: string;
    browserTtsFailed: string;
    browserTtsNotSupported: string;
}

export const locales: Record<string, Locale> = {
    'zh-cn': {
        // Feature Toggles
        featureToggles: '⚙️ 功能开关',
        enableTTS: '启用语音朗读',
        enableTTSDesc: '开启后，选中文本时可使用语音朗读功能',
        enableTranslate: '启用翻译',
        enableTranslateDesc: '开启后，选中文本时可使用翻译功能',
        enableExplain: '启用 AI 搜索',
        enableExplainDesc: '开启后，选中文本时可使用 AI 搜索功能',
        enableSummary: '启用总结',
        enableSummaryDesc: '开启后，选中文本时可使用总结功能',
        enableWordRecognition: '启用识词',
        enableWordRecognitionDesc: '开启后，选中单词或短语时可使用识词功能（包含发音和例句）',
        
        // TTS Settings
        ttsSettings: '🔊 语音朗读设置',
        ttsProvider: 'TTS 提供商',
        ttsProviderDesc: '选择使用浏览器内置语音或 API 服务',
        ttsProviderBrowser: '浏览器内置',
        ttsProviderAPI: 'API 服务',
        ttsApiUrl: 'TTS API URL',
        ttsApiUrlDesc: 'TTS API 端点地址（OpenAI 格式）',
        ttsApiKey: 'TTS API Key',
        ttsApiKeyDesc: '您的 TTS API 密钥（可选，如不需要可留空）',
        voiceParams: '语音参数',
        voiceParamsDesc: '自定义 GET 请求的语音参数（例如：voiceId=juan1f 或 voice=alloy&model=tts-1）',
        speechSpeed: '语速',
        speechSpeedDesc: '播放速度（0.25 到 4.0）',
        browserVoice: '浏览器语音',
        browserVoiceDesc: '选择浏览器内置语音（留空使用默认语音）',
        browserPitch: '音调',
        browserPitchDesc: '语音音调高低（0.5 到 2.0，默认 1.0）',
        
        // AI Settings
        aiSettings: '🤖 AI 设置',
        aiApiUrl: 'AI API URL',
        aiApiUrlDesc: 'AI API 端点地址（OpenAI/Ollama 格式）',
        aiApiKey: 'AI API Key',
        aiApiKeyDesc: '您的 AI API 密钥（本地模型可留空）',
        aiModel: 'AI 模型',
        aiModelDesc: '模型名称',
        
        // Translation Settings
        translation: '📝 翻译',
        targetLanguage: '目标语言',
        targetLanguageDesc: '选择或输入自定义翻译目标语言',
        customLanguage: '自定义 (Custom)...',
        translationPromptTemplate: '翻译提示词模板',
        translationPromptTemplateDesc: '使用 {{targetLanguage}} 作为占位符',
        
        // Explanation Settings
        explanation: '💡 解释',
        outputLanguage: '输出语言',
        outputLanguageDesc: '选择或输入自定义解释输出语言',
        explanationPromptTemplate: '解释提示词模板',
        explanationPromptTemplateDesc: '使用 {{outputLanguage}} 作为占位符',
        
        // Summary Settings
        summary: '📄 总结',
        summaryOutputLanguage: '输出语言',
        summaryOutputLanguageDesc: '选择或输入自定义总结输出语言',
        summaryPromptTemplate: '总结提示词模板',
        summaryPromptTemplateDesc: '使用 {{outputLanguage}} 作为占位符',
        
        // Word Recognition Settings
        wordRecognition: '📖 识词',
        wordRecognitionPromptTemplate: '识词提示词模板',
        wordRecognitionPromptTemplateDesc: '使用 {{word}} 作为占位符，返回 JSON 格式包含 phonetic 和 examples',
        
        // Buttons
        read: '朗读',
        stop: '停止',
        translate: '翻译',
        aiSearch: 'AI 搜索',
        summarize: '总结',
        recognize: '识词',
        pronounce: '发音',
        copy: '复制',
        replace: '替换',
        appendToNote: '追加到笔记',
        refresh: '刷新',
        insertBelow: '插入下一段',
        
        // Messages
        loading: '加载中...',
        translating: '正在翻译...',
        generating: '正在生成解释...',
        summarizing: '正在总结...',
        recognizing: '正在识词...',
        phonetic: '音标',
        exampleSentences: '例句',
        noExamples: '无可用例句',
        notWordOrPhrase: '⚠️ 选中的内容不符合识词规则（请选择单词、短语或成语）',
        copied: '✅ 已复制到剪贴板',
        replaced: '✅ 已替换原文',
        appended: '✅ 已追加到笔记',
        inserted: '✅ 已插入',
        
        // Error Messages
        ttsApiFailed: '❌ TTS API 调用失败，请检查配置和网络',
        aiApiFailed: '❌ AI API 调用失败，请检查配置和网络',
        audioPlaybackFailed: '❌ 音频播放失败',
        browserTtsFailed: '❌ 浏览器语音播放失败',
        browserTtsNotSupported: '❌ 浏览器不支持语音播放',
    },
    'en': {
        // Feature Toggles
        featureToggles: '⚙️ Feature toggles',
        enableTTS: 'Enable text-to-speech',
        enableTTSDesc: 'Enable text-to-speech feature when text is selected',
        enableTranslate: 'Enable translation',
        enableTranslateDesc: 'Enable translation feature when text is selected',
        enableExplain: 'Enable AI search',
        enableExplainDesc: 'Enable AI search feature when text is selected',
        enableSummary: 'Enable summary',
        enableSummaryDesc: 'Enable summary feature when text is selected',
        enableWordRecognition: 'Enable word recognition',
        enableWordRecognitionDesc: 'Enable word recognition feature when a word or phrase is selected (includes pronunciation and examples)',
        
        // TTS Settings
        ttsSettings: '🔊 Text-to-speech settings',
        ttsProvider: 'TTS provider',
        ttsProviderDesc: 'Choose between browser built-in speech or API service',
        ttsProviderBrowser: 'Browser built-in',
        ttsProviderAPI: 'API service',
        ttsApiUrl: 'TTS API URL',
        ttsApiUrlDesc: 'TTS API endpoint (OpenAI format)',
        ttsApiKey: 'TTS API key',
        ttsApiKeyDesc: 'Your TTS API key (optional, leave empty if not required)',
        voiceParams: 'Voice parameters',
        voiceParamsDesc: 'Custom voice parameters for GET request (e.g., voiceId=juan1f or voice=alloy&model=tts-1)',
        speechSpeed: 'Speech speed',
        speechSpeedDesc: 'Playback speed (0.25 to 4.0)',
        browserVoice: 'Browser voice',
        browserVoiceDesc: 'Select browser built-in voice (leave empty for default)',
        browserPitch: 'Pitch',
        browserPitchDesc: 'Voice pitch (0.5 to 2.0, default 1.0)',
        
        // AI Settings
        aiSettings: '🤖 AI settings',
        aiApiUrl: 'AI API URL',
        aiApiUrlDesc: 'AI API endpoint (OpenAI/Ollama format)',
        aiApiKey: 'AI API key',
        aiApiKeyDesc: 'Your AI API key (leave empty for local models)',
        aiModel: 'AI model',
        aiModelDesc: 'Model name',
        
        // Translation Settings
        translation: '📝 Translation',
        targetLanguage: 'Target language',
        targetLanguageDesc: 'Select or enter custom language for translation',
        customLanguage: 'Custom...',
        translationPromptTemplate: 'Translation prompt template',
        translationPromptTemplateDesc: 'Use {{targetLanguage}} as placeholder',
        
        // Explanation Settings
        explanation: '💡 Explanation',
        outputLanguage: 'Output language',
        outputLanguageDesc: 'Select or enter custom language for explanations',
        explanationPromptTemplate: 'Explanation prompt template',
        explanationPromptTemplateDesc: 'Use {{outputLanguage}} as placeholder',
        
        // Summary Settings
        summary: '📄 Summary',
        summaryOutputLanguage: 'Output language',
        summaryOutputLanguageDesc: 'Select or enter custom language for summaries',
        summaryPromptTemplate: 'Summary prompt template',
        summaryPromptTemplateDesc: 'Use {{outputLanguage}} as placeholder',
        
        // Word Recognition Settings
        wordRecognition: '📖 Word recognition',
        wordRecognitionPromptTemplate: 'Word recognition prompt template',
        wordRecognitionPromptTemplateDesc: 'Use {{word}} as placeholder, return JSON format with phonetic and examples',
        
        // Buttons
        read: 'Read',
        stop: 'Stop',
        translate: 'Translate',
        aiSearch: 'AI search',
        summarize: 'Summarize',
        recognize: 'Recognize',
        pronounce: 'Pronounce',
        copy: 'Copy',
        replace: 'Replace',
        appendToNote: 'Append to note',
        refresh: 'Refresh',
        insertBelow: 'Insert below',
        
        // Messages
        loading: 'Loading...',
        translating: 'Translating...',
        generating: 'Generating explanation...',
        summarizing: 'Summarizing...',
        recognizing: 'Recognizing word...',
        phonetic: 'Phonetic',
        exampleSentences: 'Example sentences',
        noExamples: 'No examples available',
        notWordOrPhrase: '⚠️ Selected content is not a word or phrase',
        copied: '✅ Copied to clipboard',
        replaced: '✅ Text replaced',
        appended: '✅ Appended to note',
        inserted: '✅ Inserted',
        
        // Error Messages
        ttsApiFailed: '❌ TTS API call failed, please check configuration and network',
        aiApiFailed: '❌ AI API call failed, please check configuration and network',
        audioPlaybackFailed: '❌ Audio playback failed',
        browserTtsFailed: '❌ Browser speech playback failed',
        browserTtsNotSupported: '❌ Browser does not support speech synthesis',
    }
};

// 获取当前语言
export function getCurrentLocale(): string {
    // 检测 Obsidian 的语言设置
    const lang = window.localStorage.getItem('language') || 'en';
    
    // 简化语言代码
    if (lang.startsWith('zh')) {
        return 'zh-cn';
    }
    
    return 'en';
}

// 获取翻译文本
export function t(key: keyof Locale): string {
    const locale = getCurrentLocale();
    return locales[locale]?.[key] || locales['en'][key] || key;
}
