"use strict";
const express = require('express');
const router = express.Router();
const geminiService = require('../service/gemini');
router.post('/ocr', async (req, res, next) => {
    try {
        const { image, question } = req.body;
        if (!image) {
            return res.status(400).json({ error: '请上传图片' });
        }
        console.log('📷 处理图片分析请求...');
        const startTime = Date.now();
        const analysis = await geminiService.analyzeImage(image, question);
        const processingTime = Date.now() - startTime;
        res.json({
            success: true,
            data: {
                analysis,
                imageInfo: {
                    size: Math.round(image.length * 0.75) / 1000 + 'KB',
                    processedIn: `${processingTime}ms`
                }
            }
        });
    }
    catch (error) {
        console.error('图片分析错误:', error);
        next(error);
    }
});
module.exports = router;
//# sourceMappingURL=vision.js.map