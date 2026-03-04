export interface Question {
  id: string;
  question: string;
  questionBn: string;
  options: string[];
  optionsBn: string[];
  correctAnswer: number;
  explanation: string;
  explanationBn: string;
  category: string;
}

export interface InfoSection {
  title: string;
  titleBn: string;
  content: string;
  contentBn: string;
  sections?: InfoSection[];
}

export interface InfoCategory {
  id: string;
  title: string;
  titleBn: string;
  icon: string;
  content: string;
  contentBn: string;
  subCategories?: {
    title: string;
    titleBn: string;
    content: string;
    contentBn: string;
    sections?: InfoSection[];
  }[];
}

export interface ExamResult {
  id: string;
  userName: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  answers: {
    questionId: string;
    selectedOption: number | null;
    isCorrect: boolean;
  }[];
}

export interface UserComment {
  id: string;
  userName: string;
  email?: string;
  content: string;
  date: string;
  reply?: string;
  replyDate?: string;
}

export interface User {
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface LeaderboardEntry {
  userName: string;
  score: number;
  date: string;
  questionCount: number;
  timeSpent: number;
}
