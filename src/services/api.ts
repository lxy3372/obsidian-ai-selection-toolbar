import { Notice, requestUrl } from 'obsidian';
import type { AISelectionToolbarSettings, AIMessage, AIResponse } from '../types/types';
import { t } from '../utils/i18n';

export class APIHandler {
    private settings: AISelectionToolbarSettings;

    constructor(settings: AISelectionToolbarSettings) {
        this.settings = settings;
    }

    updateSettings(settings: AISelectionToolbarSettings) {
        this.settings = settings;
    }

    /**
     * 调用 TTS API 生成音频
     */
    async textToSpeech(text: string): Promise<ArrayBuffer | null> {
        // 如果使用浏览器 TTS，返回 null（不需要音频数据）
        if (this.settings.tts.provider === 'browser') {
            return null;
        }

        try {
            // 解析 API URL 中已有的参数
            const urlParts = this.settings.tts.apiUrl.split('?');
            const baseUrl = urlParts[0];
            const existingParams = new URLSearchParams(urlParts[1] || '');
            
            // 添加 text 和 speed 参数（会覆盖已有的同名参数）
            existingParams.set('text', text);
            existingParams.set('speed', this.settings.tts.speed.toString());
            
            // 添加自定义的 voice 参数（会覆盖已有的同名参数）
            if (this.settings.tts.voiceParams) {
                const customParams = new URLSearchParams(this.settings.tts.voiceParams);
                customParams.forEach((value, key) => {
                    existingParams.set(key, value);  // 使用 set 而不是 append，实现覆盖
                });
            }
            
            const url = `${baseUrl}?${existingParams.toString()}`;
            
            // 构建请求头
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };
            
            // 如果配置了 API Key，则添加 Authorization 头
            if (this.settings.tts.apiKey) {
                headers['Authorization'] = `Bearer ${this.settings.tts.apiKey}`;
            }
            
            const response = await requestUrl({
                url: url,
                method: 'GET',
                headers: headers
            });

            return response.arrayBuffer;
        } catch (error) {
            console.error('TTS API Error:', error);
            new Notice(t('ttsApiFailed'));
            throw error;
        }
    }

    /**
     * 调用 AI API 进行翻译（流式输出）
     */
    async translateStream(text: string, onChunk: (chunk: string) => void): Promise<void> {
        const template = this.settings.ai.translatePromptTemplate || 
            'You are a professional translator. Translate the following text into {{targetLanguage}}.';
        const systemPrompt = template.replace('{{targetLanguage}}', this.settings.ai.translateTargetLanguage);

        return this.callAIStream(systemPrompt, text, onChunk);
    }

    /**
     * 调用 AI API 进行解释（流式输出）
     */
    async explainStream(text: string, onChunk: (chunk: string) => void): Promise<void> {
        const template = this.settings.ai.explainPromptTemplate || 
            'Explain the following concept or word broadly and simply in {{outputLanguage}}. Keep it concise.';
        const systemPrompt = template.replace('{{outputLanguage}}', this.settings.ai.explainOutputLanguage);

        return this.callAIStream(systemPrompt, text, onChunk);
    }

    /**
     * 调用 AI API 进行总结（流式输出）
     */
    async summaryStream(text: string, onChunk: (chunk: string) => void): Promise<void> {
        const template = this.settings.ai.summaryPromptTemplate || 
            'Please summarize the following text in {{outputLanguage}}. Keep it concise and highlight the key points.';
        const systemPrompt = template.replace('{{outputLanguage}}', this.settings.ai.summaryOutputLanguage || '中文');

        return this.callAIStream(systemPrompt, text, onChunk);
    }

    /**
     * 调用 AI API 进行识词（非流式输出，返回 JSON）
     */
    async wordRecognition(word: string): Promise<{ phonetic: string; examples: string[] } | null> {
        try {
            const template = this.settings.ai.wordRecognitionPromptTemplate || 
                'For the word/phrase "{{word}}", please provide:\n1. Phonetic transcription (IPA format for English, pinyin for Chinese)\n2. Two example sentences showing how to use this word/phrase\n\nPlease respond in JSON format:\n{\n  "phonetic": "phonetic transcription here",\n  "examples": ["example sentence 1", "example sentence 2"]\n}';
            const systemPrompt = template.replace('{{word}}', word);

            const messages: AIMessage[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: word }
            ];

            const response = await fetch(this.settings.ai.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.settings.ai.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.settings.ai.model,
                    messages: messages,
                    temperature: 0.7,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const data: AIResponse = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error('No content in response');
            }

            // 尝试从响应中提取 JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const result = JSON.parse(jsonMatch[0]);
            return result;
        } catch (error) {
            console.error('Word Recognition API Error:', error);
            new Notice(t('aiApiFailed'));
            return null;
        }
    }

    /**
     * 通用 AI API 流式调用
     */
    private async callAIStream(
        systemPrompt: string,
        userMessage: string,
        onChunk: (chunk: string) => void
    ): Promise<void> {
        try {
            const messages: AIMessage[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ];

            const response = await fetch(this.settings.ai.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.settings.ai.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.settings.ai.model,
                    messages: messages,
                    temperature: 0.7,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('无法获取响应流');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === 'data: [DONE]') {
                        continue;
                    }

                    if (trimmedLine.startsWith('data: ')) {
                        try {
                            const jsonStr = trimmedLine.slice(6);
                            const data = JSON.parse(jsonStr);
                            
                            const content = data.choices?.[0]?.delta?.content;
                            if (content) {
                                onChunk(content);
                            }
                        } catch (e) {
                            console.error('解析流数据错误:', e, trimmedLine);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('AI API Stream Error:', error);
            new Notice(t('aiApiFailed'));
            throw error;
        }
    }
}

export class AudioPlayer {
    private audioContext: AudioContext | null = null;
    private currentSource: AudioBufferSourceNode | null = null;
    private isPlaying = false;

    async play(audioBuffer: ArrayBuffer): Promise<void> {
        // 停止当前播放
        this.stop();

        try {
            // 创建音频上下文
            if (!this.audioContext) {
                this.audioContext = new AudioContext();
            }

            // 解码音频数据
            const decodedBuffer = await this.audioContext.decodeAudioData(audioBuffer);

            // 创建音频源
            this.currentSource = this.audioContext.createBufferSource();
            this.currentSource.buffer = decodedBuffer;
            this.currentSource.connect(this.audioContext.destination);

            // 播放结束时重置状态
            this.currentSource.onended = () => {
                this.isPlaying = false;
                this.currentSource = null;
            };

            this.currentSource.start(0);
            this.isPlaying = true;
        } catch (error) {
            console.error('Audio playback error:', error);
            new Notice(t('audioPlaybackFailed'));
            throw error;
        }
    }

    stop(): void {
        if (this.currentSource && this.isPlaying) {
            try {
                this.currentSource.stop();
            } catch (error) {
                // 可能已经停止，忽略错误
            }
            this.currentSource = null;
            this.isPlaying = false;
        }
    }

    getIsPlaying(): boolean {
        return this.isPlaying;
    }

    dispose(): void {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

/**
 * 浏览器内置 TTS 播放器
 */
export class BrowserTTSPlayer {
    private utterance: SpeechSynthesisUtterance | null = null;
    private isPlaying = false;
    private isManuallyStopped = false;

    play(text: string, voice: string, rate: number, pitch: number): void {
        // 停止当前播放
        this.stop();

        try {
            this.isManuallyStopped = false;
            this.utterance = new SpeechSynthesisUtterance(text);
            
            // 设置语速
            this.utterance.rate = rate;
            
            // 设置音调
            this.utterance.pitch = pitch;

            // 如果指定了语音，尝试使用
            if (voice) {
                const voices = window.speechSynthesis.getVoices();
                const selectedVoice = voices.find(v => v.name === voice);
                if (selectedVoice) {
                    this.utterance.voice = selectedVoice;
                }
            }

            // 设置播放状态
            this.utterance.onstart = () => {
                this.isPlaying = true;
            };

            this.utterance.onend = () => {
                this.isPlaying = false;
                this.utterance = null;
            };

            this.utterance.onerror = (event) => {
                // 如果是主动停止触发的错误（如 canceled），则不显示错误提示
                if (!this.isManuallyStopped && event.error !== 'canceled' && event.error !== 'interrupted') {
                    console.error('Browser TTS Error:', event);
                    new Notice(t('browserTtsFailed'));
                }
                this.isPlaying = false;
                this.utterance = null;
            };

            window.speechSynthesis.speak(this.utterance);
        } catch (error) {
            console.error('Browser TTS Error:', error);
            new Notice(t('browserTtsNotSupported'));
            throw error;
        }
    }

    stop(): void {
        if (this.isPlaying || window.speechSynthesis.speaking) {
            this.isManuallyStopped = true;
            window.speechSynthesis.cancel();
            this.isPlaying = false;
            this.utterance = null;
        }
    }

    getIsPlaying(): boolean {
        return this.isPlaying || window.speechSynthesis.speaking;
    }

    dispose(): void {
        this.stop();
    }
}
