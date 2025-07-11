export interface Lecture {
  _id: string;
  title: string;
  shortDescription: string;
  duration: number;
  status: string;
  contentType: string;
  position: number;
  type: string;
  id: string;
  order: number;
  description: string;
}


export interface Chapter {
  _id: string;
  title: string;
  shortDescription?: string;
  totalLessons: number;
  totalDuration: number;
  lessons: Lecture[];
  status: string;
  id: string;
  type: string;
  order: number;
  description: string;
  
}

export interface Module {
  _id: string;
  title: string;
  shortDescription?: string;
  chapters: Chapter[];
  status: string;
  id: string;
  type: string;
  order: number;
  description: string;
}