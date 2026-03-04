/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  GraduationCap, 
  Trophy, 
  Moon, 
  Sun, 
  ChevronRight, 
  ChevronLeft,
  Phone,
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  History,
  Shield,
  Map,
  TrendingUp,
  FileText,
  Users,
  Music,
  LayoutGrid,
  Flag,
  Globe,
  Menu,
  X,
  Languages,
  Camera,
  Waves,
  Droplets,
  Mountain,
  Landmark,
  Church,
  Leaf,
  Zap,
  School,
  UserCheck,
  Factory,
  Plane,
  Handshake,
  Gavel,
  Trees,
  MessageSquare,
  Settings,
  LogIn,
  LogOut,
  Send,
  Trash2,
  Edit2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { infoCategories } from './data/infoData';
import { mcqQuestions } from './data/mcqData';
import { Question, InfoCategory, ExamResult, LeaderboardEntry, User, UserComment } from './types';
import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

const ICON_MAP: Record<string, any> = {
  History,
  Shield,
  Map,
  TrendingUp,
  FileText,
  Users,
  Music,
  LayoutGrid,
  Flag,
  Globe,
  GraduationCap,
  Trophy,
  Camera,
  Waves,
  Droplets,
  Mountain,
  Landmark,
  Church,
  Leaf,
  Zap,
  School,
  UserCheck,
  Factory,
  Plane,
  Handshake,
  Gavel,
  Trees,
  MessageSquare,
  Settings,
  ExternalLink
};

const RESOURCES = [
  { id: 'gov', title: 'Government Portal', titleBn: 'বাংলাদেশ সরকার', url: 'https://bangladesh.gov.bd', icon: Globe, desc: 'National portal of Bangladesh', descBn: 'বাংলাদেশ জাতীয় তথ্য বাতায়ন' },
  { id: 'edu', title: 'Education Board', titleBn: 'শিক্ষা বোর্ড', url: 'http://www.educationboard.gov.bd', icon: GraduationCap, desc: 'Official education board results', descBn: 'অফিসিয়াল শিক্ষা বোর্ড ফলাফল' },
  { id: 'passport', title: 'E-Passport', titleBn: 'ই-পাসপোর্ট', url: 'https://www.epassport.gov.bd', icon: FileText, desc: 'Online passport application', descBn: 'অনলাইন পাসপোর্ট আবেদন' },
  { id: 'nid', title: 'NID Services', titleBn: 'এনআইডি সেবা', url: 'https://services.nidw.gov.bd', icon: UserCheck, desc: 'National ID card services', descBn: 'জাতীয় পরিচয়পত্র সেবা' },
  { id: 'emergency', title: 'Emergency (999)', titleBn: 'জরুরি সেবা (৯৯৯)', url: 'tel:999', icon: Phone, desc: 'National emergency helpline', descBn: 'জাতীয় জরুরি সেবা' },
  { id: 'health', title: 'Health (16263)', titleBn: 'স্বাস্থ্য বাতায়ন (১৬২৬৩)', url: 'tel:16263', icon: Phone, desc: 'Government health helpline', descBn: 'সরকারি স্বাস্থ্য বাতায়ন' },
  { id: 'women', title: 'Women/Child (109)', titleBn: 'নারী ও শিশু (১০৯)', url: 'tel:109', icon: Phone, desc: 'Women & child help line', descBn: 'নারী ও শিশু সহায়তা লাইন' },
  { id: 'legal', title: 'Legal Aid (16430)', titleBn: 'আইনি সহায়তা (১৬৪৩০)', url: 'tel:16430', icon: Phone, desc: 'National legal aid services', descBn: 'জাতীয় আইনি সহায়তা সেবা' },
];

const RenderSections = ({ sections, lang }: { sections: any[], lang: Language }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
    {sections.map((sec, sIdx) => (
      <div key={sIdx} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 col-span-full">
        <h5 className="font-bold mb-2 text-bd-red">{lang === 'en' ? sec.title : sec.titleBn}</h5>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mb-2">{lang === 'en' ? sec.content : sec.contentBn}</p>
        {sec.sections && <RenderSections sections={sec.sections} lang={lang} />}
      </div>
    ))}
  </div>
);

const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    let totalMiliseconds = 1000;
    let incrementTime = totalMiliseconds / end;
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count}</span>;
};

type Language = 'en' | 'bn';

