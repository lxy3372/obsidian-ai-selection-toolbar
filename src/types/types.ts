export interface AISelectionToolbarSettings {
    // Feature Toggles
    enableTTS: boolean;
    enableTranslate: boolean;
    enableExplain: boolean;
    enableSummary: boolean;
    enableWordRecognition: boolean;
    // TTS Settings
    tts: {
        provider: 'api' | 'browser';
        apiUrl: string;
        apiKey: string;
        voiceParams: string;
        speed: number;
        browserVoice: string;
        browserPitch: number;
    };
    // AI Settings
    ai: {
        apiUrl: string;
        apiKey: string;
        model: string;
        translateTargetLanguage: string;
        explainOutputLanguage: string;
        summaryOutputLanguage: string;
        translatePromptTemplate: string;
        explainPromptTemplate: string;
        summaryPromptTemplate: string;
        wordRecognitionPromptTemplate: string;
    };
}

export const DEFAULT_SETTINGS: AISelectionToolbarSettings = {
    // Feature Toggles
    enableTTS: true,
    enableTranslate: true,
    enableExplain: true,
    enableSummary: true,
    enableWordRecognition: true,
    tts: {
        provider: 'browser',
        apiUrl: 'https://api.openai.com/v1/audio/speech',
        apiKey: '',
        voiceParams: 'voice=alloy',
        speed: 1.0,
        browserVoice: '',
        browserPitch: 1.0
    },
    ai: {
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: '',
        model: 'gpt-3.5-turbo',
        translateTargetLanguage: 'English',
        explainOutputLanguage: '中文',
        summaryOutputLanguage: '中文',
        translatePromptTemplate: 'You are a professional translator. Translate the following text into {{targetLanguage}}.',
        explainPromptTemplate: 'Explain the following concept or word broadly and simply in {{outputLanguage}}. Keep it concise.',
        summaryPromptTemplate: 'Please summarize the following text in {{outputLanguage}}. Keep it concise and highlight the key points.',
        wordRecognitionPromptTemplate: 'For the word/phrase "{{word}}", please provide:\n1. Phonetic transcription (IPA format for English, pinyin for Chinese)\n2. Two example sentences showing how to use this word/phrase\n\nPlease respond in JSON format:\n{\n  "phonetic": "phonetic transcription here",\n  "examples": ["example sentence 1", "example sentence 2"]\n}'
    }
};

export interface TTSResponse {
    audio: ArrayBuffer;
}

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIResponse {
    choices: Array<{
        message: {
            content: string;
        };
        delta?: {
            content?: string;
        };
    }>;
}

// 预定义的语言选项
export const LANGUAGE_OPTIONS = [
    { value: '中文', label: '中文 (Chinese)' },
    { value: 'English', label: 'English' },
    { value: '日本語', label: '日本語 (Japanese)' },
    { value: '한국어', label: '한국어 (Korean)' }
];
