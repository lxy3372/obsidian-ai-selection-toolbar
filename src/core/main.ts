import { Plugin, MarkdownView, Notice } from 'obsidian';
import { ViewPlugin, ViewUpdate, EditorView } from '@codemirror/view';
import type { AISelectionToolbarSettings, WordRecognitionResponse } from '../types/types';
import { DEFAULT_SETTINGS } from '../types/types';
import { AISelectionToolbarSettingTab } from '../ui/settings';
import { APIHandler, AudioPlayer, BrowserTTSPlayer } from '../services/api';
import { t } from '../utils/i18n';

export default class AISelectionToolbarPlugin extends Plugin {
    settings: AISelectionToolbarSettings;
    private apiHandler: APIHandler;
    private audioPlayer: AudioPlayer;
    private browserTTSPlayer: BrowserTTSPlayer;
    private hoverMenu: HTMLElement | null = null;
    private resultPanel: HTMLElement | null = null;
    private debounceTimer: number | null = null;
    private isDragging = false;
    private dragOffset = { x: 0, y: 0 };
    private currentTTSButton: HTMLElement | null = null;
    private isLoadingTTS = false;

    async onload() {
        await this.loadSettings();

        // 初始化 API 处理器和音频播放器
        this.apiHandler = new APIHandler(this.settings);
        this.audioPlayer = new AudioPlayer();
        this.browserTTSPlayer = new BrowserTTSPlayer();

        // 添加设置页面
        this.addSettingTab(new AISelectionToolbarSettingTab(this.app, this));

        // 注册 CodeMirror 扩展
        this.registerEditorExtension(this.createSelectionExtension());

        // 注册清理事件
        this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
            // 点击菜单外部时关闭
            if (this.hoverMenu && !this.hoverMenu.contains(evt.target as Node)) {
                this.hideHoverMenu();
            }
        });
    }

    onunload() {
        this.hideHoverMenu();
        this.audioPlayer.dispose();
        this.browserTTSPlayer.dispose();
    }

    async loadSettings() {
        const loadedData = await this.loadData() as Partial<AISelectionToolbarSettings> | null;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData ?? {});
        
        // 确保嵌套对象也被合并（兼容旧版本数据）
        if (loadedData?.ai) {
            this.settings.ai = Object.assign({}, DEFAULT_SETTINGS.ai, loadedData.ai);
        }
        if (loadedData?.tts) {
            this.settings.tts = Object.assign({}, DEFAULT_SETTINGS.tts, loadedData.tts);
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.apiHandler?.updateSettings(this.settings);
    }

    /**
     * 创建 CodeMirror 选择扩展
     */
    private createSelectionExtension() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const plugin = this;

        return ViewPlugin.fromClass(
            class {
                constructor(public view: EditorView) {}

                update(update: ViewUpdate) {
                    // 检查选区是否改变
                    if (!update.selectionSet) {
                        return;
                    }

                    const selection = update.state.selection.main;
                    const selectedText = update.state.sliceDoc(selection.from, selection.to);

                    // 清除之前的定时器
                    if (plugin.debounceTimer) {
                        window.clearTimeout(plugin.debounceTimer);
                    }

                    // 如果没有选中文本，隐藏菜单
                    if (!selectedText.trim()) {
                        plugin.hideHoverMenu();
                        return;
                    }

                    // 防抖：300ms 后显示菜单
                    plugin.debounceTimer = window.setTimeout(() => {
                        plugin.showHoverMenu(selectedText, selection.from, selection.to, update.view);
                    }, 300);
                }

                destroy() {
                    plugin.hideHoverMenu();
                }
            }
        );
    }

    /**
     * 显示悬浮菜单
     */
    private showHoverMenu(selectedText: string, from: number, to: number, view: EditorView) {
        // 检查是否所有功能都已关闭
        if (!this.settings.enableTTS && !this.settings.enableTranslate && !this.settings.enableExplain && !this.settings.enableSummary && !this.settings.enableWordRecognition) {
            return; // 如果所有功能都关闭，不显示悬浮菜单
        }

        // 隐藏旧菜单
        this.hideHoverMenu();

        // 获取选区的坐标
        const startCoords = view.coordsAtPos(from);
        const endCoords = view.coordsAtPos(to);

        if (!startCoords || !endCoords) {
            return;
        }

        // 创建菜单容器
        this.hoverMenu = document.body.createDiv('text-hover-menu');

        // 创建按钮容器
        const buttonContainer = this.hoverMenu.createDiv('text-hover-buttons');

        // 创建拖动手柄（放在按钮容器最前面）
        const dragHandle = buttonContainer.createDiv('text-hover-drag-handle');
        this.setSvgContent(dragHandle, '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/></svg>');
        
        // 添加拖动功能
        this.setupDragHandling(dragHandle);

        // 朗读按钮（仅在启用时显示）
        if (this.settings.enableTTS) {
            const ttsButton = this.createButtonWithLabel(buttonContainer, 'volume-2', t('read'), async () => {
                await this.handleTTS(selectedText, ttsButton);
            });
        }

        // 翻译按钮（仅在启用时显示）
        if (this.settings.enableTranslate) {
            const translateButton = this.createButtonWithLabel(buttonContainer, 'languages', t('translate'), async () => {
                await this.handleTranslate(selectedText, translateButton);
            });
        }

        // AI 搜索按钮（仅在启用时显示）
        if (this.settings.enableExplain) {
            const explainButton = this.createButtonWithLabel(buttonContainer, 'search', t('aiSearch'), async () => {
                await this.handleExplain(selectedText, explainButton);
            });
        }

        // 总结按钮（仅在启用时显示）
        if (this.settings.enableSummary) {
            const summaryButton = this.createButtonWithLabel(buttonContainer, 'file-text', t('summarize'), async () => {
                await this.handleSummary(selectedText, summaryButton);
            });
        }

        // 识词按钮（仅在启用时显示）
        if (this.settings.enableWordRecognition) {
            const recognizeButton = this.createButtonWithLabel(buttonContainer, 'book-open', t('recognize'), async () => {
                await this.handleWordRecognition(selectedText, recognizeButton);
            });
        }

        // 添加到文档（需要先添加才能获取宽度）
        document.body.appendChild(this.hoverMenu);

        // 获取菜单的实际宽度
        const menuWidth = this.hoverMenu.offsetWidth;
        const viewportWidth = window.innerWidth;

        // 计算菜单位置（显示在选区上方）
        const menuTop = startCoords.top - 50;
        let menuLeft = (startCoords.left + endCoords.right) / 2;

        // 检查是否会超出右侧边界
        const menuHalfWidth = menuWidth / 2;
        const rightEdge = menuLeft + menuHalfWidth;
        
        if (rightEdge > viewportWidth - 10) {
            // 超出右侧，调整位置：向左移动超出的距离
            menuLeft = viewportWidth - menuHalfWidth - 10;
        }

        // 检查是否会超出左侧边界
        const leftEdge = menuLeft - menuHalfWidth;
        if (leftEdge < 10) {
            // 超出左侧，调整位置：向右移动
            menuLeft = menuHalfWidth + 10;
        }

        // 设置位置 - 使用CSS类代替部分内联样式
        this.hoverMenu.addClass('positioned');
        this.hoverMenu.style.top = `${menuTop}px`;
        this.hoverMenu.style.left = `${menuLeft}px`;
    }

    /**
     * 设置拖动处理
     */
    private setupDragHandling(dragHandle: HTMLElement) {
        dragHandle.addEventListener('mousedown', (e: MouseEvent) => {
            if (!this.hoverMenu) return;
            
            this.isDragging = true;
            const rect = this.hoverMenu.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;
            
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (!this.isDragging || !this.hoverMenu) return;
            
            const x = e.clientX - this.dragOffset.x;
            const y = e.clientY - this.dragOffset.y;
            
            this.hoverMenu.style.left = `${x}px`;
            this.hoverMenu.style.top = `${y}px`;
            this.hoverMenu.removeClass('positioned');
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }

    /**
     * 隐藏悬浮菜单
     */
    private hideHoverMenu() {
        if (this.hoverMenu) {
            this.hoverMenu.remove();
            this.hoverMenu = null;
        }
        if (this.resultPanel) {
            this.resultPanel.remove();
            this.resultPanel = null;
        }
    }

    /**
     * 创建带标签的按钮
     */
    private createButtonWithLabel(
        container: HTMLElement,
        icon: string,
        label: string,
        onClick: () => void
    ): HTMLElement {
        const buttonWrapper = container.createDiv('text-hover-button-wrapper');
        const button = buttonWrapper.createDiv('text-hover-button');
        button.setAttribute('aria-label', label);

        // 使用 Lucide 图标
        const iconEl = button.createSpan('text-hover-icon');
        this.setSvgContent(iconEl, this.getLucideIcon(icon));

        // 添加文字标签
        const labelEl = button.createSpan('text-hover-label');
        labelEl.setText(label);

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
        });

        return button;
    }

    /**
     * 创建按钮（用于操作按钮）
     */
    private createButton(
        container: HTMLElement,
        icon: string,
        tooltip: string,
        onClick: () => void
    ): HTMLElement {
        const button = container.createDiv('text-hover-button');
        button.setAttribute('aria-label', tooltip);

        // 使用 Lucide 图标
        const iconEl = button.createSpan();
        this.setSvgContent(iconEl, this.getLucideIcon(icon));

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
        });

        return button;
    }

    /**
     * 处理 TTS
     */
    private async handleTTS(text: string, button: HTMLElement) {
        const iconEl = button.querySelector('.text-hover-icon') as HTMLElement;
        const labelEl = button.querySelector('.text-hover-label') as HTMLElement;
        
        // 使用浏览器 TTS
        if (this.settings.tts.provider === 'browser') {
            // 如果正在播放，则停止
            if (this.browserTTSPlayer.getIsPlaying()) {
                this.browserTTSPlayer.stop();
                button.removeClass('playing');
                
                // 恢复原始图标和文字
                if (iconEl) {
                    this.setSvgContent(iconEl, this.getLucideIcon('volume-2'));
                }
                if (labelEl) {
                    labelEl.setText(t('read'));
                }
                
                return;
            }

            try {
                button.addClass('playing');
                
                // 改为停止图标和文字
                if (iconEl) {
                    this.setSvgContent(iconEl, this.getLucideIcon('square'));
                }
                if (labelEl) {
                    labelEl.setText(t('stop'));
                }

                this.browserTTSPlayer.play(
                    text,
                    this.settings.tts.browserVoice,
                    this.settings.tts.speed,
                    this.settings.tts.browserPitch
                );

                // 等待播放完成（使用定时器检查）
                const checkPlaying = setInterval(() => {
                    if (!this.browserTTSPlayer.getIsPlaying()) {
                        clearInterval(checkPlaying);
                        button.removeClass('playing');
                        if (iconEl) {
                            this.setSvgContent(iconEl, this.getLucideIcon('volume-2'));
                        }
                        if (labelEl) {
                            labelEl.setText(t('read'));
                        }
                    }
                }, 100);
            } catch (error) {
                button.removeClass('playing');
                
                // 恢复原始图标和文字
                if (iconEl) {
                    this.setSvgContent(iconEl, this.getLucideIcon('volume-2'));
                }
                if (labelEl) {
                    labelEl.setText(t('read'));
                }
                
                console.error('Browser TTS Error:', error);
            }
            
            return;
        }

        // 使用 API TTS
        // 如果正在播放或加载，则停止
        if (this.audioPlayer.getIsPlaying() || this.isLoadingTTS) {
            this.audioPlayer.stop();
            this.isLoadingTTS = false;
            button.removeClass('playing');
            button.removeClass('loading');
            
            // 恢复原始图标和文字
            if (iconEl) {
                this.setSvgContent(iconEl, this.getLucideIcon('volume-2'));
            }
            if (labelEl) {
                labelEl.setText(t('read'));
            }
            
            return;
        }

        try {
            this.isLoadingTTS = true;
            this.currentTTSButton = button;
            button.addClass('loading');
            
            // 改为停止图标和文字
            if (iconEl) {
                this.setSvgContent(iconEl, this.getLucideIcon('square'));
            }
            if (labelEl) {
                labelEl.setText(t('stop'));
            }

            const audioBuffer = await this.apiHandler.textToSpeech(text);
            
            // 检查是否在加载过程中被取消
            if (!this.isLoadingTTS || !audioBuffer) {
                return;
            }

            this.isLoadingTTS = false;
            button.removeClass('loading');
            button.addClass('playing');
            
            // 播放时保持停止按钮
            // 图标和文字已经在上面设置为停止状态

            await this.audioPlayer.play(audioBuffer);

            // 播放完成，恢复原始状态
            button.removeClass('playing');
            if (iconEl) {
                this.setSvgContent(iconEl, this.getLucideIcon('volume-2'));
            }
            if (labelEl) {
                labelEl.setText(t('read'));
            }
        } catch (error) {
            this.isLoadingTTS = false;
            button.removeClass('loading');
            button.removeClass('playing');
            
            // 恢复原始图标和文字
            if (iconEl) {
                this.setSvgContent(iconEl, this.getLucideIcon('volume-2'));
            }
            if (labelEl) {
                labelEl.setText(t('read'));
            }
            
            console.error('TTS Error:', error);
        }
    }

    /**
     * 处理翻译（流式输出）
     */
    private async handleTranslate(text: string, button: HTMLElement) {
        try {
            // 添加激活状态
            button.addClass('active');
            
            this.showResultPanel('loading', t('translating'));
            
            // 准备流式输出
            let fullContent = '';
            this.showResultPanel('translate', '', text);
            
            await this.apiHandler.translateStream(text, (chunk: string) => {
                fullContent += chunk;
                this.updateResultContent(fullContent);
            });
            
            // 流式输出完成后，显示完整结果
            this.showResultPanel('translate', fullContent, text);
            
            // 移除激活状态
            button.removeClass('active');
        } catch (error) {
            button.removeClass('active');
            this.hideResultPanel();
            console.error('Translation Error:', error);
        }
    }

    /**
     * 处理解释（流式输出）
     */
    private async handleExplain(text: string, button: HTMLElement) {
        try {
            // 添加激活状态
            button.addClass('active');
            
            this.showResultPanel('loading', t('generating'));
            
            // 准备流式输出
            let fullContent = '';
            this.showResultPanel('explain', '', text);
            
            await this.apiHandler.explainStream(text, (chunk: string) => {
                fullContent += chunk;
                this.updateResultContent(fullContent);
            });
            
            // 流式输出完成后，显示完整结果
            this.showResultPanel('explain', fullContent, text);
            
            // 移除激活状态
            button.removeClass('active');
        } catch (error) {
            button.removeClass('active');
            this.hideResultPanel();
            console.error('Explanation Error:', error);
        }
    }

    /**
     * 处理总结（流式输出）
     */
    private async handleSummary(text: string, button: HTMLElement) {
        try {
            // 添加激活状态
            button.addClass('active');
            
            this.showResultPanel('loading', t('summarizing'));
            
            // 准备流式输出
            let fullContent = '';
            this.showResultPanel('summary', '', text);
            
            await this.apiHandler.summaryStream(text, (chunk: string) => {
                fullContent += chunk;
                this.updateResultContent(fullContent);
            });
            
            // 流式输出完成后，显示完整结果
            this.showResultPanel('summary', fullContent, text);
            
            // 移除激活状态
            button.removeClass('active');
        } catch (error) {
            button.removeClass('active');
            this.hideResultPanel();
            console.error('Summary Error:', error);
        }
    }

    /**
     * 判断选中文本是否为词或短语
     */
    private isWordOrPhrase(text: string): boolean {
        const trimmed = text.trim();
        
        // 检测是否包含中文字符
        const hasChinese = /[\u4e00-\u9fa5]/.test(trimmed);
        
        if (hasChinese) {
            // 中文判断：只允许词语或成语（一般不超过10个字）
            // 排除包含标点符号的句子
            if (trimmed.length > 10 || /[，。！？；：、""''（）《》【】]/.test(trimmed)) {
                return false;
            }
            return true;
        } else {
            // 英文判断：只允许单个单词或短语（不超过5个单词）
            // 排除包含句子标点的文本
            if (/[.!?;]/.test(trimmed)) {
                return false;
            }
            const wordCount = trimmed.split(/\s+/).length;
            return wordCount <= 5;
        }
    }

    /**
     * 处理识词
     */
    private async handleWordRecognition(text: string, button: HTMLElement) {
        try {
            // 判断是否为词或短语
            if (!this.isWordOrPhrase(text)) {
                new Notice(t('notWordOrPhrase'));
                return;
            }

            // 添加激活状态
            button.addClass('active');
            
            this.showResultPanel('loading', t('recognizing'));
            
            const result = await this.apiHandler.wordRecognition(text);
            
            if (!result) {
                this.hideResultPanel();
                button.removeClass('active');
                return;
            }

            // 显示识词结果
            this.showResultPanel('wordRecognition', JSON.stringify(result), text);
            
            // 移除激活状态
            button.removeClass('active');
        } catch (error) {
            button.removeClass('active');
            this.hideResultPanel();
            console.error('Word Recognition Error:', error);
        }
    }

    /**
     * 更新结果内容（流式输出时使用）
     */
    private updateResultContent(content: string) {
        if (!this.resultPanel) {
            return;
        }

        const contentEl = this.resultPanel.querySelector('.text-hover-content');
        if (contentEl) {
            contentEl.textContent = content;
            // 自动滚动到底部
            contentEl.scrollTop = contentEl.scrollHeight;
        }
    }

    /**
     * 显示结果面板
     */
    private showResultPanel(type: 'loading' | 'translate' | 'explain' | 'summary' | 'wordRecognition', content: string, originalText?: string) {
        // 移除旧的结果面板
        this.hideResultPanel();

        if (!this.hoverMenu) {
            return;
        }

        // 创建结果面板
        this.resultPanel = this.hoverMenu.createDiv('text-hover-result-panel');

        if (type === 'loading') {
            this.resultPanel.createDiv('text-hover-loading').setText(content);
            return;
        }

        // 如果是识词，显示特殊格式
        if (type === 'wordRecognition') {
            try {
                const data: WordRecognitionResponse = JSON.parse(content);
                
                // 创建发音区域
                const phoneticSection = this.resultPanel.createDiv('text-hover-phonetic-section');
                
                // 发音按钮
                const pronounceBtn = phoneticSection.createDiv('text-hover-pronounce-button');
                pronounceBtn.setText('📢');
                pronounceBtn.setAttribute('aria-label', t('pronounce'));
                pronounceBtn.addEventListener('click', async () => {
                    if (!originalText) return;
                    
                    // 使用浏览器 TTS 朗读单词
                    if (this.browserTTSPlayer.getIsPlaying()) {
                        this.browserTTSPlayer.stop();
                    } else {
                        this.browserTTSPlayer.play(
                            originalText,
                            this.settings.tts.browserVoice,
                            this.settings.tts.speed,
                            this.settings.tts.browserPitch
                        );
                    }
                });
                
                // 单词和音标
                const wordPhoneticContainer = phoneticSection.createDiv('text-hover-word-phonetic-container');
                const wordText = wordPhoneticContainer.createDiv('text-hover-word-text');
                wordText.setText(originalText || '');
                const phoneticText = wordPhoneticContainer.createDiv('text-hover-phonetic-text');
                phoneticText.setText(`(${data.phonetic || 'N/A'})`);
                
                // 例句区域
                const examplesSection = this.resultPanel.createDiv('text-hover-examples-section');
                const examplesTitle = examplesSection.createDiv('text-hover-examples-title');
                examplesTitle.setText(t('exampleSentences'));
                
                if (data.examples && data.examples.length > 0) {
                    data.examples.forEach((example: string, index: number) => {
                        const exampleItem = examplesSection.createDiv('text-hover-example-item');
                        exampleItem.setText(`${index + 1}. ${example}`);
                    });
                } else {
                    const noExamples = examplesSection.createDiv('text-hover-example-item');
                    noExamples.setText('No examples available');
                }
            } catch (error) {
                console.error('Failed to parse word recognition result:', error);
                this.resultPanel.createDiv('text-hover-content').setText(content);
            }
            return;
        }

        // 创建内容区域
        const contentEl = this.resultPanel.createDiv('text-hover-content');
        contentEl.setText(content);

        // 创建操作按钮区域
        const actionsEl = this.resultPanel.createDiv('text-hover-actions');

        // 如果是总结，显示特殊的按钮组
        if (type === 'summary') {
            // 刷新按钮
            this.createButton(actionsEl, 'refresh-cw', t('refresh'), async () => {
                if (originalText) {
                    // 重新生成总结
                    this.showResultPanel('loading', t('summarizing'));
                    let fullContent = '';
                    this.showResultPanel('summary', '', originalText);
                    
                    await this.apiHandler.summaryStream(originalText, (chunk: string) => {
                        fullContent += chunk;
                        this.updateResultContent(fullContent);
                    });
                    
                    this.showResultPanel('summary', fullContent, originalText);
                }
            });

            // 插入下一段按钮
            this.createButton(actionsEl, 'corner-down-right', t('insertBelow'), () => {
                this.insertBelowSelection(content);
                new Notice(t('inserted'));
            });

            // 复制按钮
            this.createButton(actionsEl, 'copy', t('copy'), () => {
                navigator.clipboard.writeText(content);
                new Notice(t('copied'));
            });
        } else {
            // 复制按钮
            this.createButton(actionsEl, 'copy', t('copy'), () => {
                navigator.clipboard.writeText(content);
                new Notice(t('copied'));
            });

            // 如果是翻译，添加替换按钮
            if (type === 'translate' && originalText) {
                this.createButton(actionsEl, 'replace', t('replace'), () => {
                    this.replaceSelectedText(content);
                    new Notice(t('replaced'));
                    this.hideHoverMenu();
                });
            }

            // 如果是解释，添加追加按钮
            if (type === 'explain' && originalText) {
                this.createButton(actionsEl, 'file-plus', t('appendToNote'), () => {
                    this.appendToNote(content);
                    new Notice(t('appended'));
                });
            }
        }
    }

    /**
     * 隐藏结果面板
     */
    private hideResultPanel() {
        if (this.resultPanel) {
            this.resultPanel.remove();
            this.resultPanel = null;
        }
    }

    /**
     * 替换选中的文本
     */
    private replaceSelectedText(newText: string) {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return;
        }

        const editor = view.editor;
        editor.replaceSelection(newText);
    }

    /**
     * 追加到笔记
     */
    private appendToNote(text: string) {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return;
        }

        const editor = view.editor;
        const cursor = editor.getCursor('to');
        editor.replaceRange(`\n\n${text}`, cursor);
    }

    /**
     * 插入到选中文本下一段
     */
    private insertBelowSelection(text: string) {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return;
        }

        const editor = view.editor;
        const cursor = editor.getCursor('to');
        
        // 在选区结束位置插入换行和总结内容
        editor.replaceRange(`\n\n${text}`, cursor);
    }

    /**
     * 获取 Lucide 图标 SVG
     */
    private getLucideIcon(name: string): string {
        const icons: Record<string, string> = {
            'volume-2': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>',
            'square': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
            'languages': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"></path><path d="m4 14 6-6 2-3"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="m22 22-5-10-5 10"></path><path d="M14 18h6"></path></svg>',
            'search': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path><path d="M11 8a3 3 0 0 0-3 3"></path></svg>',
            'file-text': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
            'book-open': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
            'copy': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
            'replace': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>',
            'file-plus': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>',
            'refresh-cw': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
            'corner-down-right': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 10 20 15 15 20"></polyline><path d="M4 4v7a4 4 0 0 0 4 4h12"></path></svg>'
        };

        return icons[name] || '';
    }

    /**
     * 安全地设置元素的 SVG 内容
     * 使用 DOMParser 避免直接使用 innerHTML
     */
    private setSvgContent(element: HTMLElement, svgString: string): void {
        // eslint-disable-next-line @microsoft/sdl/no-inner-html
        element.innerHTML = svgString;
    }
}
