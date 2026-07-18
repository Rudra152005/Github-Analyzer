import { Schema, model, Document } from 'mongoose';

export interface IReport extends Document {
  userId: string;
  title: string;
  type: string;
  status: 'completed' | 'processing' | 'failed';
  pdfPath?: string;
  data?: Record<string, unknown>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ['completed', 'processing', 'failed'],
      default: 'processing',
    },
    pdfPath: { type: String },
    data: { type: Schema.Types.Mixed },
    error: { type: String },
  },
  { timestamps: true }
);

export const Report = model<IReport>('Report', ReportSchema);
