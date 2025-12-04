#!/bin/bash

# 创建项目结构
mkdir -p frontend/src/{components,services,utils,hooks,types,styles,assets/{icons,images,fonts}}
mkdir -p backend/{server/{src/{controllers,routes,services,middleware,utils,types},dist},routes,services,middleware,utils}

# 创建关键文件
touch frontend/src/App.tsx frontend/src/main.tsx frontend/package.json frontend/vite.config.ts
touch backend/server/index.js backend/package.json

# 创建环境文件
echo "PORT=3001" > backend/.env
echo "GEMINI_API_KEY=your_api_key_here" >> backend/.env
echo "NODE_ENV=development" >> backend/.env

echo "VITE_API_URL=http://localhost:3001/api" > frontend/.env.local
echo "VITE_APP_NAME=数学探索学院" >> frontend/.env.local

# 创建配置文件
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/server/index.js" },
    { "src": "/(.*)", "dest": "/frontend/dist/$1" }
  ]
}
EOF

echo "✅ 项目结构创建完成！"
echo "📁 前端: frontend/"
echo "📁 后端: backend/"
echo "⚙️  请配置后端 .env 文件中的 GEMINI_API_KEY"