const UI_STRINGS = {
  en: {
    appTitle: 'Bangladesh Hub',
    infoHub: 'Info Hub',
    examSystem: 'Exam System',
    leaderboard: 'Leaderboard',
    discover: 'Discover',
    bangladesh: 'Bangladesh',
    heroDesc: 'Explore the rich history, culture, and achievements of the People\'s Republic of Bangladesh through our comprehensive information hub.',
    searchPlaceholder: 'Search history, geography, economy...',
    learnMore: 'Learn More',
    backToCategories: 'Back to Categories',
    mcqTitle: 'MCQ Exam System',
    mcqDesc: 'Test your knowledge about Bangladesh. 20 questions, 20 minutes.',
    questions: 'Questions',
    time: 'Time',
    passMark: 'Pass Mark',
    negative: 'Negative',
    startExam: 'Start Examination',
    examResults: 'Exam Results',
    score: 'Score',
    wrong: 'Wrong',
    accuracy: 'Accuracy',
    tryAgain: 'Try Again',
    exit: 'Exit',
    detailedReview: 'Detailed Review',
    explanation: 'Explanation',
    finish: 'Finish',
    previous: 'Previous',
    next: 'Next Question',
    finishExam: 'Finish Exam',
    globalLeaderboard: 'Global Leaderboard',
    topPerformers: 'Top performers in the Bangladesh MCQ Challenge',
    rank: 'Rank',
    user: 'User',
    date: 'Date',
    noRecords: 'No records found. Be the first to take the exam!',
    footerDesc: 'Dedicated to preserving and sharing the rich heritage of Bangladesh.',
    rights: 'All rights reserved.',
    feedback: 'Feedback',
    admin: 'Admin',
    login: 'Login',
    logout: 'Logout',
    enterName: 'Enter Your Name',
    submit: 'Submit',
    comments: 'Comments',
    shareExperience: 'Share Your Experience',
    writeComment: 'Write a comment...',
    reply: 'Reply',
    delete: 'Delete',
    edit: 'Edit',
    adminPanel: 'Admin Panel',
    results: 'Results',
    noComments: 'No comments yet. Be the first to share!'
  },
  bn: {
    appTitle: 'বাংলাদেশ হাব',
    infoHub: 'তথ্য ভাণ্ডার',
    examSystem: 'পরীক্ষা পদ্ধতি',
    leaderboard: 'লিডারবোর্ড',
    discover: 'বাংলাদেশ সম্পর্কে',
    bangladesh: 'জানুন',
    heroDesc: 'আমাদের তথ্য ভাণ্ডারের মাধ্যমে গণপ্রজাতন্ত্রী বাংলাদেশের সমৃদ্ধ ইতিহাস, সংস্কৃতি এবং অর্জনগুলো অন্বেষণ করুন।',
    searchPlaceholder: 'ইতিহাস, ভূগোল, অর্থনীতি খুঁজুন...',
    learnMore: 'আরও জানুন',
    backToCategories: 'ক্যাটাগরিতে ফিরে যান',
    mcqTitle: 'MCQ পরীক্ষা পদ্ধতি',
    mcqDesc: 'বাংলাদেশ সম্পর্কে আপনার জ্ঞান যাচাই করুন। ২০টি প্রশ্ন, ২০ মিনিট।',
    questions: 'প্রশ্ন',
    time: 'সময়',
    passMark: 'পাস মার্ক',
    negative: 'নেগেটিভ',
    startExam: 'পরীক্ষা শুরু করুন',
    examResults: 'পরীক্ষার ফলাফল',
    score: 'স্কোর',
    wrong: 'ভুল',
    accuracy: 'সঠিকতা',
    tryAgain: 'আবার চেষ্টা করুন',
    exit: 'প্রস্থান',
    detailedReview: 'বিস্তারিত পর্যালোচনা',
    explanation: 'ব্যাখ্যা',
    finish: 'শেষ করুন',
    previous: 'পূর্ববর্তী',
    next: 'পরবর্তী প্রশ্ন',
    finishExam: 'পরীক্ষা শেষ করুন',
    globalLeaderboard: 'গ্লোবাল লিডারবোর্ড',
    topPerformers: 'বাংলাদেশ MCQ চ্যালেঞ্জের শীর্ষ পারফর্মাররা',
    rank: 'র‍্যাঙ্ক',
    user: 'ব্যবহারকারী',
    date: 'তারিখ',
    noRecords: 'কোন রেকর্ড পাওয়া যায়নি। প্রথম পরীক্ষাটি আপনিই দিন!',
    footerDesc: 'বাংলাদেশের সমৃদ্ধ ঐতিহ্য সংরক্ষণ ও শেয়ার করার জন্য নিবেদিত।',
    rights: 'সর্বস্বত্ব সংরক্ষিত।',
    feedback: 'মতামত',
    admin: 'অ্যাডমিন',
    login: 'লগইন',
    logout: 'লগআউট',
    enterName: 'আপনার নাম লিখুন',
    submit: 'জমা দিন',
    comments: 'মন্তব্য',
    shareExperience: 'আপনার অভিজ্ঞতা শেয়ার করুন',
    writeComment: 'একটি মন্তব্য লিখুন...',
    reply: 'উত্তর দিন',
    delete: 'মুছে ফেলুন',
    edit: 'সম্পাদনা',
    adminPanel: 'অ্যাডমিন প্যানেল',
    results: 'ফলাফল',
    noComments: 'এখনও কোন মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন!'
  }
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'info' | 'mcq' | 'leaderboard' | 'feedback' | 'admin'>('info');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InfoCategory | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);

  const t = UI_STRINGS[lang];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh by reloading the page or re-fetching data
    // For a real web app, window.location.reload() is the most direct way to "refresh"
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Pull to refresh logic
  useEffect(() => {
    let startY = 0;
    const threshold = 150;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].pageY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && startY > 0) {
        const currentY = e.touches[0].pageY;
        const diff = currentY - startY;
        if (diff > 0) {
          setPullProgress(Math.min(diff / threshold, 1.2));
          if (diff > 10) {
            // Prevent default scroll if we are pulling
            if (e.cancelable) e.preventDefault();
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullProgress >= 1) {
        handleRefresh();
      }
      setPullProgress(0);
      startY = 0;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullProgress]);

  // MCQ State
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [examType, setExamType] = useState<20 | 30>(20);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  // Leaderboard & Admin State
  const [leaderboard20, setLeaderboard20] = useState<LeaderboardEntry[]>([]);
  const [leaderboard30, setLeaderboard30] = useState<LeaderboardEntry[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<20 | 30>(20);
  const [allResults, setAllResults] = useState<ExamResult[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [isFirestoreUnavailable, setIsFirestoreUnavailable] = useState(false);

  // Sync activeTab with URL
  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const tab = parts[0];
    if (['info', 'mcq', 'leaderboard', 'feedback', 'admin'].includes(tab)) {
      setActiveTab(tab as any);
      if (tab === 'info' && parts[1]) {
        const cat = infoCategories.find(c => c.id === parts[1]);
        if (cat) setSelectedCategory(cat);
        else setSelectedCategory(null);
      } else {
        setSelectedCategory(null);
      }
    } else {
      setActiveTab('info');
      setSelectedCategory(null);
    }
  }, [location]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    navigate(`/${tab}`);
    setIsMenuOpen(false);
  };

  // Firebase Real-time Listeners
  useEffect(() => {
    // Results Listener
    const resultsQuery = query(collection(db, 'results'), orderBy('score', 'desc'));
    const unsubscribeResults = onSnapshot(resultsQuery, (snapshot) => {
      setIsFirestoreUnavailable(false);
      const resultsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExamResult[];
      
      setAllResults(resultsData);
      
      // Process Leaderboards
      const processLeaderboard = (count: number) => {
        const filtered = resultsData.filter(r => r.totalQuestions === count);
        const userBestScores: Record<string, LeaderboardEntry> = {};
        filtered.forEach(r => {
          if (!userBestScores[r.userName] || 
              r.score > userBestScores[r.userName].score || 
              (r.score === userBestScores[r.userName].score && r.timeSpent < userBestScores[r.userName].timeSpent)) {
            userBestScores[r.userName] = {
              userName: r.userName,
              score: r.score,
              date: r.date,
              questionCount: r.totalQuestions,
              timeSpent: r.timeSpent
            };
          }
        });
        return Object.values(userBestScores)
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timeSpent - b.timeSpent;
          })
          .slice(0, 50); // Show more in leaderboard
      };

      setLeaderboard20(processLeaderboard(20));
      setLeaderboard30(processLeaderboard(30));
    }, (error) => {
      console.error('Results listener error:', error);
      if (error.code === 'permission-denied') {
        console.warn('Firestore permission denied. Please check your Security Rules.');
      } else if (error.code === 'unavailable') {
        setIsFirestoreUnavailable(true);
      }
    });

    // Comments Listener
    const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      setIsFirestoreUnavailable(false);
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserComment[];
      setComments(commentsData);
    }, (error) => {
      console.error('Comments listener error:', error);
      if (error.code === 'permission-denied') {
        console.warn('Firestore permission denied. Please check your Security Rules.');
      } else if (error.code === 'unavailable') {
        setIsFirestoreUnavailable(true);
      }
    });

    return () => {
      unsubscribeResults();
      unsubscribeComments();
    };
  }, []);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const isDark = savedMode === null ? true : savedMode === 'true';
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    if (savedMode === null) localStorage.setItem('darkMode', 'true');

    const savedLang = localStorage.getItem('lang') as Language;
    if (savedLang) setLang(savedLang);

    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = () => {
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setLoginError(lang === 'en' ? 'Please enter a valid email address' : 'অনুগ্রহ করে একটি সঠিক ইমেল ঠিকানা দিন');
      return;
    }
    const adminEmails = ['mdsadmansaif8899@gmail.com', 'mdsadmansaifarnob@gmail.com'];
    const isAdmin = adminEmails.includes(loginEmail.toLowerCase());
    
    const newUser: User = {
      email: loginEmail,
      name: loginEmail.split('@')[0],
      isAdmin: isAdmin
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setShowLogin(false);
    setLoginEmail('');
    setLoginError('');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    if (activeTab === 'admin') handleTabChange('info');
  };

  const handleCommentSubmit = async (content: string) => {
    const newComment = {
      userName: user?.name || userName || 'Anonymous',
      email: user?.email || '',
      content,
      date: new Date().toLocaleString(),
      timestamp: serverTimestamp()
    };
    try {
      await addDoc(collection(db, 'comments'), newComment);
    } catch (e) {
      console.error('Failed to post comment', e);
    }
  };

  const handleReply = async (commentId: string, reply: string) => {
    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        reply,
        replyDate: new Date().toLocaleString()
      });
    } catch (e) {
      console.error('Failed to reply', e);
    }
  };

  const handleDeleteResult = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'results', id));
    } catch (e) {
      console.error('Failed to delete result', e);
    }
  };

  const handleEditResult = async (id: string, newName: string, newScore: number) => {
    try {
      const resultRef = doc(db, 'results', id);
      await updateDoc(resultRef, {
        userName: newName,
        score: newScore
      });
    } catch (e) {
      console.error('Failed to edit result', e);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (e) {
      console.error('Failed to delete comment', e);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'bn' : 'en';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  // Info Hub Filtering
  const filteredCategories = useMemo(() => {
    return infoCategories.filter(cat => 
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.titleBn.includes(searchQuery) ||
      cat.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.contentBn.includes(searchQuery)
    );
  }, [searchQuery]);

  // Exam Logic
  const startExam = () => {
    if (!userName.trim()) {
      setShowNameInput(true);
      return;
    }
    const count = examType;
    const shuffled = [...mcqQuestions].sort(() => 0.5 - Math.random()).slice(0, count);
    setCurrentQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(count).fill(null));
    setTimeLeft(count === 20 ? 1200 : 1800); // 20m or 30m
    setIsExamStarted(true);
    setExamResult(null);
    setShowNameInput(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isExamStarted && timeLeft > 0 && !examResult) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isExamStarted && !examResult) {
      finishExam();
    }
    return () => clearInterval(timer);
  }, [isExamStarted, timeLeft, examResult]);

  const handleAnswer = (optionIndex: number) => {
    if (userAnswers[currentQuestionIndex] !== null) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const finishExam = async () => {
    const score = userAnswers.reduce((acc, ans, idx) => {
      return acc + (ans === currentQuestions[idx].correctAnswer ? 1 : 0);
    }, 0);

    const totalTime = examType === 20 ? 1200 : 1800;
    const result = {
      userName: userName || 'Anonymous',
      date: new Date().toLocaleDateString(),
      score,
      totalQuestions: currentQuestions.length,
      timeSpent: totalTime - timeLeft,
      answers: currentQuestions.map((q, idx) => ({
        questionId: q.id,
        selectedOption: userAnswers[idx],
        isCorrect: userAnswers[idx] === q.correctAnswer
      })),
      timestamp: serverTimestamp()
    };

    setExamResult(result as any);
    
    if (score >= currentQuestions.length * 0.8) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00AB66', '#F27D26', '#FFFFFF']
      });
    }

    try {
      await addDoc(collection(db, 'results'), result);
    } catch (e) {
      console.error('Failed to save result', e);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-bd-green/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-bd-red/10 blur-[120px] rounded-full" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-3xl max-w-md w-full space-y-8 shadow-2xl"
        >
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-bd-green rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-bd-green/20">
              <Flag className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Bangladesh Hub</h1>
            <p className="text-gray-500 dark:text-zinc-400">Please login to access the platform</p>
            {!import.meta.env.VITE_FIREBASE_API_KEY ? (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                ⚠️ <strong>Firebase Not Configured:</strong> Real-time features (Leaderboard/Comments) will not work until you add your Firebase API keys to the environment variables.
              </div>
            ) : isFirestoreUnavailable && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400">
                ⚠️ <strong>Connection Error:</strong> Could not reach the Firebase backend. Please check your internet connection or Firebase project status.
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  if (loginError) setLoginError('');
                }}
                placeholder="Enter your email"
                className={`w-full p-4 rounded-2xl border ${loginError ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800'} bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-bd-green/20 outline-none transition-all`}
              />
              {loginError && (
                <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{loginError}</p>
              )}
            </div>
            <button 
              onClick={handleLogin} 
              className="w-full bg-bd-green hover:bg-bd-green/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-bd-green/20 transition-all active:scale-[0.98]"
            >
              Login to Continue
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 text-center">
            <p className="text-xs text-gray-400">
              By logging in, you agree to our terms and conditions.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-bd-green/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-bd-red/10 blur-[120px] rounded-full" />
      </div>

      {/* Pull to Refresh Indicator */}
      <motion.div 
        style={{ height: pullProgress * 100, opacity: pullProgress }}
        className="fixed top-0 left-0 w-full flex items-center justify-center overflow-hidden z-[60] bg-bd-green/5 pointer-events-none"
      >
        <div className={`flex flex-col items-center gap-2 transition-transform ${pullProgress >= 1 ? 'scale-110 text-bd-red' : 'text-bd-green'}`}>
          <RotateCcw size={24} className={isRefreshing ? 'animate-spin' : ''} style={{ transform: `rotate(${pullProgress * 360}deg)` }} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {pullProgress >= 1 ? (lang === 'en' ? 'Release to Refresh' : 'রিফ্রেশ করতে ছেড়ে দিন') : (lang === 'en' ? 'Pull to Refresh' : 'রিফ্রেশ করতে টানুন')}
          </span>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10 dark:border-zinc-800/50">
        <div className="w-full px-4 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => handleTabChange('info')}>
              <div className="w-10 h-10 bg-bd-green rounded-lg flex items-center justify-center shadow-lg shadow-bd-green/20">
                <div className="w-5 h-5 bg-bd-red rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black bg-gradient-to-r from-bd-green to-bd-red bg-clip-text text-transparent leading-none">
                  {t.appTitle}
                </span>
                <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-zinc-500 mt-0.5">Official Portal</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-6">
              {[
                { id: 'info', label: t.infoHub, icon: BookOpen },
                { id: 'mcq', label: t.examSystem, icon: GraduationCap },
                { id: 'leaderboard', label: t.leaderboard, icon: Trophy },
                { id: 'feedback', label: t.feedback, icon: MessageSquare },
                ...(user?.isAdmin ? [{ id: 'admin', label: t.admin, icon: Settings }] : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-6 py-2.5 rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-bd-green/10 text-bd-green dark:text-bd-green font-bold shadow-sm' 
                      : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
              <div className="flex items-center gap-2 lg:gap-3 border-l border-gray-200 dark:border-zinc-800 pl-2 lg:pl-6">
                <button 
                  onClick={handleRefresh}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${isRefreshing ? 'animate-spin text-bd-red' : 'text-zinc-500'}`}
                  title={lang === 'en' ? 'Refresh Page' : 'পেজ রিফ্রেশ করুন'}
                >
                  <RotateCcw size={20} />
                </button>
                {user ? (
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-colors font-semibold text-sm"
                  >
                    <LogOut size={18} />
                    {t.logout}
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowLogin(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-semibold text-sm"
                  >
                    <LogIn size={18} />
                    {t.login}
                  </button>
                )}
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-semibold text-sm"
                >
                  <Languages size={18} />
                  {lang === 'en' ? 'বাংলা' : 'English'}
                </button>
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button 
                onClick={handleRefresh}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${isRefreshing ? 'animate-spin text-bd-red' : 'text-zinc-500'}`}
              >
                <RotateCcw size={20} />
              </button>
              <button 
                onClick={toggleLanguage}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Languages size={20} />
              </button>
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden glass border-t border-white/10 dark:border-zinc-800/50 p-6 space-y-4"
            >
              {[
                { id: 'info', label: t.infoHub, icon: BookOpen },
                { id: 'mcq', label: t.examSystem, icon: GraduationCap },
                { id: 'leaderboard', label: t.leaderboard, icon: Trophy },
                { id: 'feedback', label: t.feedback, icon: MessageSquare },
                ...(user?.isAdmin ? [{ id: 'admin', label: t.admin, icon: Settings }] : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-bd-green text-white shadow-lg shadow-bd-green/20' 
                      : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
              {!user ? (
                <button
                  onClick={() => { setShowLogin(true); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  <LogIn size={20} />
                  {t.login}
                </button>
              ) : (
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut size={20} />
                  {t.logout}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass p-8 rounded-3xl max-w-md w-full space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t.login}</h2>
                <button onClick={() => setShowLogin(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    placeholder="Enter your email"
                    className={`w-full p-3 rounded-xl border ${loginError ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800'} bg-white dark:bg-zinc-900 text-gray-900 dark:text-white`}
                  />
                  {loginError && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{loginError}</p>
                  )}
                </div>
                <button onClick={handleLogin} className="btn-primary w-full py-3">
                  {t.login}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center space-y-4 py-8">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  {lang === 'bn' ? (
                    <>
                      <span className="text-bd-green">বাংলাদেশ</span> সম্পর্কে জানুন
                    </>
                  ) : (
                    <>
                      {t.discover} <span className="text-bd-green">{t.bangladesh}</span>
                    </>
                  )}
                </h1>
                <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                  {t.heroDesc}
                </p>
              </div>

              {/* Categories Grid */}
              {!selectedCategory ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map((cat, idx) => {
                    const Icon = ICON_MAP[cat.icon] || BookOpen;
                    return (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => navigate(`/info/${cat.id}`)}
                        className={`glass p-5 md:p-6 rounded-3xl cursor-pointer hover:scale-[1.02] transition-all group border-2 ${
                          (cat.id === 'uprising-2024' || cat.id === 'liberation-war') 
                            ? 'border-bd-red/20 hover:border-bd-red/50 shadow-bd-red/5' 
                            : 'border-bd-green/20 hover:border-bd-green/50 shadow-bd-green/5'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                          (cat.id === 'uprising-2024' || cat.id === 'liberation-war')
                            ? 'bg-bd-red/10 text-bd-red group-hover:bg-bd-red group-hover:text-white' 
                            : 'bg-bd-green/10 text-bd-green group-hover:bg-bd-green group-hover:text-white'
                        }`}>
                          <Icon size={24} />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 leading-tight">
                          {lang === 'en' ? cat.title : cat.titleBn}
                        </h3>
                        <p className="text-gray-600 dark:text-zinc-400 text-xs md:text-sm line-clamp-2 leading-relaxed">
                          {lang === 'en' ? cat.content : cat.contentBn}
                        </p>
                        <div className={`mt-4 flex items-center font-bold text-xs md:text-sm ${
                          (cat.id === 'uprising-2024' || cat.id === 'liberation-war') ? 'text-bd-red' : 'text-bd-green'
                        }`}>
                          {t.learnMore} <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Smart Resource Center */}
                <div className="space-y-6 pt-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bd-green/10 rounded-xl flex items-center justify-center text-bd-green">
                      <LayoutGrid size={20} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{lang === 'en' ? 'Smart Resource Center' : 'স্মার্ট রিসোর্স সেন্টার'}</h2>
                      <p className="text-sm text-gray-500">{lang === 'en' ? 'Essential government and educational links' : 'প্রয়োজনীয় সরকারি এবং শিক্ষামূলক লিংকসমূহ'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {RESOURCES.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass p-5 rounded-2xl hover:scale-[1.02] transition-all border border-white/10 group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg text-gray-600 dark:text-zinc-400 group-hover:bg-bd-green group-hover:text-white transition-colors">
                            <res.icon size={20} />
                          </div>
                          <ExternalLink size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="font-bold text-sm mb-1">{lang === 'en' ? res.title : res.titleBn}</h4>
                        <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                          {lang === 'en' ? res.desc : res.descBn}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <button 
                    onClick={() => navigate('/info')}
                    className="flex items-center gap-2 text-bd-green font-semibold hover:underline"
                  >
                    <RotateCcw size={18} /> {t.backToCategories}
                  </button>
                  <div className="glass p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-bd-green/10 rounded-2xl flex items-center justify-center text-bd-green">
                        {React.createElement(ICON_MAP[selectedCategory.icon] || BookOpen, { size: 32 })}
                      </div>
                      <h2 className="text-3xl font-bold">{lang === 'en' ? selectedCategory.title : selectedCategory.titleBn}</h2>
                    </div>
                    <p className="text-lg text-gray-700 dark:text-zinc-300 leading-relaxed">
                      {lang === 'en' ? selectedCategory.content : selectedCategory.contentBn}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      {selectedCategory.subCategories?.map((sub, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-700/50 col-span-full">
                          <h4 className="text-xl font-bold mb-3 text-bd-green border-b border-bd-green/20 pb-2">{lang === 'en' ? sub.title : sub.titleBn}</h4>
                          <p className="text-gray-700 dark:text-zinc-300 mb-4">{lang === 'en' ? sub.content : sub.contentBn}</p>
                          
                          {sub.sections && <RenderSections sections={sub.sections} lang={lang} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'mcq' && (
            <motion.div
              key="mcq"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {!isExamStarted ? (
                <div className="text-center space-y-8 py-12">
                  <div className="w-24 h-24 bg-bd-green/10 rounded-full flex items-center justify-center mx-auto text-bd-green">
                    <GraduationCap size={48} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold">{t.mcqTitle}</h2>
                    <p className="text-gray-600 dark:text-zinc-400">
                      {t.mcqDesc}
                    </p>
                  </div>

                  {showNameInput ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-md mx-auto space-y-6"
                    >
                      <div className="glass p-6 rounded-3xl space-y-4">
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest">{lang === 'en' ? 'Select Exam Type' : 'পরীক্ষার ধরন নির্বাচন করুন'}</label>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => setExamType(20)}
                            className={`flex-1 p-4 rounded-2xl border-2 transition-all ${examType === 20 ? 'border-bd-green bg-bd-green/10 text-bd-green' : 'border-gray-100 dark:border-zinc-800'}`}
                          >
                            <div className="text-2xl font-bold">20</div>
                            <div className="text-xs">{t.questions}</div>
                          </button>
                          <button 
                            onClick={() => setExamType(30)}
                            className={`flex-1 p-4 rounded-2xl border-2 transition-all ${examType === 30 ? 'border-bd-green bg-bd-green/10 text-bd-green' : 'border-gray-100 dark:border-zinc-800'}`}
                          >
                            <div className="text-2xl font-bold">30</div>
                            <div className="text-xs">{t.questions}</div>
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder={t.enterName}
                        className="w-full p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-center text-lg font-bold"
                        autoFocus
                      />
                      <button onClick={startExam} className="btn-primary w-full py-4 text-lg">
                        {t.startExam}
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                        {[
                          { label: t.questions, value: '20 / 30' },
                          { label: t.time, value: '20m / 30m' },
                          { label: t.passMark, value: '50%' },
                          { label: t.negative, value: 'None' },
                        ].map((stat, idx) => (
                          <div key={idx} className="glass p-4 rounded-2xl">
                            <div className="text-sm text-gray-500">{stat.label}</div>
                            <div className="text-xl font-bold text-bd-green">{stat.value}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setShowNameInput(true)} className="btn-primary text-lg px-12 py-4">
                        {t.startExam}
                      </button>
                    </>
                  )}
                </div>
              ) : examResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12 pb-20"
                >
                  <div className="glass p-10 md:p-16 rounded-[3rem] text-center space-y-10 shadow-2xl border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-bd-green via-emerald-500 to-bd-green" />
                    
                    <div className="space-y-4">
                      <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform rotate-12 ${
                        examResult.score >= examResult.totalQuestions * 0.8 ? 'bg-yellow-500 text-white' : 'bg-bd-green text-white'
                      }`}>
                        <Trophy size={48} />
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                        {examResult.score >= examResult.totalQuestions * 0.8 ? 'Outstanding!' : t.examResults}
                      </h2>
                      <p className="text-gray-500 dark:text-zinc-400 font-medium text-lg">
                        {examResult.userName}, you've completed the {examResult.totalQuestions} questions challenge!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="glass p-8 rounded-[2rem] border-bd-green/20 bg-bd-green/5 relative group overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                          <CheckCircle2 size={100} />
                        </div>
                        <div className="text-[10px] uppercase font-black text-bd-green tracking-widest mb-2">Correct Answers</div>
                        <div className="text-5xl font-black text-bd-green"><AnimatedCounter value={examResult.score} /></div>
                        <div className="text-xs text-gray-400 mt-1 font-bold">out of {examResult.totalQuestions}</div>
                      </div>

                      <div className="glass p-8 rounded-[2rem] border-blue-500/20 bg-blue-500/5 relative group overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                          <TrendingUp size={100} />
                        </div>
                        <div className="text-[10px] uppercase font-black text-blue-500 tracking-widest mb-2">Accuracy Rate</div>
                        <div className="text-5xl font-black text-blue-500"><AnimatedCounter value={Math.floor((examResult.score / examResult.totalQuestions) * 100)} />%</div>
                        <div className="text-xs text-gray-400 mt-1 font-bold">Performance score</div>
                      </div>

                      <div className="glass p-8 rounded-[2rem] border-purple-500/20 bg-purple-500/5 relative group overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                          <Clock size={100} />
                        </div>
                        <div className="text-[10px] uppercase font-black text-purple-500 tracking-widest mb-2">Time Taken</div>
                        <div className="text-5xl font-black text-purple-500">
                          {Math.floor(examResult.timeSpent / 60)}<span className="text-2xl">m</span> {examResult.timeSpent % 60}<span className="text-2xl">s</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-bold">Speed efficiency</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                      <button 
                        onClick={startExam} 
                        className="btn-primary px-12 py-5 text-lg shadow-2xl shadow-bd-green/40 flex items-center justify-center gap-3"
                      >
                        <RotateCcw size={24} /> {t.tryAgain}
                      </button>
                      <button 
                        onClick={() => {
                          setIsExamStarted(false);
                          setActiveTab('leaderboard');
                        }} 
                        className="px-12 py-5 rounded-[1.5rem] border-2 border-gray-200 dark:border-zinc-800 font-black uppercase tracking-wider text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
                      >
                        <Trophy size={20} /> Check Leaderboard
                      </button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200 dark:to-zinc-800" />
                      <h3 className="text-2xl font-black uppercase tracking-widest text-gray-400">{t.detailedReview}</h3>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200 dark:to-zinc-800" />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {currentQuestions.map((q, idx) => {
                        const userAns = examResult.answers[idx].selectedOption;
                        const isCorrect = examResult.answers[idx].isCorrect;
                        return (
                          <div key={idx} className={`glass p-8 rounded-[2rem] border-2 transition-all hover:scale-[1.01] ${isCorrect ? 'border-bd-green/20 bg-bd-green/5' : 'border-bd-red/20 bg-bd-red/5'}`}>
                            <div className="flex justify-between items-start gap-6 mb-8">
                              <div className="flex gap-4">
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-white shadow-lg ${isCorrect ? 'bg-bd-green' : 'bg-bd-red'}`}>
                                  {idx + 1}
                                </span>
                                <h4 className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white leading-tight">
                                  {lang === 'en' ? q.question : q.questionBn}
                                </h4>
                              </div>
                              {isCorrect ? (
                                <div className="w-10 h-10 bg-bd-green/20 rounded-full flex items-center justify-center text-bd-green">
                                  <CheckCircle2 size={24} />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-bd-red/20 rounded-full flex items-center justify-center text-bd-red">
                                  <XCircle size={24} />
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                              {(lang === 'en' ? q.options : q.optionsBn).map((opt, optIdx) => {
                                const isCorrectOpt = optIdx === q.correctAnswer;
                                const isUserOpt = optIdx === userAns;
                                return (
                                  <div 
                                    key={optIdx} 
                                    className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 border-2 transition-all ${
                                      isCorrectOpt 
                                        ? 'bg-bd-green/10 text-bd-green border-bd-green/30' 
                                        : isUserOpt 
                                          ? 'bg-bd-red/10 text-bd-red border-bd-red/30'
                                          : 'bg-gray-50 dark:bg-zinc-800/50 text-gray-400 border-transparent'
                                    }`}
                                  >
                                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] ${
                                      isCorrectOpt ? 'bg-bd-green text-white' : isUserOpt ? 'bg-bd-red text-white' : 'bg-gray-200 dark:bg-zinc-700'
                                    }`}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    {opt}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="bg-white/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
                              <div className="flex items-center gap-2 text-bd-green font-black text-xs uppercase tracking-widest mb-2">
                                <BookOpen size={14} /> {t.explanation}
                              </div>
                              <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
                                {lang === 'en' ? q.explanation : q.explanationBn}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="glass p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4 sticky top-20 z-40 backdrop-blur-xl border-white/20 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-bd-green/10 rounded-xl flex items-center justify-center text-bd-green">
                        <Clock size={24} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{t.timeLeft}</div>
                        <div className={`text-2xl font-black tabular-nums ${timeLeft < 60 ? 'text-bd-red animate-pulse' : 'text-bd-green'}`}>
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 max-w-xs hidden sm:block">
                      <div className="flex justify-between text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">
                        <span>Progress</span>
                        <span>{Math.round(((currentQuestionIndex + 1) / currentQuestions.length) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
                          className="h-full bg-bd-green shadow-[0_0_10px_rgba(0,171,102,0.5)]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Question</div>
                        <div className="text-xl font-black">{currentQuestionIndex + 1}<span className="text-gray-400 text-sm">/{currentQuestions.length}</span></div>
                      </div>
                      <div className="h-10 w-[1px] bg-gray-100 dark:bg-zinc-800 mx-2" />
                      <div className="relative">
                        <button 
                          onClick={() => setShowExitConfirm(!showExitConfirm)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                            showExitConfirm ? 'bg-bd-red text-white' : 'text-bd-red hover:bg-bd-red/10'
                          }`}
                        >
                          <X size={20} />
                          <span className="hidden sm:inline">{t.exit}</span>
                        </button>

                        <AnimatePresence>
                          {showExitConfirm && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute top-full right-0 mt-2 w-64 glass p-4 rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 w-full h-1 bg-bd-red" />
                              <p className="text-sm font-bold mb-4 text-gray-900 dark:text-white">
                                {lang === 'en' ? 'Are you sure you want to exit the exam?' : 'আপনি কি নিশ্চিত যে আপনি পরীক্ষা থেকে প্রস্থান করতে চান?'}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setIsExamStarted(false);
                                    setExamResult(null);
                                    setShowExitConfirm(false);
                                  }}
                                  className="flex-1 py-2 bg-bd-red text-white rounded-lg text-xs font-black uppercase tracking-wider"
                                >
                                  {lang === 'en' ? 'Yes, Exit' : 'হ্যাঁ, প্রস্থান'}
                                </button>
                                <button
                                  onClick={() => setShowExitConfirm(false)}
                                  className="flex-1 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-500 rounded-lg text-xs font-black uppercase tracking-wider"
                                >
                                  {lang === 'en' ? 'Cancel' : 'বাতিল'}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-8 md:p-12 rounded-[2.5rem] space-y-10 shadow-2xl border-white/10 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-bd-green" />
                    
                    <h3 className="text-2xl md:text-3xl font-bold leading-tight text-gray-900 dark:text-white">
                      {lang === 'en' ? currentQuestions[currentQuestionIndex].question : currentQuestions[currentQuestionIndex].questionBn}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {(lang === 'en' ? currentQuestions[currentQuestionIndex].options : currentQuestions[currentQuestionIndex].optionsBn).map((opt, idx) => {
                        const isSelected = userAnswers[currentQuestionIndex] === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={userAnswers[currentQuestionIndex] !== null}
                            className={`group p-6 rounded-2xl text-left transition-all duration-300 border-2 relative overflow-hidden ${
                              isSelected
                                ? 'border-bd-green bg-bd-green/10 text-bd-green shadow-lg scale-[1.02]'
                                : 'border-transparent bg-gray-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center gap-5 relative z-10">
                              <span className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-lg font-black transition-colors ${
                                isSelected ? 'bg-bd-green text-white' : 'bg-white dark:bg-zinc-900 text-gray-400 group-hover:text-bd-green'
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="text-lg font-semibold">{opt}</span>
                            </div>
                            {isSelected && (
                              <motion.div 
                                layoutId="activeOption"
                                className="absolute inset-0 bg-bd-green/5 pointer-events-none"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-zinc-800">
                      <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-30"
                      >
                        <ChevronLeft size={20} /> {t.previous}
                      </button>
                      
                      {currentQuestionIndex === currentQuestions.length - 1 ? (
                        <button 
                          onClick={finishExam} 
                          className="btn-primary px-10 py-4 text-lg shadow-xl shadow-bd-green/30"
                        >
                          {t.finishExam}
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                          className="btn-primary px-10 py-4 text-lg shadow-xl shadow-bd-green/30 flex items-center gap-2"
                        >
                          {t.next} <ChevronRight size={20} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4 py-8">
                <div className="w-20 h-20 bg-bd-green/10 rounded-full flex items-center justify-center mx-auto text-bd-green">
                  <Trophy size={40} />
                </div>
                <h2 className="text-3xl font-bold">{t.leaderboard}</h2>
                <p className="text-gray-600 dark:text-zinc-400">{t.topPerformers}</p>
              </div>

              {/* Leaderboard Tabs */}
              <div className="flex justify-center">
                <div className="glass p-1.5 rounded-2xl flex gap-1 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20">
                  <button 
                    onClick={() => setLeaderboardTab(20)}
                    className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${leaderboardTab === 20 ? 'bg-bd-green text-white shadow-lg shadow-bd-green/30 scale-105' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                  >
                    20 {t.questions}
                  </button>
                  <button 
                    onClick={() => setLeaderboardTab(30)}
                    className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${leaderboardTab === 30 ? 'bg-bd-green text-white shadow-lg shadow-bd-green/30 scale-105' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                  >
                    30 {t.questions}
                  </button>
                </div>
              </div>

              <div className="glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gradient-to-r from-bd-green to-emerald-600 text-white">
                      <tr>
                        <th className="px-8 py-6 font-bold uppercase tracking-wider text-xs">Rank</th>
                        <th className="px-8 py-6 font-bold uppercase tracking-wider text-xs">User</th>
                        <th className="px-8 py-6 font-bold uppercase tracking-wider text-xs">Score</th>
                        <th className="px-8 py-6 font-bold uppercase tracking-wider text-xs">Date</th>
                        <th className="px-8 py-6 font-bold uppercase tracking-wider text-xs text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {(leaderboardTab === 20 ? leaderboard20 : leaderboard30).map((entry, idx) => {
                        const isCurrentUser = entry.userName === userName;
                        return (
                          <tr 
                            key={idx} 
                            id={isCurrentUser ? `my-rank-${leaderboardTab}` : undefined}
                            className={`transition-all duration-300 ${isCurrentUser ? 'bg-bd-green/10' : 'hover:bg-white/60 dark:hover:bg-zinc-800/40'}`}
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                {idx < 3 ? (
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg transform rotate-3 ${
                                    idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : 
                                    idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                                    'bg-gradient-to-br from-amber-600 to-orange-800'
                                  }`}>
                                    {idx + 1}
                                  </div>
                                ) : (
                                  <span className="w-10 text-center font-black text-gray-400 text-lg">#{idx + 1}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isCurrentUser ? 'bg-bd-green text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                                  {entry.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900 dark:text-white">{entry.userName}</span>
                                  {isCurrentUser && (
                                    <span className="text-[9px] text-bd-green font-black uppercase tracking-tighter">Current User</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-baseline gap-1">
                                <span className="font-black text-2xl text-bd-green">{entry.score}</span>
                                <span className="text-xs text-gray-400 font-bold">/{entry.questionCount}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-sm text-gray-500 font-medium">{entry.date}</td>
                            <td className="px-8 py-6 text-center">
                              <button 
                                onClick={() => {
                                  const fullResult = allResults.find(r => r.userName === entry.userName && r.score === entry.score && r.totalQuestions === entry.questionCount);
                                  if (fullResult) setSelectedResult(fullResult);
                                }}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-bd-green hover:text-white transition-all"
                                title="View Details"
                              >
                                <ExternalLink size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {(leaderboardTab === 20 ? leaderboard20 : leaderboard30).length === 0 && (
                  <div className="p-24 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
                      <Trophy size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">No results yet for this category. Be the first to conquer!</p>
                  </div>
                )}
              </div>

              {/* User Position Info */}
              {userName && (
                <div className="flex justify-center">
                  {(() => {
                    const list = leaderboardTab === 20 ? leaderboard20 : leaderboard30;
                    const pos = list.findIndex(e => e.userName === userName);
                    if (pos !== -1) {
                      return (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const el = document.getElementById(`my-rank-${leaderboardTab}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className="glass px-8 py-4 rounded-full border-2 border-bd-green/30 bg-bd-green/5 flex items-center gap-4 shadow-xl shadow-bd-green/10 group"
                        >
                          <div className="w-10 h-10 bg-bd-green rounded-full flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                            <Trophy size={20} />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] uppercase font-black text-bd-green tracking-widest">Your Standing</span>
                            <span className="text-xl font-black">Rank #{pos + 1}</span>
                          </div>
                          <div className="ml-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 group-hover:bg-bd-green group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                          </div>
                        </motion.button>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* Result Detail Modal */}
              <AnimatePresence>
                {selectedResult && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedResult(null)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-2xl glass rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] flex flex-col"
                    >
                      <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-bd-green/10 to-transparent">
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white">{selectedResult.userName}'s Performance</h3>
                          <p className="text-sm text-gray-500 font-medium">{selectedResult.date} • {selectedResult.totalQuestions} Questions</p>
                        </div>
                        <button 
                          onClick={() => setSelectedResult(null)}
                          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-bd-red hover:text-white transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="p-8 overflow-y-auto space-y-8">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="glass p-4 rounded-2xl text-center border-bd-green/20 bg-bd-green/5">
                            <div className="text-[10px] uppercase font-black text-bd-green tracking-widest mb-1">Score</div>
                            <div className="text-3xl font-black text-bd-green">{selectedResult.score}/{selectedResult.totalQuestions}</div>
                          </div>
                          <div className="glass p-4 rounded-2xl text-center border-blue-500/20 bg-blue-500/5">
                            <div className="text-[10px] uppercase font-black text-blue-500 tracking-widest mb-1">Accuracy</div>
                            <div className="text-3xl font-black text-blue-500">{Math.round((selectedResult.score / selectedResult.totalQuestions) * 100)}%</div>
                          </div>
                          <div className="glass p-4 rounded-2xl text-center border-purple-500/20 bg-purple-500/5">
                            <div className="text-[10px] uppercase font-black text-purple-500 tracking-widest mb-1">Time</div>
                            <div className="text-3xl font-black text-purple-500">{Math.floor(selectedResult.timeSpent / 60)}m {selectedResult.timeSpent % 60}s</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-black text-lg uppercase tracking-wider text-gray-400">Question Review</h4>
                          {selectedResult.answers.map((ans, idx) => {
                            const q = mcqQuestions.find(q => q.id === ans.questionId);
                            if (!q) return null;
                            return (
                              <div key={idx} className={`p-6 rounded-2xl border-2 ${ans.isCorrect ? 'border-bd-green/20 bg-bd-green/5' : 'border-bd-red/20 bg-bd-red/5'}`}>
                                <div className="flex gap-4">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black ${ans.isCorrect ? 'bg-bd-green text-white' : 'bg-bd-red text-white'}`}>
                                    {idx + 1}
                                  </div>
                                  <div className="space-y-3">
                                    <p className="font-bold text-gray-900 dark:text-white">{lang === 'en' ? q.question : q.questionBn}</p>
                                    <div className="flex flex-wrap gap-2">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${ans.isCorrect ? 'bg-bd-green/20 text-bd-green' : 'bg-bd-red/20 text-bd-red'}`}>
                                        Selected: {lang === 'en' ? q.options[ans.selectedOption] : q.optionsBn[ans.selectedOption]}
                                      </span>
                                      {!ans.isCorrect && (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-bd-green/20 text-bd-green">
                                          Correct: {lang === 'en' ? q.options[q.correctAnswer] : q.optionsBn[q.correctAnswer]}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}


          {activeTab === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4 py-8">
                <div className="w-20 h-20 bg-bd-green/10 rounded-full flex items-center justify-center mx-auto text-bd-green">
                  <MessageSquare size={40} />
                </div>
                <h2 className="text-3xl font-bold">{t.comments}</h2>
                <p className="text-gray-600 dark:text-zinc-400">{t.shareExperience}</p>
              </div>

              <div className="glass p-6 rounded-3xl space-y-4">
                <textarea
                  placeholder={t.writeComment}
                  className="w-full p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white min-h-[120px]"
                  id="comment-input"
                />
                <div className="flex justify-end">
                  <button 
                    onClick={() => {
                      const input = document.getElementById('comment-input') as HTMLTextAreaElement;
                      if (input.value.trim()) {
                        handleCommentSubmit(input.value);
                        input.value = '';
                      }
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Send size={18} />
                    {t.submit}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="glass p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-bd-green">{comment.userName}</h4>
                        <span className="text-xs text-gray-400">{comment.date}</span>
                      </div>
                      {user?.isAdmin && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-zinc-300">{comment.content}</p>
                    
                    {comment.reply && (
                      <div className="ml-8 p-4 bg-bd-green/5 rounded-2xl border-l-4 border-bd-green">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield size={14} className="text-bd-green" />
                          <span className="text-xs font-bold text-bd-green">Admin Reply</span>
                          <span className="text-[10px] text-gray-400">{comment.replyDate}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-zinc-400 italic">{comment.reply}</p>
                      </div>
                    )}

                    {user?.isAdmin && !comment.reply && (
                      <div className="ml-8 flex gap-2">
                        <input
                          type="text"
                          placeholder="Reply as admin..."
                          className="flex-1 p-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                          id={`reply-${comment.id}`}
                        />
                        <button 
                          onClick={() => {
                            const input = document.getElementById(`reply-${comment.id}`) as HTMLInputElement;
                            if (input.value.trim()) {
                              handleReply(comment.id, input.value);
                              input.value = '';
                            }
                          }}
                          className="p-2 bg-bd-green text-white rounded-xl"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    {t.noComments}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && user?.isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4 py-8">
                <div className="w-20 h-20 bg-bd-red/10 rounded-full flex items-center justify-center mx-auto text-bd-red">
                  <Settings size={40} />
                </div>
                <h2 className="text-3xl font-bold">{t.adminPanel}</h2>
                <p className="text-gray-600 dark:text-zinc-400">Manage exam results and user data</p>
              </div>

              <div className="glass rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="font-bold text-xl">{t.results}</h3>
                  <span className="text-sm text-gray-500">{allResults.length} Total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                      <tr>
                        <th className="px-6 py-4 font-bold">User</th>
                        <th className="px-6 py-4 font-bold">Score</th>
                        <th className="px-6 py-4 font-bold">Date</th>
                        <th className="px-6 py-4 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {allResults.map((res) => (
                        <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              defaultValue={res.userName}
                              onBlur={(e) => handleEditResult(res.id, e.target.value, res.score)}
                              className="bg-transparent border-none focus:ring-0 font-semibold text-gray-900 dark:text-white"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              defaultValue={res.score}
                              onBlur={(e) => handleEditResult(res.id, res.userName, parseInt(e.target.value))}
                              className="bg-transparent border-none focus:ring-0 font-bold text-bd-green w-16"
                            />
                            /20
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{res.date}</td>
                          <td className="px-6 py-4">
                            <button onClick={() => handleDeleteResult(res.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-full">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/10 dark:border-zinc-800/50 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          {/* Personal Info Badge */}
          <div className="flex justify-center">
            <div className="inline-flex flex-col items-center glass px-6 py-3 rounded-2xl border border-bd-green/20 shadow-lg shadow-bd-green/5">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Developed By</span>
              <span className="text-sm font-bold text-bd-green">Md. Sadman Saif Arnob</span>
            </div>
          </div>

          <div className="flex justify-center gap-2 items-center">
            <div className="w-6 h-6 bg-bd-green rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-bd-red rounded-full" />
            </div>
            <span className="font-bold">{t.appTitle}</span>
          </div>
          <p className="text-sm text-gray-500">
            {t.footerDesc}
          </p>
          <div className="text-xs text-gray-400">
            © {new Date().getFullYear()} {t.appTitle}. {t.rights}
          </div>
        </div>
      </footer>
    </div>
  );
}
