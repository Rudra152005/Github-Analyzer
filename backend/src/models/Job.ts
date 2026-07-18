import { Schema, model, Document } from 'mongoose';

export interface IJob extends Document {
  type: 'insight_regenerate' | 'report_generate';
  userId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  bullJobId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    type: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
    },
    result: { type: Schema.Types.Mixed },
    error: { type: String },
    bullJobId: { type: String },
  },
  { timestamps: true }
);

export const Job = model<IJob>('Job', JobSchema);
