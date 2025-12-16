import { App, PluginSettingTab, Setting } from 'obsidian';
import type TextHoverAssistantPlugin from './main';
import { LANGUAGE_OPTIONS } from './types';
import { t } from './i18n';

export class TextHoverSettingTab extends PluginSettingTab {
    plugin: TextHoverAssistantPlugin;

    constructor(app: App, plugin: TextHoverAssistantPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // === Feature Toggles ===
        containerEl.createEl('h2', { text: t('featureToggles') });

        new Setting(containerEl)
            .setName(t('enableTTS'))
            .setDesc(t('enableTTSDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableTTS)
                .onChange(async (value) => {
                    this.plugin.settings.enableTTS = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('enableTranslate'))
            .setDesc(t('enableTranslateDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableTranslate)
                .onChange(async (value) => {
                    this.plugin.settings.enableTranslate = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('enableExplain'))
            .setDesc(t('enableExplainDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableExplain)
                .onChange(async (value) => {
                    this.plugin.settings.enableExplain = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('enableSummary'))
            .setDesc(t('enableSummaryDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSummary)
                .onChange(async (value) => {
                    this.plugin.settings.enableSummary = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('enableWordRecognition'))
            .setDesc(t('enableWordRecognitionDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableWordRecognition)
                .onChange(async (value) => {
                    this.plugin.settings.enableWordRecognition = value;
                    await this.plugin.saveSettings();
                }));

        // === TTS Settings ===
        containerEl.createEl('h2', { text: t('ttsSettings') });

        new Setting(containerEl)
            .setName(t('ttsProvider'))
            .setDesc(t('ttsProviderDesc'))
            .addDropdown(dropdown => dropdown
                .addOption('browser', t('ttsProviderBrowser'))
                .addOption('api', t('ttsProviderAPI'))
                .setValue(this.plugin.settings.tts.provider)
                .onChange(async (value: 'browser' | 'api') => {
                    this.plugin.settings.tts.provider = value;
                    await this.plugin.saveSettings();
                    // 刷新设置页面以显示/隐藏相应选项
                    this.display();
                }));

        // 浏览器 TTS 设置（仅在选择浏览器时显示）
        if (this.plugin.settings.tts.provider === 'browser') {
            new Setting(containerEl)
                .setName(t('browserVoice'))
                .setDesc(t('browserVoiceDesc'))
                .addDropdown(dropdown => {
                    // 添加默认选项
                    dropdown.addOption('', '默认语音 (Default)');
                    
                    // 获取可用的语音列表
                    const voices = window.speechSynthesis.getVoices();
                    voices.forEach(voice => {
                        dropdown.addOption(voice.name, `${voice.name} (${voice.lang})`);
                    });
                    
                    dropdown.setValue(this.plugin.settings.tts.browserVoice)
                        .onChange(async (value) => {
                            this.plugin.settings.tts.browserVoice = value;
                            await this.plugin.saveSettings();
                        });
                    
                    // 确保语音列表已加载
                    if (voices.length === 0) {
                        window.speechSynthesis.onvoiceschanged = () => {
                            this.display();
                        };
                    }
                    
                    return dropdown;
                });

            new Setting(containerEl)
                .setName(t('speechSpeed'))
                .setDesc(t('speechSpeedDesc'))
                .addSlider(slider => slider
                    .setLimits(0.25, 4.0, 0.25)
                    .setValue(this.plugin.settings.tts.speed)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.tts.speed = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName(t('browserPitch'))
                .setDesc(t('browserPitchDesc'))
                .addSlider(slider => slider
                    .setLimits(0.5, 2.0, 0.1)
                    .setValue(this.plugin.settings.tts.browserPitch)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.tts.browserPitch = value;
                        await this.plugin.saveSettings();
                    }));
        }

        // API TTS 设置（仅在选择 API 时显示）
        if (this.plugin.settings.tts.provider === 'api') {
            new Setting(containerEl)
                .setName(t('ttsApiUrl'))
                .setDesc(t('ttsApiUrlDesc'))
                .addText(text => {
                    text.setPlaceholder('https://api.openai.com/v1/audio/speech')
                        .setValue(this.plugin.settings.tts.apiUrl)
                        .onChange(async (value) => {
                            this.plugin.settings.tts.apiUrl = value;
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.style.width = '100%';
                });

            new Setting(containerEl)
                .setName(t('ttsApiKey'))
                .setDesc(t('ttsApiKeyDesc'))
                .addText(text => {
                    text.setPlaceholder('sk-...')
                        .setValue(this.plugin.settings.tts.apiKey)
                        .onChange(async (value) => {
                            this.plugin.settings.tts.apiKey = value;
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.type = 'password';
                });

            new Setting(containerEl)
                .setName(t('voiceParams'))
                .setDesc(t('voiceParamsDesc'))
                .addText(text => {
                    text.setPlaceholder('voiceId=juan1f')
                        .setValue(this.plugin.settings.tts.voiceParams)
                        .onChange(async (value) => {
                            this.plugin.settings.tts.voiceParams = value;
                            await this.plugin.saveSettings();
                        });
                    text.inputEl.style.width = '100%';
                });

            new Setting(containerEl)
                .setName(t('speechSpeed'))
                .setDesc(t('speechSpeedDesc'))
                .addSlider(slider => slider
                    .setLimits(0.25, 4.0, 0.25)
                    .setValue(this.plugin.settings.tts.speed)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.tts.speed = value;
                        await this.plugin.saveSettings();
                    }));
        }

        // === AI Settings ===
        containerEl.createEl('h2', { text: t('aiSettings') });

        new Setting(containerEl)
            .setName(t('aiApiUrl'))
            .setDesc(t('aiApiUrlDesc'))
            .addText(text => text
                .setPlaceholder('https://api.openai.com/v1/chat/completions')
                .setValue(this.plugin.settings.ai.apiUrl)
                .onChange(async (value) => {
                    this.plugin.settings.ai.apiUrl = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('aiApiKey'))
            .setDesc(t('aiApiKeyDesc'))
            .addText(text => {
                text.setPlaceholder('sk-...')
                    .setValue(this.plugin.settings.ai.apiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.apiKey = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.type = 'password';
            });

        new Setting(containerEl)
            .setName(t('aiModel'))
            .setDesc(t('aiModelDesc'))
            .addText(text => text
                .setPlaceholder('gpt-3.5-turbo')
                .setValue(this.plugin.settings.ai.model)
                .onChange(async (value) => {
                    this.plugin.settings.ai.model = value;
                    await this.plugin.saveSettings();
                }));

        // === Translation Settings ===
        containerEl.createEl('h3', { text: t('translation') });

        // 创建语言选择 Setting（下拉框 + 文本框组合）
        new Setting(containerEl)
            .setName(t('targetLanguage'))
            .setDesc(t('targetLanguageDesc'))
            .addDropdown(dropdown => {
                // 添加预定义选项
                LANGUAGE_OPTIONS.forEach(option => {
                    dropdown.addOption(option.value, option.label);
                });
                dropdown.addOption('custom', t('customLanguage'));
                
                // 设置当前值
                const currentValue = this.plugin.settings.ai.translateTargetLanguage;
                const isPreset = LANGUAGE_OPTIONS.some(opt => opt.value === currentValue);
                dropdown.setValue(isPreset ? currentValue : 'custom');
                
                dropdown.onChange(async (value) => {
                    if (value !== 'custom') {
                        this.plugin.settings.ai.translateTargetLanguage = value;
                        await this.plugin.saveSettings();
                        // 隐藏自定义输入框
                        customTextContainer.style.display = 'none';
                    } else {
                        // 显示自定义输入框
                        customTextContainer.style.display = 'block';
                        customInput.focus();
                    }
                });
                
                return dropdown;
            });

        // 创建自定义语言输入框容器
        const customTextContainer = containerEl.createDiv('setting-item-description');
        customTextContainer.style.marginTop = '8px';
        customTextContainer.style.marginLeft = '0';
        
        const customInput = customTextContainer.createEl('input', {
            type: 'text',
            placeholder: 'Enter custom language...',
            value: (() => {
                const currentValue = this.plugin.settings.ai.translateTargetLanguage;
                const isPreset = LANGUAGE_OPTIONS.some(opt => opt.value === currentValue);
                return isPreset ? '' : currentValue;
            })()
        });
        customInput.style.width = '100%';
        customInput.style.padding = '4px 8px';
        customInput.style.border = '1px solid var(--background-modifier-border)';
        customInput.style.borderRadius = '4px';
        customInput.style.backgroundColor = 'var(--background-primary)';
        customInput.style.color = 'var(--text-normal)';
        
        customInput.addEventListener('input', async (e) => {
            const target = e.target as HTMLInputElement;
            this.plugin.settings.ai.translateTargetLanguage = target.value;
            await this.plugin.saveSettings();
        });
        
        // 初始化时检查是否显示自定义输入框
        const currentValue = this.plugin.settings.ai.translateTargetLanguage;
        const isPreset = LANGUAGE_OPTIONS.some(opt => opt.value === currentValue);
        customTextContainer.style.display = isPreset ? 'none' : 'block';

        new Setting(containerEl)
            .setName(t('translationPromptTemplate'))
            .setDesc(t('translationPromptTemplateDesc'))
            .addTextArea(text => {
                text.setPlaceholder('You are a professional translator...')
                    .setValue(this.plugin.settings.ai.translatePromptTemplate)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.translatePromptTemplate = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 3;
            });

        // === Explanation Settings ===
        containerEl.createEl('h3', { text: t('explanation') });

        // 创建解释语言选择 Setting（下拉框 + 文本框组合）
        new Setting(containerEl)
            .setName(t('outputLanguage'))
            .setDesc(t('outputLanguageDesc'))
            .addDropdown(dropdown => {
                // 添加预定义选项
                LANGUAGE_OPTIONS.forEach(option => {
                    dropdown.addOption(option.value, option.label);
                });
                dropdown.addOption('custom', t('customLanguage'));
                
                // 设置当前值
                const currentValue = this.plugin.settings.ai.explainOutputLanguage;
                const isPreset = LANGUAGE_OPTIONS.some(opt => opt.value === currentValue);
                dropdown.setValue(isPreset ? currentValue : 'custom');
                
                dropdown.onChange(async (value) => {
                    if (value !== 'custom') {
                        this.plugin.settings.ai.explainOutputLanguage = value;
                        await this.plugin.saveSettings();
                        // 隐藏自定义输入框
                        explainCustomTextContainer.style.display = 'none';
                    } else {
                        // 显示自定义输入框
                        explainCustomTextContainer.style.display = 'block';
                        explainCustomInput.focus();
                    }
                });
                
                return dropdown;
            });

        // 创建自定义语言输入框容器
        const explainCustomTextContainer = containerEl.createDiv('setting-item-description');
        explainCustomTextContainer.style.marginTop = '8px';
        explainCustomTextContainer.style.marginLeft = '0';
        
        const explainCustomInput = explainCustomTextContainer.createEl('input', {
            type: 'text',
            placeholder: 'Enter custom language...',
            value: (() => {
                const currentValue = this.plugin.settings.ai.explainOutputLanguage;
                const isPreset = LANGUAGE_OPTIONS.some(opt => opt.value === currentValue);
                return isPreset ? '' : currentValue;
            })()
        });
        explainCustomInput.style.width = '100%';
        explainCustomInput.style.padding = '4px 8px';
        explainCustomInput.style.border = '1px solid var(--background-modifier-border)';
        explainCustomInput.style.borderRadius = '4px';
        explainCustomInput.style.backgroundColor = 'var(--background-primary)';
        explainCustomInput.style.color = 'var(--text-normal)';
        
        explainCustomInput.addEventListener('input', async (e) => {
            const target = e.target as HTMLInputElement;
            this.plugin.settings.ai.explainOutputLanguage = target.value;
            await this.plugin.saveSettings();
        });
        
        // 初始化时检查是否显示自定义输入框
        const explainCurrentValue = this.plugin.settings.ai.explainOutputLanguage;
        const explainIsPreset = LANGUAGE_OPTIONS.some(opt => opt.value === explainCurrentValue);
        explainCustomTextContainer.style.display = explainIsPreset ? 'none' : 'block';

        new Setting(containerEl)
            .setName(t('explanationPromptTemplate'))
            .setDesc(t('explanationPromptTemplateDesc'))
            .addTextArea(text => {
                text.setPlaceholder('Explain the following concept...')
                    .setValue(this.plugin.settings.ai.explainPromptTemplate)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.explainPromptTemplate = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 3;
            });

        // === Summary Settings ===
        containerEl.createEl('h3', { text: t('summary') });

        // 创建总结语言选择 Setting（下拉框 + 文本框组合）
        new Setting(containerEl)
            .setName(t('summaryOutputLanguage'))
            .setDesc(t('summaryOutputLanguageDesc'))
            .addDropdown(dropdown => {
                // 添加预定义选项
                LANGUAGE_OPTIONS.forEach(option => {
                    dropdown.addOption(option.value, option.label);
                });
                dropdown.addOption('custom', t('customLanguage'));
                
                // 设置当前值
                const currentValue = this.plugin.settings.ai.summaryOutputLanguage;
                const isPreset = LANGUAGE_OPTIONS.some(opt => opt.value === currentValue);
                dropdown.setValue(isPreset ? currentValue : 'custom');
                
                dropdown.onChange(async (value) => {
                    if (value !== 'custom') {
                        this.plugin.settings.ai.summaryOutputLanguage = value;
                        await this.plugin.saveSettings();
                        // 隐藏自定义输入框
                        summaryCustomTextContainer.style.display = 'none';
                    } else {
                        // 显示自定义输入框
                        summaryCustomTextContainer.style.display = 'block';
                        summaryCustomInput.focus();
                    }
                });
                
                return dropdown;
            });

        // 创建自定义语言输入框容器
        const summaryCustomTextContainer = containerEl.createDiv('setting-item-description');
        summaryCustomTextContainer.style.marginTop = '8px';
        summaryCustomTextContainer.style.marginLeft = '0';
        
        const summaryCustomInput = summaryCustomTextContainer.createEl('input', {
            type: 'text',
            placeholder: 'Enter custom language...',
            value: (() => {
                const currentValue = this.plugin.settings.ai.summaryOutputLanguage;
                const isPreset = LANGUAGE_OPTIONS.some(opt => opt.value === currentValue);
                return isPreset ? '' : currentValue;
            })()
        });
        summaryCustomInput.style.width = '100%';
        summaryCustomInput.style.padding = '4px 8px';
        summaryCustomInput.style.border = '1px solid var(--background-modifier-border)';
        summaryCustomInput.style.borderRadius = '4px';
        summaryCustomInput.style.backgroundColor = 'var(--background-primary)';
        summaryCustomInput.style.color = 'var(--text-normal)';
        
        summaryCustomInput.addEventListener('input', async (e) => {
            const target = e.target as HTMLInputElement;
            this.plugin.settings.ai.summaryOutputLanguage = target.value;
            await this.plugin.saveSettings();
        });
        
        // 初始化时检查是否显示自定义输入框
        const summaryCurrentValue = this.plugin.settings.ai.summaryOutputLanguage;
        const summaryIsPreset = LANGUAGE_OPTIONS.some(opt => opt.value === summaryCurrentValue);
        summaryCustomTextContainer.style.display = summaryIsPreset ? 'none' : 'block';

        new Setting(containerEl)
            .setName(t('summaryPromptTemplate'))
            .setDesc(t('summaryPromptTemplateDesc'))
            .addTextArea(text => {
                text.setPlaceholder('Please summarize the following text...')
                    .setValue(this.plugin.settings.ai.summaryPromptTemplate)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.summaryPromptTemplate = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 3;
            });

        // === Word Recognition Settings ===
        containerEl.createEl('h2', { text: t('wordRecognition') });

        new Setting(containerEl)
            .setName(t('wordRecognitionPromptTemplate'))
            .setDesc(t('wordRecognitionPromptTemplateDesc'))
            .addTextArea(text => {
                text.setPlaceholder('For the word/phrase "{{word}}", please provide...')
                    .setValue(this.plugin.settings.ai.wordRecognitionPromptTemplate)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.wordRecognitionPromptTemplate = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 6;
            });
    }
}
