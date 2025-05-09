import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    dob: {
        type: Date,
        required: true
    },
    path: { 
        type: String, 
        enum: ["Web Developeing", "Software Engineering", "graphic-designing", "Data science","Network Engineering","Cybersecurity","Business Analyst","Mobile Application Developing"],
        required: true },
    role:{
        type:String,
        enum:["instructor", "student"],
        default:'student'
    },
    enrolledCourses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Course'
        }
    ],
    photoUrl:{
        type:String,
        default:""
    },

    lastLogin: {
        type: Date, 
        default: null  // Track last login
    }
},{timestamps:true});

// Pre-save hook to update lastLogin on login
userSchema.pre('save', function(next) {
    if (this.isModified('password')) {
      this.lastLogin = new Date(); // Automatically set lastLogin when user data is updated
    }
    next();
  });

export const User = mongoose.model("User", userSchema);