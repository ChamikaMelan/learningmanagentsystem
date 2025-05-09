// middlewares/isInstructor.js
import {User} from "../models/user.model.js";

const isinstructor = async (req, res, next) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.role !== "instructor") {
      return res.status(403).json({
        message: "Unauthorized - Instructor access required",
        success: false,
      });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Authorization failed"
    });
  }
};

export default isinstructor;