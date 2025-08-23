import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  content: string;
  sender: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    content: { type: String, required: true, trim: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
