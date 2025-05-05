// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 表单提交处理
document.querySelector('.cta-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    
    // 这里可以添加表单提交逻辑
    console.log('提交的信息：', { name, email });
    alert('感谢您的关注！课程手册将发送到您的邮箱。');
});

// 打字效果
function setupTypingEffect() {
    const texts = [' Idea to Impact'];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingDelay = 100; // 打字速度
    const erasingDelay = 50;  // 删除速度
    const newTextDelay = 2000; // 完成打字后的停顿时间

    const typingElement = document.querySelector('.typing-text');

    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            // 删除文字
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            // 添加文字
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        // 处理动画状态
        if (!isDeleting && charIndex === currentText.length) {
            // 完成打字，等待一段时间后开始删除
            setTimeout(() => isDeleting = true, newTextDelay);
        } else if (isDeleting && charIndex === 0) {
            // 完成删除，重新开始
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
        }

        // 设置下一帧的延迟
        setTimeout(type, isDeleting ? erasingDelay : typingDelay);
    }

    // 开始动画
    setTimeout(type, newTextDelay);
}

// 页面加载完成后启动打字效果
document.addEventListener('DOMContentLoaded', setupTypingEffect);

class ChatAssistant {
    constructor() {
        // 使用 Worker URL 作为代理
        const PROXY_URL = 'https://small-union-0e02.twistoreoo.workers.dev';
        
        this.modelConfig = {
            deepseek: {
                v3: {
                    apiKey: '6a92e8e9-abca-4182-899e-95fd00f0cc33',
                    baseUrl: PROXY_URL,
                    model: 'deepseek-v3-241226'
                },
                r1: {
                    apiKey: '3585bee0-8b1b-4ebc-a008-a9d03f5c0b68',
                    baseUrl: PROXY_URL,  // 改回使用 Worker URL
                    model: 'ep-20250221194928-vqdlt'
                }
            },
            glm: {
                apiKey: '3f7daf30dfdc4ce48472b2e021448ef0.AgvimzjOd6ZZV7JL',
                baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                model: 'glm-4-plus'
            }
        };

        this.currentModel = 'deepseek';
        this.chatMessages = [
            {
                role: 'system',
                content: `你是i2i lab的课程助手，你的任务是帮助用户了解我们的"AI+UX：设计未来的产品体验"课程。

当用户启用深度思考模式时，请按以下格式回答：

思考过程：
• 分析问题要点
• 梳理相关信息
• 确定回答框架
• 组织答案结构

然后给出正式回答，使用以下格式：
• 使用Markdown格式
• 使用"**粗体**"强调重要概念
• 使用清晰的标题层级
• 使用项目符号列表
• 保持段落简短

不使用深度思考模式时，直接给出答案即可。

请基于课程简介、适宜对象、学习成果、课程结构等内容来回答用户的问题。保持友好、专业的态度，并尽可能详细地解答用户的疑问。`
            }
        ];
        this.isThinking = false;
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.chatContainer = document.querySelector('.chat-messages');
        this.inputArea = document.querySelector('.chat-input');
        this.sendButton = document.querySelector('.send-btn');
        this.deepThinkingBtn = document.querySelector('.feature-btn[title="深度思考"]');
        this.webSearchBtn = document.querySelector('.feature-btn[title="联网搜索"]');
        // 添加新的元素选择器
        this.modelSelectBtn = document.querySelector('.model-select-btn');
        this.modelDropdown = document.querySelector('.model-dropdown');
        this.currentModelSpan = document.querySelector('.current-model');
    }

    initEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.inputArea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 深度思考模式
        this.deepThinkingBtn.addEventListener('click', () => {
            this.deepThinkingBtn.classList.toggle('active');
        });
        
        // 联网搜索模式
        this.webSearchBtn.addEventListener('click', () => {
            this.webSearchBtn.classList.toggle('active');
        });

        // 添加模型选择相关的事件监听
        this.modelSelectBtn.addEventListener('click', () => {
            this.modelSelectBtn.classList.toggle('active');
            this.modelDropdown.classList.toggle('show');
        });

