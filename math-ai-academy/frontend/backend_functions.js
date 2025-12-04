
/**
 * 这是一个后端代码示例，用于部署到 Firebase Cloud Functions。
 * 部署后，它将保护你的 API Key，并处理复杂的逻辑。
 * 
 * 部署步骤参考 PDF：
 * 1. firebase init functions
 * 2. npm install @google/genai express cors dotenv
 * 3. 将此文件内容适配到 functions/index.js
 */

const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenAI, Schema, Type } = require("@google/genai");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true })); // 允许跨域请求
app.use(express.json({ limit: '10mb' })); // 允许大图片上传

// 初始化 Gemini (API Key 从环境变量获取，绝对安全)
// 在 Firebase 中设置: firebase functions:config:set gemini.key="YOUR_KEY"
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- 1. 生成题目 API ---
app.post("/generateProblem", async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    
    const prompt = `请生成一道适合中国小学生的有趣数学应用题。
    知识点: ${topic}
    难度: ${difficulty}
    要求：提供中文题目、4个选项、正确答案和解析。`;

    // 定义 JSON Schema 保证返回格式
    const schema = {
        type: Type.OBJECT,
        properties: {
          problemText: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["problemText", "options", "correctAnswer", "explanation"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const data = JSON.parse(response.text);
    
    // 这里可以添加数据库逻辑：将题目存入 Firestore 题库
    // await admin.firestore().collection('questions').add(data);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate problem" });
  }
});

// --- 2. AI 辅导 API (非流式简化版) ---
app.post("/chatTutor", async (req, res) => {
  try {
    const { history, message } = req.body;
    
    // 可以在这里进行权限验证：检查用户是否是 VIP
    // if (!req.user.isVip) return res.status(403).send("Subscribe to chat");

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "你是猫头鹰博士（Dr. Owl），一位博学、幽默且擅长启发式教学的数学竞赛教练。不要直接给答案，要引导学生思考。",
      },
      history: history || []
    });

    const result = await chat.sendMessage({ message });
    res.json({ text: result.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chat failed" });
  }
});

// --- 3. 拍照识题 API ---
app.post("/solveImage", async (req, res) => {
  try {
    const { image } = req.body; // Base64 string
    const cleanBase64 = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: "请识别这张图片中的数学题目。提取题目内容，给出逐步解析，最后给出答案。使用中文。" }
        ]
      }
    });

    // 这里可以添加逻辑：记录用户拍了什么题，用于生成错题本推荐
    res.json({ text: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image processing failed" });
  }
});

// 导出为 Firebase Function
exports.api = onRequest(app);
