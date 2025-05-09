import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import nodemailer from "nodemailer";
import crypto from "crypto";


export const register = async (req,res) => {
    try {
       
        const {name, email, password,dob ,path} = req.body; // patel214
        if(!name || !email || !password || !dob || !path){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                success:false,
                message:"User already exist with this email."
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password:hashedPassword,
            dob,
            path,
        });
        return res.status(201).json({
            success:true,
            message:"Account created successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to register"
        })
    }
}
export const login = async (req,res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }
        const user = await User.findOne({email});
        
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Incoreect email"
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            });
        }

        //last login time
        // Directly update the lastLogin field without saving the entire user document
    user.lastLogin = new Date();

    // Only update the lastLogin field in the database
    await User.updateOne({ _id: user._id }, { lastLogin: user.lastLogin });
        ////
        generateToken(res, user, `Welcome back ${user.name}`);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to login"
        })
    }
}
export const logout = async (_,res) => {
    try {
        return res.status(200).cookie("token", "", {maxAge:0}).json({
            message:"Logged out successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to logout"
        }) 
    }
}
export const getUserProfile = async (req,res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password").populate("enrolledCourses");
        if(!user){
            return res.status(404).json({
                message:"Profile not found",
                success:false
            })
        }
        return res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to load user"
        })
    }
}
export const updateProfile = async (req,res) => {
    try {
        const userId = req.id;
        const {name,dob,path} = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false
            }) 
        }
        // extract public id of the old image from the url is it exists;
        if(user.photoUrl){
            const publicId = user.photoUrl.split("/").pop().split(".")[0]; // extract public id
            deleteMediaFromCloudinary(publicId);
        }

        // upload new photo
        const cloudResponse = await uploadMedia(profilePhoto.path);
        const photoUrl = cloudResponse.secure_url;

        const updatedData = {name, photoUrl,dob,path};
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password");

        return res.status(200).json({
            success:true,
            user:updatedUser,
            message:"Profile updated successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to update profile"
        })
    }
}
///
// controllers/user.controller.js
export const deleteProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.id;

        // Get current user
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "Current user not found"
            });
        }

        // Determine which user to delete
        let userToDelete;
        if (userId) {
            // Instructor deleting another user
            if (currentUser.role !== "instructor") {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized - Instructor access required"
                });
            }
            userToDelete = await User.findById(userId);
        } else {
            // User deleting themselves
            userToDelete = currentUser;
        }

        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: "User to delete not found"
            });
        }

        // Delete profile photo if exists
        if (userToDelete.photoUrl) {
            const publicId = userToDelete.photoUrl.split("/").pop().split(".")[0];
            await deleteMediaFromCloudinary(publicId);
        }

        await User.findByIdAndDelete(userToDelete._id);

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete account"
        });
    }
};
////

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("name email dob path photoUrl lastLogin");

        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};
///////

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store OTPs temporarily (in production, use Redis or database)
const otpStorage = new Map();

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email"
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store OTP with expiry
    otpStorage.set(email, { otp, expiry: otpExpiry });

    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to process forgot password request"
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const storedData = otpStorage.get(email);
    
    if (!storedData || storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (Date.now() > storedData.expiry) {
      otpStorage.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    }

    // Mark OTP as verified (you can store this in otpStorage)
    otpStorage.set(email, { ...storedData, verified: true });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP"
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required"
      });
    }

    const storedData = otpStorage.get(email);
    
    // Check if OTP exists and is verified
    if (!storedData || storedData.otp !== otp || !storedData.verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or OTP not verified"
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiry) {
      otpStorage.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Remove OTP from storage
    otpStorage.delete(email);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password"
    });
  }
};
/////change password
export const changePassword = async (req, res) => {
  try {
      const userId = req.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
          return res.status(400).json({
              success: false,
              message: "Both current and new password are required"
          });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found"
          });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
          return res.status(400).json({
              success: false,
              message: "Current password is incorrect"
          });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({
          success: true,
          message: "Password changed successfully"
      });

  } catch (error) {
      console.error(error);
      return res.status(500).json({
          success: false,
          message: "Failed to change password"
      });
  }
};
