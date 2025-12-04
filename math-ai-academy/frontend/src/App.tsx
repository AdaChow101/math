import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { QuizView } from './components/QuizView';
import { TutorView } from './components/TutorView';
import { StatsView } from './components/StatsView';
import { NotebookView } from './components/NotebookView';
import { PhotoSolverView } from './components/PhotoSolverView';
import { AuthView } from './components/AuthView';
import { AppView, Difficulty, MathTopic, UserStats, Question, User } from './types';

// Initial stats structure
const initialStats: UserStats = {
  stars: 0,
  xp: 0,
  streak: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  recentScores: [],
  wrongQuestions: []
};

function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // App State
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [stats, setStats] = useState<UserStats>(initialStats);
  
  // Quiz configuration state
  const [quizConfig, setQuizConfig] = useState<{topic: MathTopic, difficulty: Difficulty, mode: 'CLASSIC' | 'STORY'} | null>(null);

  // Load User on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mq_current_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Load Stats when User Changes
  useEffect(() => {
    if (currentUser) {
      const savedStats = localStorage.getItem(`mq_stats_${currentUser.id}`);
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        // Ensure new field exists for migration
        if (!parsed.wrongQuestions) parsed.wrongQuestions = [];
        setStats(parsed);
      } else {
        setStats(initialStats);
      }
    } else {
      setStats(initialStats); // Reset if logged out
    }
  }, [currentUser]);

  // Save Stats whenever they change (only if user is logged in)
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`mq_stats_${currentUser.id}`, JSON.stringify(stats));
    }
  }, [stats, currentUser]);

  const handleLogin = (user: User) => {
    localStorage.setItem('mq_current_user', JSON.stringify(user));
    setCurrentUser(user);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    localStorage.removeItem('mq_current_user');
    setCurrentUser(null);
    setCurrentView(AppView.AUTH); // Will default to showing Auth due to !currentUser check
  };

  const handleStartQuiz = (topic: MathTopic, difficulty: Difficulty, mode: 'CLASSIC' | 'STORY') => {
    setQuizConfig({ topic, difficulty, mode });
    setCurrentView(AppView.QUIZ);
  };

  const handleCorrectAnswer = (points: number) => {
    const today = new Date().toLocaleDateString('zh-CN', { weekday: 'short' });
    
    setStats(prev => {
      const newRecentScores = [...prev.recentScores];
      const lastEntry = newRecentScores[newRecentScores.length - 1];
      
      if (lastEntry && lastEntry.date === today) {
        lastEntry.score += points;
      } else {
        newRecentScores.push({ date: today, score: points });
      }

      return {
        ...prev,
        stars: prev.stars + 1,
        xp: prev.xp + points,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: prev.correctAnswers + 1,
        recentScores: newRecentScores
      };
    });
  };

  const handleWrongAnswer = (question: Question, wrongAnswer: string) => {
    setStats(prev => {
      if (prev.wrongQuestions.some(q => q.id === question.id)) return prev;

      const wrongQ: Question = {
        ...question,
        userAnswer: wrongAnswer,
        wrongDate: new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      };

      return {
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        wrongQuestions: [wrongQ, ...prev.wrongQuestions]
      };
    });
  };

  const handleRemoveWrongQuestion = (id: string) => {
    setStats(prev => ({
      ...prev,
      wrongQuestions: prev.wrongQuestions.filter(q => q.id !== id)
    }));
  };

  // If not logged in, show Auth View
  if (!currentUser) {
    return <AuthView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard 
            onStartQuiz={handleStartQuiz} 
            onNavigate={setCurrentView} 
            wrongQuestionsCount={stats.wrongQuestions.length}
          />
        );
      case AppView.QUIZ:
        return quizConfig ? (
          <QuizView 
            topic={quizConfig.topic} 
            difficulty={quizConfig.difficulty} 
            mode={quizConfig.mode}
            onExit={() => setCurrentView(AppView.DASHBOARD)}
            onCorrectAnswer={handleCorrectAnswer}
            onWrongAnswer={handleWrongAnswer}
          />
        ) : <Dashboard onStartQuiz={handleStartQuiz} onNavigate={setCurrentView} wrongQuestionsCount={stats.wrongQuestions.length} />;
      case AppView.TUTOR:
        return <TutorView onBack={() => setCurrentView(AppView.DASHBOARD)} />;
      case AppView.PHOTO_SOLVER:
        return <PhotoSolverView onBack={() => setCurrentView(AppView.DASHBOARD)} />;
      case AppView.NOTEBOOK:
        return (
          <NotebookView 
            wrongQuestions={stats.wrongQuestions} 
            onRemoveQuestion={handleRemoveWrongQuestion}
            onBack={() => setCurrentView(AppView.DASHBOARD)}
          />
        );
      case AppView.STATS:
        return <StatsView stats={stats} onBack={() => setCurrentView(AppView.DASHBOARD)} />;
      default:
        return <Dashboard onStartQuiz={handleStartQuiz} onNavigate={setCurrentView} wrongQuestionsCount={stats.wrongQuestions.length} />;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView} stats={stats} user={currentUser} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
}

export default App;