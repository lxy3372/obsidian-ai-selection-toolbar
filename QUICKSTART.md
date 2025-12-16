# 快速入门指南

## 📦 安装步骤

1. **确认文件完整性**
   确保以下文件都已生成：
   - `main.js` (构建产物)
   - `manifest.json`
   - `styles.css`

2. **启用插件**
   - 打开 Obsidian
   - 进入 设置 → 社区插件
   - 关闭"安全模式"（如果还未关闭）
   - 在已安装插件列表中找到 "Text Hover Assistant"
   - 开启插件

## ⚙️ 首次配置

### 1. 配置 TTS（朗读功能）

进入插件设置页面，在 "🔊 TTS Settings" 部分：

```
TTS API URL: https://api.openai.com/v1/audio/speech
TTS API Key: sk-your-api-key-here
TTS Model: tts-1
Voice: alloy（或选择其他语音）
Speech Speed: 1.0
```

### 2. 配置 AI（翻译和解释功能）

在 "🤖 AI Settings" 部分：

```
AI API URL: https://api.openai.com/v1/chat/completions
AI API Key: sk-your-api-key-here
AI Model: gpt-3.5-turbo
```

**翻译设置：**
```
Target Language: English
Translation Prompt: You are a professional translator. Translate the following text into {{targetLanguage}}.
```

**解释设置：**
```
Output Language: Chinese
Explanation Prompt: Explain the following concept or word broadly and simply in {{outputLanguage}}. Keep it concise.
```

## 🎯 使用示例

### 示例 1: 朗读英文段落

1. 选中一段英文文本
2. 等待悬浮菜单出现
3. 点击 🔊 朗读按钮
4. 听到语音播放
5. 再次点击可停止播放

### 示例 2: 翻译中文为英文

1. 选中中文文本：`人工智能正在改变世界`
2. 点击 🌐 翻译按钮
3. 查看翻译结果：`Artificial intelligence is changing the world`
4. 点击"复制"按钮复制结果
5. 或点击"替换"按钮用译文替换原文

### 示例 3: 解释专业术语

1. 选中术语：`Obsidian`
2. 点击 💡 解释按钮
3. 查看解释内容
4. 点击"追加到笔记"将解释插入到笔记中

## 🌟 高级配置

### 使用本地 Ollama

如果你在本地运行 Ollama：

```
AI API URL: http://localhost:11434/v1/chat/completions
AI API Key: (留空)
AI Model: llama2（或其他已安装的模型）
```

### 自定义提示词

你可以完全自定义翻译和解释的行为：

**专业翻译示例：**
```
You are a professional {{domain}} translator with 10 years of experience. 
Translate the following text into {{targetLanguage}}, maintaining technical accuracy and natural flow.
```

**学术解释示例：**
```
You are a university professor. Explain the following concept to a student in {{outputLanguage}}.
Provide clear definitions, examples, and key points. Keep it educational yet accessible.
```

## 🔍 功能对比表

| 功能 | 朗读 | 翻译 | 解释 |
|------|------|------|------|
| API | TTS | AI | AI |
| 输出 | 音频 | 文本 | 文本 |
| 可复制 | ❌ | ✅ | ✅ |
| 可替换 | ❌ | ✅ | ❌ |
| 可追加 | ❌ | ❌ | ✅ |

## 🎨 主题适配

插件完全支持 Obsidian 的亮色和暗色主题，无需额外配置。

## 💡 使用技巧

1. **选中快捷键**: 使用 `Shift + 方向键` 快速选中文本
2. **批量操作**: 可以选中多段文字进行翻译
3. **防抖设计**: 选中文本后等待 300ms 菜单才会出现，避免误触
4. **键盘友好**: 使用 `Tab` 键在按钮间切换
5. **点击外部关闭**: 点击菜单外任意位置可关闭菜单

## ⚠️ 注意事项

1. **API 费用**: 使用 OpenAI API 会产生费用，请注意用量
2. **网络连接**: 需要稳定的网络连接才能使用 API 功能
3. **API Key 安全**: 不要将包含 API Key 的配置文件上传到公共仓库
4. **编辑模式**: 仅在 Live Preview 和 Source 模式下工作

## 🐛 常见问题

**Q: 菜单不显示？**
A: 确保选中了文本，并且等待 300ms。检查是否在正确的编辑模式下。

**Q: API 调用失败？**
A: 检查 API Key 是否正确，网络是否畅通。查看开发者控制台（Ctrl+Shift+I）的错误信息。

**Q: 音频无法播放？**
A: 确认浏览器支持 Web Audio API。尝试在不同的文本上测试。

**Q: 翻译结果不准确？**
A: 尝试调整提示词模板，或更换更强大的 AI 模型（如 gpt-4）。

## 📞 获取帮助

- 查看完整 README: `README.md`
- 查看源代码注释
- 提交 Issue 到 GitHub

---

祝你使用愉快！🎉
