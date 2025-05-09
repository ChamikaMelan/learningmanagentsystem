import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import cartRoutes from './routes/cart.routes.js';
import chatRoutes from './routes/chatRoutes.js';
import postRoutes from './routes/posts.js';

dotenv.config({});

// call database connection here
connectDB();
const app = express();

const PORT = process.env.PORT || 8000;

// default middleware
app.use(express.json());  
app.use(cookieParser());
 
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
 
// apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/posts', postRoutes);

 
 
app.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`);
})


