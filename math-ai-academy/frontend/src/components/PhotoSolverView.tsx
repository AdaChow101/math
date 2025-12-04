import React, { useState, useRef } from 'react';
import { solveMathFromImage } from '../services/geminiService';

interface PhotoSolverViewProps {
  onBack: () => void;
}

export const PhotoSolverView: React.FC<PhotoSolverViewProps> = ({ onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!image) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const solution = await solveMathFromImage(image);
      setResult(solution);
    } catch (error) {
      setResult("出错了，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setImage(null);
    setResult(null);
    // Reset file input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center mb-2 sticky top-0 bg-sky-50 z-10 py-2">
        <button 
          onClick={onBack}
          className="mr-4 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2 rounded-xl font-bold flex items-center transition-all shadow-sm hover:shadow-md"
        >
          <span className="mr-1">⬅</span> 返回
        </button>
        <h2 className="text-2xl font-bold text-slate-800">📷 拍照识题</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[400px] flex flex-col relative border-b-4 border-indigo-100">
        
        {!image ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 space-y-6">
            <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-indigo-100 mb-4 animate-bounce-short">
                <span className="text-6xl">📸</span>
            </div>
            <h3 className="text-xl font-bold text-slate-700 text-center">遇到难题了吗？<br/>拍下来，我教你！</h3>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 text-white w-full max-w-xs py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transform hover:-translate-y-1 transition-all"
            >
              拍照或上传图片
            </button>
            <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={handleFileChange}
                className="hidden" 
            />
            <p className="text-sm text-slate-400">支持小学数学计算、应用题和几何题</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Image Preview */}
            <div className="relative bg-slate-900 flex items-center justify-center p-4 max-h-[300px]">
                <img src={image} alt="Preview" className="max-h-[260px] max-w-full rounded-lg shadow-lg object-contain" />
                <button 
                    onClick={handleRetake}
                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm"
                >
                    ✕
                </button>
            </div>

            {/* Controls / Result */}
            <div className="flex-grow p-6 bg-slate-50 flex flex-col">
                {!result && !loading && (
                    <div className="flex flex-col items-center justify-center flex-grow space-y-4">
                        <p className="text-slate-600 font-bold">照片已就绪</p>
                        <button 
                            onClick={handleSolve}
                            className="bg-indigo-600 text-white w-full max-w-xs py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>✨ 开始解析</span>
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center flex-grow space-y-6 py-8">
                        <div className="flex space-x-2">
                            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce"></div>
                            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <p className="text-indigo-600 font-bold animate-pulse">正在识别题目并思考...</p>
                    </div>
                )}

                {result && (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-center space-x-2">
                             <span className="text-2xl">🦉</span>
                             <h3 className="font-bold text-lg text-slate-800">解析结果</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {result}
                        </div>
                        <button 
                            onClick={handleRetake}
                            className="w-full bg-white border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            再拍一题
                        </button>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
