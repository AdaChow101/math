import { MathTopic, Difficulty, ChatMessage } from '../types'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  processingTime?: string;
}

export interface ProblemResponse {
  problemText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic?: string;
  difficulty?: string;
}

export interface MathSolution {
  answer: string;
  steps: Array<{
    step: number;
    description: string;
    explanation: string;
  }>;
  concepts: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ImageAnalysis {
  analysis: string;
  imageInfo: {
    size: string;
    processedIn: string;
  };
}

class ApiService {
  private async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `请求失败: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('API 请求错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络请求失败'
      };
    }
  }

  // 生成数学题目
  async generateMathProblem(
    topic: MathTopic, 
    difficulty: Difficulty
  ): Promise<ApiResponse<ProblemResponse>> {
    return this.request('/math/generate-exercise', 'POST', {
      topic,
      difficulty,
      count: 1
    });
  }

  // 解题
  async solveMathProblem(problem: string): Promise<ApiResponse<MathSolution>> {
    return this.request('/math/solve', 'POST', { problem });
  }

  // 分析图片
  async analyzeImage(imageBase64: string, question?: string): Promise<ApiResponse<ImageAnalysis>> {
    return this.request('/vision/ocr', 'POST', {
      image: imageBase64,
      question: question || '请分析这张图片中的数学问题'
    });
  }

  // AI对话
  async chatWithAI(message: string, history: ChatMessage[] = []): Promise<ApiResponse<{ message: string }>> {
    return this.request('/chat', 'POST', { 
      message, 
      history: history.map(msg => ({
        question: msg.role === 'user' ? msg.text : undefined,
        answer: msg.role === 'model' ? msg.text : undefined
      })).filter(h => h.question || h.answer)
    });
  }

  // 健康检查
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();