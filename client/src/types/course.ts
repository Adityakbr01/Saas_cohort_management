export interface Lecture {
  _id: string;
  title: string;
  shortDescription?: string;
  duration?: number;
  status: string;
  contentType: string;
  position: number;
}

export interface Chapter {
  _id: string;
  title: string;
  shortDescription?: string;
  totalLessons: number;
  totalDuration: number;
  lessons: Lecture[];
  status: string;
}

export interface Module {
  _id: string;
  title: string;
  shortDescription?: string;
  chapters: Chapter[];
  status: string;
}