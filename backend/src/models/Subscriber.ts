import { Schema, model, Document } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  createdAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export const Subscriber = model<ISubscriber>('Subscriber', SubscriberSchema);
