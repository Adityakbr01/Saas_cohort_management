import { model, Schema, Types } from "mongoose";

export interface ILessonCode extends Document {
  lesson: Types.ObjectId;  language: string;
  code: string;  description?: string;
  isStarter: boolean;  isSolution: boolean;
  version: number;
  title: string;
  runLink?: string;
  isDeleted:boolean;
  level:string;
}


const lessonCodeSchema = new Schema<ILessonCode>(  {
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },    
    language: { 
      type: String, 
      enum: ["javascript", "typescript", "python", "java", "cpp", "ruby", "php", "csharp", "go", "rust"], 
      required: true     
    },
    code: { type: String, required: true },   
    description: { type: String },
    isStarter: { type: Boolean, default: false }, // Indicates if this is starter code    
    isSolution: { type: Boolean, default: false }, // Indicates if this is solution code
    version: { type: Number, default: 1 }, // For tracking code versions    
    title: { type: String, required: true },
    runLink: { type: String, default: "" }, // Link to run the code online
    isDeleted: { type: Boolean, default: false }, // Indicates if this is deleted code    
    level: { type: String, enum: ["easy", "medium", "hard"], default: "easy" }, // Indicates if this is deleted code    
  },
  { timestamps: true });
// Create compound index for lesson and versionlessonCodeSchema.index({ lesson: 1, version: 1 });

export const LessonCode = model<ILessonCode>("LessonCode", lessonCodeSchema);


















