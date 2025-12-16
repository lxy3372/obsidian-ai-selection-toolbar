# 开发文档

## 📁 项目结构

```
obsidian-text-hover-assistant/
├── main.ts                 # 主插件逻辑
├── types.ts               # TypeScript 类型定义
├── api.ts                 # API 调用和音频播放
├── settings.ts            # 设置页面
├── styles.css             # 样式文件
├── manifest.json          # 插件元数据
├── package.json           # 依赖配置
├── tsconfig.json          # TypeScript 配置
├── esbuild.config.mjs     # 构建配置
└── README.md              # 用户文档
```

## 🏗️ 架构设计

### 核心模块

#### 1. **Main Plugin** (`main.ts`)
- 插件生命周期管理
- CodeMirror 扩展注册
- 悬浮菜单显示/隐藏逻辑
- 事件监听和防抖处理

#### 2. **API Handler** (`api.ts`)
- TTS API 调用
- AI API 调用（翻译和解释）
- 音频播放器管理
- 错误处理和用户提示

#### 3. **Settings** (`settings.ts`)
- 设置页面 UI
- 配置项管理
- 数据持久化

#### 4. **Types** (`types.ts`)
- 插件设置接口
- API 响应接口
- 类型安全保障

## 🔍 关键技术点

### 1. 选区监听 (Selection Monitoring)

使用 CodeMirror 6 的 `ViewPlugin` 监听选区变化：

```typescript
ViewPlugin.fromClass(
    class {
        update(update: ViewUpdate) {
            if (!update.selectionSet) return;
            
            const selection = update.state.selection.main;
            const selectedText = update.state.sliceDoc(
                selection.from, 
                selection.to
            );
            
            // 防抖处理
            debounce(() => {
                showMenu(selectedText, selection);
            }, 300);
        }
    }
);
```

### 2. 位置计算 (Position Calculation)

使用 `coordsAtPos` 获取选区坐标：

```typescript
const startCoords = view.coordsAtPos(from);
const endCoords = view.coordsAtPos(to);

// 计算菜单位置（选区中心上方）
const menuTop = startCoords.top - 50;
const menuLeft = (startCoords.left + endCoords.right) / 2;
```

### 3. API 调用 (API Requests)

使用 Obsidian 的 `requestUrl` 进行网络请求：

```typescript
const response = await requestUrl({
    url: this.settings.ai.apiUrl,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${this.settings.ai.apiKey}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
});
```

### 4. 音频播放 (Audio Playback)

使用 Web Audio API：

```typescript
const audioContext = new AudioContext();
const decodedBuffer = await audioContext.decodeAudioData(audioBuffer);
const source = audioContext.createBufferSource();
source.buffer = decodedBuffer;
source.connect(audioContext.destination);
source.start(0);
```

## 🎨 样式系统

### CSS 变量

使用 Obsidian 的 CSS 变量确保主题兼容：

```css
.text-hover-menu {
    background: var(--background-primary);
    color: var(--text-normal);
    border: 1px solid var(--background-modifier-border);
}
```

### 关键 CSS 类

- `.text-hover-menu`: 主菜单容器
- `.text-hover-buttons`: 按钮容器
- `.text-hover-button`: 单个按钮
- `.text-hover-result-panel`: 结果面板
- `.text-hover-content`: 内容区域
- `.text-hover-actions`: 操作按钮区域

## 🔧 扩展开发

### 添加新功能按钮

在 `main.ts` 的 `showHoverMenu` 方法中添加：

```typescript
// 添加新按钮
this.createButton(buttonContainer, 'icon-name', '工具提示', async () => {
    await this.handleNewFeature(selectedText);
});

// 实现处理方法
private async handleNewFeature(text: string) {
    try {
        this.showResultPanel('loading', '处理中...');
        
        const result = await this.apiHandler.customAPI(text);
        
        this.showResultPanel('custom', result, text);
    } catch (error) {
        this.hideResultPanel();
        console.error('Feature Error:', error);
    }
}
```

### 添加新的 API 方法

在 `api.ts` 的 `APIHandler` 类中添加：

```typescript
async customAPI(text: string): Promise<string> {
    try {
        const response = await requestUrl({
            url: 'https://your-api-endpoint.com',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.settings.ai.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: text,
                // 其他参数
            })
        });

        return response.json.result;
    } catch (error) {
        console.error('Custom API Error:', error);
        new Notice('❌ API 调用失败');
        throw error;
    }
}
```

### 添加新的配置项

1. 在 `types.ts` 中更新接口：

```typescript
export interface TextHoverSettings {
    // 现有配置...
    custom: {
        enabled: boolean;
        apiUrl: string;
        options: string[];
    };
}
```

2. 在 `settings.ts` 中添加 UI：

```typescript
new Setting(containerEl)
    .setName('自定义功能')
    .setDesc('启用自定义功能')
    .addToggle(toggle => toggle
        .setValue(this.plugin.settings.custom.enabled)
        .onChange(async (value) => {
            this.plugin.settings.custom.enabled = value;
            await this.plugin.saveSettings();
        }));
```

## 🧪 调试技巧

### 1. 开发者控制台

按 `Ctrl+Shift+I` (Windows/Linux) 或 `Cmd+Option+I` (Mac) 打开控制台。

### 2. 日志输出

在关键位置添加日志：

```typescript
console.log('Selection:', selectedText);
console.log('Coords:', startCoords, endCoords);
console.log('API Response:', response);
```

### 3. 断点调试

在代码中添加 `debugger;` 语句，然后在浏览器开发者工具中调试。

### 4. 热重载

运行 `npm run dev` 启动开发模式，修改代码后：
- 使用 `Ctrl+R` (Windows/Linux) 或 `Cmd+R` (Mac) 重载 Obsidian
- 或在命令面板中运行 "重新加载插件"

## 📋 测试清单

### 功能测试

- [ ] 选中文本后菜单正确显示
- [ ] 菜单位置计算正确
- [ ] 点击外部关闭菜单
- [ ] TTS 播放和停止
- [ ] 翻译功能正常
- [ ] 解释功能正常
- [ ] 复制功能正常
- [ ] 替换功能正常
- [ ] 追加功能正常

### 边界测试

- [ ] 空文本选择
- [ ] 超长文本选择
- [ ] 特殊字符处理
- [ ] API 错误处理
- [ ] 网络超时处理
- [ ] 菜单超出屏幕边界

### 兼容性测试

- [ ] Live Preview 模式
- [ ] Source 模式
- [ ] 亮色主题
- [ ] 暗色主题
- [ ] 移动端（如果支持）

## 🚀 构建和发布

### 开发构建

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 版本发布

1. 更新 `manifest.json` 中的版本号
2. 更新 `versions.json`
3. 运行 `npm run version`
4. 创建 Git tag 并推送
5. 在 GitHub 上创建 Release

## 🔐 安全考虑

1. **API Key 保护**
   - 不要硬编码 API Key
   - 使用密码输入框
   - 不要记录 API Key

2. **输入验证**
   - 验证 API 响应格式
   - 处理恶意输入
   - 限制文本长度

3. **错误处理**
   - 捕获所有异常
   - 提供用户友好的错误消息
   - 不暴露敏感信息

## 📚 参考资料

- [Obsidian API 文档](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [CodeMirror 6 文档](https://codemirror.net/docs/)
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 添加必要的注释
- 使用有意义的变量名
- 保持函数简短和单一职责

---

Happy Coding! 🎉
