export interface Lesson {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  type: "video" | "reading" | "quiz" | "assignment";
  duration: string;
  isCompleted: boolean;
  isBookmarked: boolean;
  isLocked: boolean;
  dueDate?: string;
  content?: string;
  videoUrl?: string;         // ✅ make optional
  transcript?: string;       // ✅ make optional
  instructions?: string;     // ✅ for assignment
  questions?: Question[];    // ✅ for quiz
  codeExamples?: codeExamples[]; // ✅ make optional
  resources?: Array<{
    id: string;
    title: string;
    type: string;
    url: string;
    size?: string;
    description?: string;
  }>;
  lastWatchedTime:number
  // ⬅️ NEW FIELD: last watched time in seconds
  progress?: number;         // ✅ Optional for UI progress indication
  estimatedTime?: string;    // ✅ Optional for reading/assignment
  level?: string;            // ✅ Optional for difficulty level
  chapterId?: string;        // ✅ Optional for chapter association
  createdAt?: string;        // ✅ Optional for creation date
  score?: number;         // ✅ Optional for quiz score
  maxScore?: number;      // ✅ Optional for quiz max score
  feedback?: string;       // ✅ Optional for assignment feedback
  attachments?: Array<{
    id: string;
    title: string;
    url: string;
    type: string; // e.g., "pdf", "docx", "image"
    size?: string; // Optional file size
  }>;
}


export interface codeExamples {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
  instructions?: string;
  level: string
}


export interface Chapter {
  id: string;
  title: string;
  description: string;
  estimatedTime: string; // ✅ Required
  lessons: Lesson[];
  isCompleted: boolean;
  isBookmarked: boolean;
  progress: number;
}

export interface CohortData {
  title: string;
  description: string;
  progress: ProgressData;
  instructor: { id: string; name: string; avatar?: string, bio: string };
  chapters: Chapter[];
  id: string;
  students: number;
  rating: number;
  startDate: string;
  endDate: string;
  status: string;
  organization: string;
  mentor: string;
  createdBy: string;
  schedule: string;
  location: string;
  completionRate: number;
  language: string;
  tags: string[];
  prerequisites: string[];
  thumbnail: string;
  ratingSummary?: Array<{
    userId: string;
    rating: number;
    comment?: string;
  }>;
  ratingStats?: {
   ratings:[],
    averageRating: number;
    totalRatings: number;
    
  };

}


export type ProgressData = {
  overall: number;
  byType: {
    lessons: number;
    quiz?: number; // ✅ only this
    assignments: number;
    video: number;
    reading: number;
  };
  completedLessons: number;
  totalLessons: number;
  timeSpent: string;
  streakDays: number[]
  achievements: string[];
  xp?: number;
  streak?: string
};



export type DueType = "video" | "quiz" | "assignment" | "reading";

export type DueDate = {
  id: string;
  title: string;
  type: DueType; // ✅ Strictly defined
  dueDate: string;
  chapterTitle: string;
};


export type BookmarkedItem = {
  id: string;
  title: string;
  type: BookmarkedType;
  description: string;
  chapterTitle?: string;
};


export type LessonType = "video" | "reading" | "quiz" | "assignment";


export type BookmarkedType = "video" | "quiz" | "assignment" | "reading" | "chapter";


export interface Question {
  id: string
  type: "multiple-choice" | "multiple-select" | "true-false" | "short-answer"
  question: string
  options?: string[]
  correctAnswer: string | string[]; // ✅ make optional
  explanation: string
  points: number
}
export interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  timeLimit?: number // in seconds
}
