const express = require('express');
const router = express.Router();
const geminiService = require('../service/gemini');

router.post('/solve', async (req, res, next) => {
  try {
    const { problem } = req.body;
    
    if (!problem || problem.trim() === '') {
      return res.status(400).json({ error: '请输入数学问题' });
    }

    console.log(`🔍 处理数学问题: ${problem.substring(0, 100)}...`);
    
    const startTime = Date.now();
    const solution = await geminiService.solveMathProblem(problem);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: solution,
      processingTime: `${processingTime}ms`
    });

  } catch (error) {
    console.error('数学解题错误:', error);
    next(error);
  }
});

router.post('/generate-exercise', async (req, res, next) => {
  try {
    const { topic, difficulty = 'medium', count = 5 } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: '请指定练习主题' });
    }

    const prompt = `请生成 ${count} 个关于"${topic}"的数学练习题，难度为${difficulty}。

请按照以下 JSON 格式返回：
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "exercises": [
    {
      "id": 1,
      "question": "问题内容",
      "hint": "提示（可选）",
      "answer": "答案",
      "explanation": "详细解答"
    }
  ]
}`;

    const result = await geminiService.generateContent('gemini-pro', [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ], {
      temperature: 0.5,
      maxOutputTokens: 2000
    });

    try {
      const text = result.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const exercises = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
      
      res.json({
        success: true,
        data: exercises
      });
    } catch (parseError) {
      throw new Error('生成练习题失败');
    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;