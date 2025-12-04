
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MathTopic, Difficulty, Question } from '../types';
import { generateMathProblem } from '../services/geminiService';

interface QuizViewProps {
  topic: MathTopic;
  difficulty: Difficulty;
  mode: 'CLASSIC' | 'STORY';
  onExit: () => void;
  onCorrectAnswer: (points: number) => void;
  onWrongAnswer: (question: Question, wrongAnswer: string) => void;
}

const LOADING_TIPS = [
  "正在召唤数学精灵...",
  "猫头鹰博士正在翻阅奥数秘籍...",
  "困难题目需要更多脑细胞...",
  "你知道吗？0 是唯一不能作为除数的数字。",
  "正在计算星体运行轨迹...",
  "加载高难度逻辑模块...",
];

export const QuizView: React.FC<QuizViewProps> = ({ topic, difficulty, mode, onExit, onCorrectAnswer, onWrongAnswer }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTip, setLoadingTip] = useState(LOADING_TIPS[0]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  
  // Rotate loading tips
  useEffect(() => {
    let interval: number;
    if (loading) {
      setLoadingTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
      interval = window.setInterval(() => {
        setLoadingTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Local generator for "Classic" mode
  const generateClassicQuestion = useCallback((): Question => {
    // Helper to generate options
    const generateOptions = (answer: string | number, type: 'number' | 'ratio' = 'number') => {
      const opts = new Set<string>();
      opts.add(answer.toString());
      
      let attempts = 0;
      let rangeMultiplier = 1;

      // Safety break after 50 attempts to prevent hanging
      while(opts.size < 4 && attempts < 50) {
        attempts++;
        if (type === 'number') {
           const numAns = parseFloat(answer.toString());
           
           // Dynamic variance: strict at first, wider if struggling
           let variance = 0.5;
           if (difficulty === Difficulty.HARD) variance = 0.1 * rangeMultiplier; 
           if (difficulty === Difficulty.MEDIUM) variance = 0.25 * rangeMultiplier;
           if (rangeMultiplier > 5) variance = 2.0; // Fallback to wide range

           // Calculate offset
           const randomFactor = Math.random();
           const sign = randomFactor < 0.5 ? -1 : 1;
           // Ensure minimum offset of 1 for integers
           const minOffset = numAns === 0 ? 1 : Math.max(0.1, Math.abs(numAns * 0.05));
           const offset = sign * (Math.random() * (Math.abs(numAns) * variance) + minOffset);
           
           // Round appropriately
           let val: number;
           if (Number.isInteger(numAns)) {
             val = Math.round(numAns + offset);
             if (val === numAns) val = numAns + (randomFactor < 0.5 ? 1 : -1);
           } else {
             val = Math.round((numAns + offset) * 100) / 100;
           }
           
           // Avoid negative distractors for primary school unless answer is negative
           if (val >= 0 || numAns < 0) opts.add(val.toString());
        } else if (type === 'ratio') {
           const parts = answer.toString().split(':');
           if (parts.length === 2) {
             const [a, b] = parts.map(Number);
             // Generate wrong ratios
             const methods = [
                 () => `${a}:${b + (Math.random() < 0.5 ? 1 : -1) * Math.ceil(Math.random() * 2 * rangeMultiplier)}`, // Change consequent
                 () => `${a + (Math.random() < 0.5 ? 1 : -1) * Math.ceil(Math.random() * 2 * rangeMultiplier)}:${b}`, // Change antecedent
                 () => `${b}:${a}`, // Inverse
                 () => `${a+1}:${b+1}` // Add to both
             ];
             const method = methods[attempts % methods.length];
             const res = method();
             // Basic validation regex for ratio
             if (/^\d+:\d+$/.test(res)) opts.add(res);
           }
        }
        
        // Widen search range if we are stuck finding options
        if (attempts % 5 === 0) rangeMultiplier++;
      }
      
      // Absolute Fallback: fill with random numbers if logic failed
      while(opts.size < 4) {
          const numAns = parseFloat(answer.toString()) || 10;
          const randomVal = Math.floor(numAns + (Math.random() * 20 - 10)) + (opts.size + 1);
          opts.add(randomVal > 0 ? randomVal.toString() : (randomVal + 20).toString());
      }
      
      return Array.from(opts).sort(() => Math.random() - 0.5);
    };

    let text = '', answer = '', expl = '';
    
    // --- CALCULATION LOGIC ---
    if (topic === MathTopic.CALCULATION) {
      if (difficulty === Difficulty.EASY) {
        // Grades 3-4: 3-digit +/- and 2-digit *
        const op = Math.floor(Math.random() * 3);
        if (op === 0) { // Add
          const n1 = Math.floor(Math.random() * 800) + 100;
          const n2 = Math.floor(Math.random() * 800) + 100;
          text = `${n1} + ${n2} = ?`; answer = (n1 + n2).toString();
        } else if (op === 1) { // Sub
          const n1 = Math.floor(Math.random() * 900) + 200;
          const n2 = Math.floor(Math.random() * (n1 - 100)) + 50;
          text = `${n1} - ${n2} = ?`; answer = (n1 - n2).toString();
        } else { // Mul 2d * 1d or simple 2d*2d
          const n1 = Math.floor(Math.random() * 90) + 10;
          const n2 = Math.floor(Math.random() * 9) + 2;
          text = `${n1} × ${n2} = ?`; answer = (n1 * n2).toString();
        }
        expl = "仔细进行列竖式计算。";
      } else if (difficulty === Difficulty.MEDIUM) {
        // Grades 5-6: Mixed ops, brackets, decimals in calc
        const type = Math.random();
        if (type < 0.3) { // 2d * 2d
           const n1 = Math.floor(Math.random() * 40) + 11;
           const n2 = Math.floor(Math.random() * 40) + 11;
           text = `${n1} × ${n2} = ?`; answer = (n1*n2).toString();
        } else if (type < 0.6) { // Mixed with brackets: 12 + 4 * (10 - 2)
           const n1 = Math.floor(Math.random() * 20) + 10;
           const n2 = Math.floor(Math.random() * 5) + 2;
           const sub1 = Math.floor(Math.random() * 20) + 10;
           const sub2 = sub1 - (Math.floor(Math.random() * 8) + 2);
           text = `${n1} + ${n2} × (${sub1} - ${sub2}) = ?`; 
           answer = (n1 + n2 * (sub1 - sub2)).toString();
           expl = "先算括号里面的减法，再算乘法，最后算加法。";
        } else { // Decimal Addition
           const n1 = parseFloat((Math.random() * 100).toFixed(2));
           const n2 = parseFloat((Math.random() * 50).toFixed(2));
           text = `${n1} + ${n2} = ?`; answer = (n1 + n2).toFixed(2);
           expl = "小数点对齐，从最低位算起。";
        }
      } else {
        // HARD: Competition / Clever Calculation (巧算)
        const type = Math.random();
        if (type < 0.4) { // Distribution law: 25 * 44 = 25 * 4 * 11
           text = `25 × 44 = ?`; 
           answer = (1100).toString();
           expl = "巧算思路：25 × 44 = 25 × 4 × 11 = 100 × 11 = 1100";
        } else if (type < 0.7) { // 125 * 88
           text = `125 × 88 = ?`;
           answer = (11000).toString();
           expl = "巧算思路：125 × 88 = 125 × 8 × 11 = 1000 × 11 = 11000";
        } else { // Series logic: 1+2+...+n
           const n = Math.floor(Math.random() * 10) + 20; // 20 to 30
           text = `1 + 2 + 3 + ... + ${n} = ?`;
           answer = ((1 + n) * n / 2).toString();
           expl = `等差数列求和公式：(首项 + 末项) × 项数 ÷ 2。即 (1 + ${n}) × ${n} ÷ 2`;
        }
      }
    } 
    // --- DECIMALS LOGIC ---
    else if (topic === MathTopic.DECIMALS) {
       if (difficulty === Difficulty.EASY) {
         // Grade 3-4: Simple decimal add/sub
         const n1 = parseFloat((Math.floor(Math.random() * 100)/10).toFixed(1)); 
         const n2 = parseFloat((Math.floor(Math.random() * 50)/10).toFixed(1));
         text = `${n1} + ${n2} = ?`; answer = (n1+n2).toFixed(1);
       } else if (difficulty === Difficulty.MEDIUM) {
         // Grade 5-6: Decimal Mul/Div
         const n1 = parseFloat((Math.random() * 10).toFixed(1));
         const n2 = parseFloat((Math.random() * 5).toFixed(1));
         text = `${n1} × ${n2} = ?`; answer = (n1 * n2).toFixed(2);
         expl = "两个一位小数相乘，积通常是两位小数。";
       } else {
         // Competition: Clever calc with decimals
         // 1.25 * 32
         text = `1.25 × 32 = ?`; answer = "40";
         expl = "巧算：1.25 × 8 × 4 = 10 × 4 = 40";
       }
    }
    // --- EQUATIONS LOGIC ---
    else if (topic === MathTopic.EQUATIONS) {
      const x = Math.floor(Math.random() * 10) + 2;
      if (difficulty === Difficulty.EASY) {
        // Gr 3-4: Very simple placeholder
        const a = Math.floor(Math.random() * 10) + 1;
        const b = x + a;
        text = `x + ${a} = ${b}, x = ?`; answer = x.toString();
        expl = `利用加法交换律：x = ${b} - ${a}`;
      } else if (difficulty === Difficulty.MEDIUM) {
        // Gr 5-6: ax + b = c
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = a * x + b;
        text = `${a}x + ${b} = ${c}, x = ?`; answer = x.toString();
        expl = `先把 ${b} 移到右边，变成 ${a}x = ${c - b}，再除以 ${a}`;
      } else {
        // Competition: 5x + 3x = 64 OR 3(x+2) = 2(x+5)
        // Let's do like terms combination
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 5) + 2;
        const sum = (a + b) * x;
        text = `${a}x + ${b}x = ${sum}, x = ?`; answer = x.toString();
        expl = `利用乘法分配律逆运算：(${a} + ${b})x = ${sum}，即 ${a+b}x = ${sum}`;
      }
    }
    // --- RATIO LOGIC ---
    else if (topic === MathTopic.RATIO) {
       if (difficulty === Difficulty.EASY) {
         // Gr 3-4 (Maybe too early, but simple logic): 1:2 = 2:?
         const a = Math.floor(Math.random() * 5) + 1;
         const b = Math.floor(Math.random() * 5) + 1;
         const k = 2;
         text = `${a} : ${b} = ${a*k} : ?, ? = ?`; answer = (b*k).toString();
       } else if (difficulty === Difficulty.MEDIUM) {
         // Gr 5-6: Solving Proportions
         const x = Math.floor(Math.random() * 10) + 2;
         const a = Math.floor(Math.random() * 5) + 2;
         const b = Math.floor(Math.random() * 5) + 10;
         // a : x = b : ? (Wait, x is unknown).
         // 3 : 5 = 6 : x
         const n1 = 3, n2 = 5, n3 = 6;
         text = `${n1} : ${n2} = ${n3} : x, x = ?`; answer = (n2 * n3 / n1).toString();
         expl = "内项之积等于外项之积。";
       } else {
         // Competition: Logic ratio
         text = "若 A:B = 2:3，B:C = 3:4，则 A:C = ?";
         answer = "1:2";
         expl = "因为 B 在两个比中份数相同(都是3)，直接合并：A:B:C = 2:3:4。所以 A:C = 2:4 = 1:2";
       }
    }
    // Fallback
    else {
        const n1 = Math.floor(Math.random() * 20);
        text = `${n1} + 1 = ?`; answer = (n1+1).toString();
    }

    return {
      id: Date.now().toString(),
      text,
      options: generateOptions(answer, topic === MathTopic.RATIO ? 'ratio' : 'number'),
      correctAnswer: answer,
      explanation: expl,
      isAiGenerated: false,
      topic: topic
    };
  }, [topic, difficulty]);

  const loadQuestion = useCallback(async () => {
    setLoading(true);
    setSelectedOption(null);
    setIsCorrect(null);
    setFeedback('');

    if (mode === 'STORY') {
      try {
        const q = await generateMathProblem(topic, difficulty);
        q.topic = topic;
        setQuestion(q);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else {
      // Remove setTimeout for instant Classic mode
      const q = generateClassicQuestion();
      setQuestion(q);
      setLoading(false);
    }
  }, [mode, topic, difficulty, generateClassicQuestion]);

  useEffect(() => {
    loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (option: string) => {
    if (!question || selectedOption) return;
    
    setSelectedOption(option);
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setFeedback(question.isAiGenerated ? "真棒！你解决了这个难题！" : "回答正确！");
      onCorrectAnswer(question.isAiGenerated ? 20 : 10);
    } else {
      setFeedback(question.explanation || `正确答案是 ${question.correctAnswer}。`);
      onWrongAnswer(question, option);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onExit}
          className="bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 px-4 py-2 rounded-xl font-bold flex items-center shadow-sm transition-all"
        >
          <span className="mr-2">⬅</span> 退出
        </button>
        <div className="flex items-center space-x-2">
            <span className="text-sm font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full uppercase tracking-wider">
            {topic}
            </span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                difficulty === Difficulty.HARD ? 'bg-red-100 text-red-800' :
                difficulty === Difficulty.MEDIUM ? 'bg-amber-100 text-amber-800' :
                'bg-green-100 text-green-800'
            }`}>
            {difficulty}
            </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[400px] flex flex-col relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 p-6 text-center">
            <div className="text-6xl mb-6 animate-bounce">🤔</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">稍等片刻</h3>
            <p className="text-indigo-600 font-medium animate-pulse">{loadingTip}</p>
          </div>
        ) : question && (
          <div className="flex flex-col h-full">
            <div className={`p-8 ${question.isAiGenerated ? 'bg-indigo-50' : 'bg-white'} border-b border-slate-100 flex-grow flex items-center justify-center`}>
              <h2 className={`${question.isAiGenerated ? 'text-xl md:text-2xl leading-relaxed text-slate-700' : 'text-4xl md:text-5xl font-black text-slate-800'} text-center`}>
                {question.text}
              </h2>
            </div>

            <div className="p-6 bg-slate-50">
               <div className="grid grid-cols-2 gap-4">
                 {question.options?.map((opt, idx) => {
                   let btnClass = "bg-white hover:bg-indigo-50 border-2 border-indigo-100 text-indigo-600";
                   if (selectedOption === opt) {
                     btnClass = isCorrect 
                        ? "bg-green-500 border-green-600 text-white" 
                        : "bg-red-500 border-red-600 text-white";
                   } else if (selectedOption && opt === question.correctAnswer) {
                     btnClass = "bg-green-100 border-green-500 text-green-700 opacity-75";
                   } else if (selectedOption) {
                     btnClass = "bg-slate-100 border-slate-200 text-slate-400 opacity-50";
                   }

                   return (
                    <button
                      key={idx}
                      disabled={!!selectedOption}
                      onClick={() => handleAnswer(opt)}
                      className={`h-20 rounded-xl text-2xl font-bold shadow-sm transition-all transform ${!selectedOption && 'hover:-translate-y-1 hover:shadow-md'} ${btnClass}`}
                    >
                      {opt}
                    </button>
                   );
                 })}
               </div>
            </div>

            {selectedOption && (
              <div className={`p-6 border-t animate-fade-in ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-start space-x-4">
                   <div className={`text-4xl ${isCorrect ? 'animate-bounce' : ''}`}>
                     {isCorrect ? '🎉' : '🤔'}
                   </div>
                   <div className="flex-grow">
                     <h4 className={`font-bold text-lg ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                       {isCorrect ? '太棒了!' : '不太对哦。'}
                     </h4>
                     <p className="text-slate-600 mt-1">{feedback}</p>
                     {!isCorrect && (
                       <p className="text-xs text-rose-500 mt-1 font-bold">已加入错题本</p>
                     )}
                   </div>
                   <button
                    onClick={loadQuestion}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg"
                   >
                     下一题 ➡
                   </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
