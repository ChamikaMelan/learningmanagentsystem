// src/models/chatModel.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['user', 'system']
    },
    content: {
      type: String,
      required: true
    },
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture',
      default: null
    }
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    messages: [messageSchema]
  },
  { timestamps: true }
);

// Add index for faster queries
chatSchema.index({ user: 1, course: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;