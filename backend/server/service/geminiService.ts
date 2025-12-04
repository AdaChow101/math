// backend/server/service/geminiService.ts（注意路径：service 单数）
import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// ========== 1. 核心类型定义（TS 必加） ==========
interface GenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  [key: string]: any;
}

interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: MessagePart[];
}

export interface SolveMathResponse {
  answer: string;
  steps: Array<{
    step: number;
    description: string;
    explanation: string;
  }>;
  concepts: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

// ========== 2. 核心类封装 ==========
class GeminiService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    // 从后端 .env 文件读取密钥（绝对不能暴露到前端）
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  GEMINI_API_KEY 未设置，请检查 backend/.env 文件');
    }
    // 新版 Gemini API 端点（修复旧版 v1beta 问题）
    this.baseURL = 'https://generativelanguage.googleapis.com/v1/models';
  }

  // 通用 Gemini API 调用方法（封装重复逻辑）
  private async generateContent(
    model: string = 'gemini-1.5-flash', // 修复废弃的 gemini-pro-vision
    messages: GeminiMessage[],
    generationConfig: GenerationConfig = {}
  ) {
    if (!this.apiKey) throw new Error('GEMINI_API_KEY 未配置');
    if (!messages.length) throw new Error('请传入对话消息');

    try {
      const response = await axios.post(
        `${this.baseURL}/${model}:generateContent?key=${this.apiKey}`,
        {
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            ...generationConfig
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMsg = (axiosError.response?.data as any)?.error?.message || axiosError.message;
      console.error('Gemini API 调用失败:', errorMsg);
      throw new Error(`AI 服务错误: ${errorMsg}`);
    }
  }

  // 解题核心方法（返回结构化 JSON）
  async solveMathProblem(problem: string): Promise<SolveMathResponse> {
    if (!problem.trim()) throw new Error('请输入有效的数学问题');

    const prompt = `你是专业小学数学老师，严格按照以下 JSON 格式解答问题（仅返回 JSON，无其他文本）：
{
  "answer": "最终答案",
  "steps": [{"step": 1, "description": "步骤描述", "explanation": "详细解释"}],
  "concepts": ["相关数学概念"],
  "difficulty": "easy/medium/hard"
}
问题：${problem}`;

    const result = await this.generateContent('gemini-1.5-flash', [
      { role: 'user', parts: [{ text: prompt }] }
    ], { temperature: 0.3 });

    // 安全校验响应（避免 undefined 报错）
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) throw new Error('Gemini API 无有效响应');

    // 提取并解析 JSON（兼容 AI 可能返回的多余文本）
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI 响应非合法 JSON 格式');

    try {
      return JSON.parse(jsonMatch[0]) as SolveMathResponse;
    } catch (parseError) {
      throw new Error(`解析解题结果失败: ${(parseError as Error).message}`);
    }
  }

  // 图片分析（修复参数命名：inlineData/mimeType）
  async analyzeImage(base64Image: string, question = '分析图片中的数学问题') {
    if (!base64Image) throw new Error('请提供图片的 Base64 编码');

    // 清理 Base64 前缀（前端传的是 data:image/jpeg;base64,...）
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [
          { text: question },
          {
            inlineData: { // 修复旧版 inline_data 为驼峰 inlineData
              mimeType: "image/jpeg", // 修复旧版 mime_type 为 mimeType
              data: cleanBase64
            }
          }
        ]
      }
    ];

    const result = await this.generateContent('gemini-1.5-flash', messages, { temperature: 0.4 });
    return result.candidates?.[0]?.content?.parts?.[0]?.text || '未识别到图片中的数学内容';
  }

  // 聊天功能（适配历史记录）
  async chatWithAI(message: string, history: Array<{ question: string; answer: string }> = []) {
    if (!message.trim()) throw new Error('请输入聊天内容');

    const messages: GeminiMessage[] = [
      { role: 'user', parts: [{ text: '你是专业数学导师，用简洁易懂的语言回答问题，避免专业术语堆砌' }] }
    ];

    // 安全处理历史记录（过滤空值）
    history.forEach(item => {
      if (item.question && item.answer) {
        messages.push({ role: 'user', parts: [{ text: item.question }] });
        messages.push({ role: 'model', parts: [{ text: item.answer }] });
      }
    });

    messages.push({ role: 'user', parts: [{ text: message }] });
    const result = await this.generateContent('gemini-1.5-flash', messages, { temperature: 0.7 });
    return result.candidates?.[0]?.content?.parts?.[0]?.text || '暂无有效回复';
  }
}

// 导出单例（后端其他文件导入使用）
export default new GeminiService();