        document.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const model = e.target.dataset.model;
                this.setModel(model);
                this.modelSelectBtn.classList.remove('active');
                this.modelDropdown.classList.remove('show');
            });
        });

        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.model-selector')) {
                this.modelSelectBtn.classList.remove('active');
                this.modelDropdown.classList.remove('show');
            }
        });
    }

    setModel(model) {
        this.currentModel = model;
        this.currentModelSpan.textContent = model === 'deepseek' ? 'DeepSeek' : 'GLM-4-Plus';
        
        // 控制深度思考按钮的显示
        if (model === 'deepseek') {
            this.deepThinkingBtn.classList.remove('hidden');
        } else {
            this.deepThinkingBtn.classList.add('hidden');
            this.deepThinkingBtn.classList.remove('active');
        }
    }

    async sendMessage() {
        const userInput = this.inputArea.value.trim();
        if (!userInput || this.isThinking) return;

        // 添加用户消息到聊天界面
        this.addMessageToChat('user', userInput);
        this.inputArea.value = '';
        this.isThinking = true;

        // 准备API请求参数
        const messages = [...this.chatMessages];
        
        // 如果启用了深度思考模式，添加特殊提示
        if (this.deepThinkingBtn.classList.contains('active')) {
            messages.push({
                role: 'user',
                content: `请使用深度思考模式回答以下问题，先展示你的思考过程，然后再给出最终答案。问题是：${userInput}`
            });
        } else {
            messages.push({
                role: 'user',
                content: userInput
            });
        }

        const requestParams = {
            model: 'glm-4-plus',
            messages: messages,
            stream: true,
            temperature: this.deepThinkingBtn.classList.contains('active') ? 0.2 : 0.7,
            top_p: this.deepThinkingBtn.classList.contains('active') ? 0.1 : 0.7
        };

        // 如果启用了联网搜索
        if (this.webSearchBtn.classList.contains('active')) {
            requestParams.tools = [{
                type: 'web_search',
                web_search: {
                    enable: true
                }
            }];
        }

        try {
            const response = await this.makeAPIRequest(requestParams);
            this.handleAPIResponse(response);
        } catch (error) {
            console.error('API请求错误:', error);
            this.addMessageToChat('assistant', '抱歉，我遇到了一些问题，请稍后再试。');
        } finally {
            this.isThinking = false;
        }
    }

    async makeAPIRequest(params) {
        const config = this.currentModel === 'deepseek' 
            ? (this.deepThinkingBtn.classList.contains('active') 
                ? this.modelConfig.deepseek.r1 
                : this.modelConfig.deepseek.v3)
            : this.modelConfig.glm;

        let requestBody;
        if (this.currentModel === 'deepseek') {
            requestBody = {
                model: config.model,
                messages: params.messages.map(msg => ({
                    role: msg.role === 'system' ? 'assistant' : msg.role,
                    content: msg.content
                })),
                stream: true
            };
        } else {
            // GLM 配置保持不变
            requestBody = {
                ...params,
                model: config.model,
                temperature: params.temperature || 0.7,
                top_p: params.top_p || 0.7,
                request_id: `i2i_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
        }

        try {
            const response = await fetch(config.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API请求失败: ${response.status} - ${errorText}`);
            }

            return response;
        } catch (error) {
            console.error('API请求出错:', error);
            throw error;
        }
    }

    handleAPIResponse(response) {
        const reader = response.body.getReader();
        let assistantMessage = '';
        let messageDiv = null;
        
        reader.read().then(function processText({ done, value }) {
            if (done) {
                if (assistantMessage) {
                    this.chatMessages.push({ role: 'assistant', content: assistantMessage });
                }
                this.isThinking = false;
                return;
            }

            const chunk = new TextDecoder().decode(value);
            console.log('收到的数据块:', chunk); // 添加调试日志
            
            const lines = chunk.split('\n');
            
            lines.forEach(line => {
                if (line.trim()) {  // 确保行不为空
                    let jsonData;
                    try {
                        // 处理可能的"data: "前缀
                        const jsonStr = line.startsWith('data: ') ? line.slice(6) : line;
                        if (jsonStr === '[DONE]') return;
                        
                        jsonData = JSON.parse(jsonStr);
                        console.log('解析的JSON数据:', jsonData); // 添加调试日志
                        
                        // 适配不同的响应格式
                        const content = this.currentModel === 'deepseek'
                            ? (jsonData.choices?.[0]?.delta?.content || jsonData.choices?.[0]?.message?.content)
                            : jsonData.choices?.[0]?.delta?.content;

                        if (content) {
                            assistantMessage += content;
                            if (!messageDiv) {
                                messageDiv = this.addMessageToChat('assistant', '');
                            }
                            this.updateAssistantMessage(assistantMessage, messageDiv);
                        }
                    } catch (e) {
                        console.error('JSON解析错误:', e, '原始数据:', line);
                    }
                }
            });

            return reader.read().then(processText.bind(this));
        }.bind(this)).catch(error => {
            console.error('流式响应处理错误:', error);
            this.addMessageToChat('assistant', '抱歉，处理响应时出现错误，请稍后重试。');
            this.isThinking = false;
        });
    }

    addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const contentHtml = role === 'user' 
            ? this.escapeHtml(content)
            : ''; // 助手消息初始为空，等待流式更新
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${contentHtml}</div>
            </div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        
        if (role === 'user') {
            this.chatMessages.push({ role, content });
        }
        
        return messageDiv;
    }

    updateAssistantMessage(content, messageDiv) {
        // 检查是否包含 reasoning_content
        const hasReasoning = content.includes('reasoning_content');
        
        if (hasReasoning) {
            try {
                const jsonData = JSON.parse(content);
                const reasoning = jsonData.reasoning_content;
                const answer = jsonData.content;

                // 创建消息容器
                const messageContent = document.createElement('div');
                messageContent.className = 'message-content';

                // 创建思维链部分
                const reasoningSection = document.createElement('div');
                reasoningSection.className = 'reasoning-section';
                
                // 创建可折叠的标题
                const reasoningHeader = document.createElement('div');
                reasoningHeader.className = 'reasoning-header collapsed';
                reasoningHeader.innerHTML = `
                    <span class="toggle-icon">▼</span>
                    <span>思考过程</span>
                `;

                // 创建思维链内容
                const reasoningContent = document.createElement('div');
                reasoningContent.className = 'reasoning-content collapsed';
                // 将思维链内容格式化为项目符号列表
                const formattedReasoning = reasoning.split('\n')
                    .filter(line => line.trim())
                    .map(line => `• ${line.trim()}`)
                    .join('\n');
                reasoningContent.innerText = formattedReasoning;

                // 添加折叠功能
                reasoningHeader.addEventListener('click', () => {
                    reasoningHeader.classList.toggle('collapsed');
                    reasoningContent.classList.toggle('collapsed');
                });

                // 组装思维链部分
                reasoningSection.appendChild(reasoningHeader);
                reasoningSection.appendChild(reasoningContent);

                // 创建回答部分
                const answerContent = document.createElement('div');
                answerContent.className = 'answer-content';
                // 使用 marked 解析 Markdown
                answerContent.innerHTML = marked.parse(answer);

                // 组装消息
                messageContent.appendChild(reasoningSection);
                messageContent.appendChild(answerContent);

                // 更新消息
                messageDiv.innerHTML = '';
                messageDiv.appendChild(messageContent);

                // 应用额外的样式
                this.applyMessageStyles(answerContent);
            } catch (e) {
                console.error('解析响应失败:', e);
                messageDiv.textContent = content;
            }
        } else {
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.innerHTML = marked.parse(content);
            messageDiv.innerHTML = '';
            messageDiv.appendChild(messageContent);
            this.applyMessageStyles(messageContent);
        }
    }

    applyMessageStyles(element) {
        // 为列表项添加样式
        element.querySelectorAll('ul li, ol li').forEach(li => {
            li.style.marginBottom = '0.5rem';
        });
        
        // 为标题添加样式
        element.querySelectorAll('h2, h3').forEach(heading => {
            heading.style.marginTop = '1rem';
            heading.style.marginBottom = '0.5rem';
            heading.style.color = 'var(--primary-color)';
        });
        
        // 确保段落间距适当
        element.querySelectorAll('p').forEach(p => {
            p.style.marginBottom = '0.8rem';
        });
        
        // 为思考过程添加额外的样式
        element.querySelectorAll('.thinking-process .step').forEach(step => {
            step.style.marginBottom = '0.8rem';
        });
        
        element.querySelectorAll('.thinking-process .conclusion').forEach(conclusion => {
            conclusion.style.fontStyle = 'italic';
            conclusion.style.color = '#555';
        });
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// 初始化聊天助手
document.addEventListener('DOMContentLoaded', () => {
    const chatAssistant = new ChatAssistant();
}); 