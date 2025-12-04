
export enum AppView {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  QUIZ = 'QUIZ',
  TUTOR = 'TUTOR',
  STATS = 'STATS',
  NOTEBOOK = 'NOTEBOOK',
  PHOTO_SOLVER = 'PHOTO_SOLVER'
}

export enum MathTopic {
  CALCULATION = '计算', // 包含加减乘除四则运算
  DECIMALS = '小数',
  FRACTIONS = '分数',
  RATIO = '比与比例',
  EQUATIONS = '方程',
  GEOMETRY = '几何'
}

export enum Difficulty {
  EASY = '简单', // 3-4年级
  MEDIUM = '中等', // 5-6年级
  HARD = '困难' // 竞赛难度
}

export interface User {
  id: string;
  phone: string;
  password: string; // In a real app, never store plain text passwords!
  nickname: string;
  avatar: string;
}

export interface Question {
  id: string;
  text: string;
  options?: string[]; // Multiple choice options
  correctAnswer: string;
  explanation?: string;
  isAiGenerated: boolean;
  userAnswer?: string; // The answer user selected (if wrong)
  wrongDate?: string; // When the error occurred
  topic?: string; // Store topic for filtering/display
}

export interface UserStats {
  stars: number;
  xp: number;
  streak: number;
  questionsAnswered: number;
  correctAnswers: number;
  recentScores: { date: string; score: number }[];
  wrongQuestions: Question[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}