"use strict";
// backend/server/service/gemini.js
const axios = require('axios');
class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        // 使用 v1beta 版本 API 以确保兼容性
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
    }
    async generateContent(model, messages, generationConfig = {}) {
        if (!this.apiKey)
            throw new Error('GEMINI_API_KEY 未配置');
        try {
            const response = await axios.post(`${this.baseURL}/${model}:generateContent?key=${this.apiKey}`, {
                contents: messages,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    ...generationConfig
                }
            }, { headers: { 'Content-Type': 'application/json' } });
            return response.data;
        }
        catch (error) {
            console.error('Gemini API 错误详情:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || 'AI 服务请求失败');
        }
    }
    // 1. 数学解题
    async solveMathProblem(problem) {
        const prompt = `你是一个小学数学老师。请解答：${problem}。
    严格返回纯 JSON 格式，不要包含 Markdown 标记（如 \`\`\`json）：
    {
      "answer": "简明答案",
      "steps": [
        {"step": 1, "description": "步骤名称", "explanation": "详细讲解"}
      ],
      "concepts": ["涉及知识点"],
      "difficulty": "easy/medium/hard"
    }`;
        // 使用 gemini-1.5-flash 模型（速度快且支持）
        const result = await this.generateContent('gemini-1.5-flash', [
            { role: 'user', parts: [{ text: prompt }] }
        ]);
        try {
            let text = result.candidates[0].content.parts[0].text;
            // 清理可能存在的 markdown 标记
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(text);
        }
        catch (e) {
            console.error("解析失败:", e);
            return { answer: "解析失败", steps: [], concepts: [], difficulty: "easy" };
        }
    }
    // 2. 拍照分析 (修正了参数格式)
    async analyzeImage(base64Image, question = '请分析这张图片中的数学问题') {
        // 移除前端传来的 data:image/xxx;base64, 前缀
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const messages = [{
                role: 'user',
                parts: [
                    { text: question },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: cleanBase64
                        }
                    }
                ]
            }];
        // 使用 gemini-1.5-flash 处理图片
        const result = await this.generateContent('gemini-1.5-flash', messages);
        return result.candidates?.[0]?.content?.parts?.[0]?.text || '无法识别图片内容';
    }
    // 3. AI 对话
    async chatWithAI(message, history = []) {
        // 构建历史上下文
        const contents = [{
                role: 'user',
                parts: [{ text: '你是一个友善的小学数学辅导员，叫猫头鹰博士。' }]
            }];
        // 转换历史记录格式
        history.forEach(h => {
            if (h.question)
                contents.push({ role: 'user', parts: [{ text: h.question }] });
            if (h.answer)
                contents.push({ role: 'model', parts: [{ text: h.answer }] });
        });
        contents.push({ role: 'user', parts: [{ text: message }] });
        const result = await this.generateContent('gemini-1.5-flash', contents);
        return result.candidates?.[0]?.content?.parts?.[0]?.text || '思考中...';
    }
}
module.exports = new GeminiService();
//# sourceMappingURL=gemini.js.map