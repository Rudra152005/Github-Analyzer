import { Schema, model, Document } from 'mongoose';

export interface ILearningStep {
  title: string;
  description: string;
  resources: string[];
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ICareerAnalysis extends Document {
  userId: string;
  role: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendedProjects: string[];
  recommendedCertifications: string[];
  interviewReadiness: number;
  resumeFeedback: string;
  portfolioSuggestions: string[];
  learningRoadmap: ILearningStep[];
  generatedAt: Date;
}

const LearningStepSchema = new Schema<ILearningStep>({
  title: String,
  description: String,
  resources: [String],
  estimatedTime: String,
  priority: { type: String, enum: ['high', 'medium', 'low'] },
});

const CareerAnalysisSchema = new Schema<ICareerAnalysis>(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    score: { type: Number, required: true },
    strengths: [String],
    weaknesses: [String],
    missingSkills: [String],
    recommendedProjects: [String],
    recommendedCertifications: [String],
    interviewReadiness: { type: Number, required: true },
    resumeFeedback: String,
    portfolioSuggestions: [String],
    learningRoadmap: [LearningStepSchema],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Cache by userId + role
CareerAnalysisSchema.index({ userId: 1, role: 1 }, { unique: true });

export const CareerAnalysis = model<ICareerAnalysis>('CareerAnalysis', CareerAnalysisSchema);
