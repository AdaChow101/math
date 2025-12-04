// frontend/src/services/geminiService.ts

// 确保这里的 URL 与你的 vite 代理或后端端口一致
const API_BASE = '/api'; 

// 1. 生成题目
export const generateMathProblem = async (topic: string, difficulty: string) => {
  // 后端实际路由是 /math/generate-exercise
  const res = await fetch(`${API_BASE}/math/generate-exercise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, difficulty })
  });
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.data; // 注意后端返回结构通常包裹在 data 里
};

// 2. 拍照解题 (修复函数名)
export const solveMathFromImage = async (image: string) => {
  // 后端实际路由是 /vision/ocr
  const res = await fetch(`${API_BASE}/vision/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image }) // 后端期望 { image: base64 }
  });
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.data.analysis;
};

// 3. AI 辅导 (修复 TutorView 缺失的函数)
// 注意：当前后端 /api/chat 不是流式的，这里做个假流式适配组件
export const getTutorResponseStream = async (history: any[], message: string) => {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });
  
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  
  // 模拟一个生成器，适配组件的 await for ... 结构
  return (async function* () {
    yield { text: json.data.message };
  })();
};