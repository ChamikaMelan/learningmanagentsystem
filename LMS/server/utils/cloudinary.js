import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({});

cloudinary.config({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  cloud_name: process.env.CLOUD_NAME,
});

export const uploadMedia = async (file) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return uploadResponse;
  } catch (error) {
    console.log(error);
  } 
};

export const uploadPDFToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",  // Important for PDFs
      folder: "course_pdfs",  // Optional: organize in folder
      allowed_formats: ["pdf"],  // Restrict to PDF only
      format: "pdf",  // Ensure PDF format
      // max_bytes: 10 * 1024 * 1024 // Optional: 10MB limit
    });
    return result;
  } catch (error) {
    console.error("PDF upload error:", error);
    throw error;
  }
};
export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
  }
};

export const deleteVideoFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId,{resource_type:"video"});
    } catch (error) {
        console.log(error);
        
    }
}


export const deletePDFFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw"  // Required for PDF deletion
    });
  } catch (error) {
    console.error("PDF delete error:", error);
    throw error;
  }
};