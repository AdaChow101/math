"use strict";
const express = require('express');
const router = express.Router();
const geminiService = require('../service/gemini');
router.post('/', async (req, res, next) => {
    try {
        const { message, history = [] } = req.body;
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: '请输入消息' });
        }
        console.log(`💬 处理对话: ${message.substring(0, 100)}...`);
        const startTime = Date.now();
        const response = await geminiService.chatWithAI(message, history);
        const processingTime = Date.now() - startTime;
        res.json({
            success: true,
            data: {
                message: response,
                timestamp: new Date().toISOString(),
                processingTime: `${processingTime}ms`
            }
        });
    }
    catch (error) {
        console.error('对话错误:', error);
        next(error);
    }
});
module.exports = router;
//# sourceMappingURL=chat.js.map