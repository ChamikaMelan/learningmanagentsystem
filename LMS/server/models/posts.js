import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    review: { 
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        default: 5
    },
    reply: {
        type: String,
        default: ""
    }
});

const Posts = mongoose.model('Posts', postSchema);

export default Posts;
