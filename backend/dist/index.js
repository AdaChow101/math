"use strict";
// 强制加载 backend/server 目录下的 .env 文件（和 index.js 同级）
const dotenv = require('dotenv');
const envPath = require('path').resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });
// 打印调试信息（帮你确认是否加载成功）
if (result.error) {
    console.error('❌ .env 文件加载失败：', result.error.message);
}
else {
    console.log('✅ .env 文件加载成功！路径：', envPath);
    console.log('✅ 读取到的配置：', result.parsed);
}
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
// 导入路由
const mathRoutes = require('./routes/math');
const visionRoutes = require('./routes/vision');
const chatRoutes = require('./routes/chat');
const app = express();
const PORT = process.env.PORT || 3001;
// 安全中间件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// 压缩中间件
app.use(compression());
// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP限制100个请求
    message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);
// 日志中间件
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// CORS配置
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL,
        process.env.VERCEL_URL,
        'https://math-ai-academy.vercel.app',
        'http://localhost:3000'
    ].filter(Boolean),
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// 解析请求体
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// API路由
app.use('/api/math', mathRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/chat', chatRoutes);
// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Math AI Tutor API',
        environment: process.env.NODE_ENV,
        version: '1.0.0'
    });
});
// 提供前端静态文件（生产环境）
if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../../frontend/dist');
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}
// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.originalUrl
    });
});
// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    const statusCode = err.status || 500;
    const message = err.message || 'Internal server error';
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
// 启动服务器
if (process.env.NODE_ENV !== 'production' || require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
        console.log(`📚 环境: ${process.env.NODE_ENV}`);
        console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
    });
}
module.exports = app;
//# sourceMappingURL=index.js.map