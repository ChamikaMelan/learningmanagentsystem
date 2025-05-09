import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia ,deletePDFFromCloudinary} from "../utils/cloudinary.js";

export const createCourse = async (req, res) => {
    try {
        const { courseTitle, category } = req.body;
        if (!courseTitle || !category) {
            return res.status(400).json({
                message: "Course title and category are required."
            });
        }

        const course = await Course.create({
            courseTitle,
            category,
            creator: req.id
        });

        return res.status(201).json({
            course,
            message: "Course created successfully."
        });
    } catch (error) {
        console.error("Create course error:", error);
        return res.status(500).json({
            message: "Failed to create course"
        });
    }
};

export const searchCourse = async (req, res) => {
    try {
        const { query = "", categories = [], sortByPrice = "" } = req.query;
        
        const searchCriteria = {
            isPublished: true,
            $or: [
                { courseTitle: { $regex: query, $options: "i" } },
                { subTitle: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
            ]
        };

        if (categories.length > 0) {
            searchCriteria.category = { $in: categories };
        }

        const sortOptions = {};
        if (sortByPrice === "low") {
            sortOptions.coursePrice = 1;
        } else if (sortByPrice === "high") {
            sortOptions.coursePrice = -1;
        }

        const courses = await Course.find(searchCriteria)
            .populate({ path: "creator", select: "name photoUrl" })
            .sort(sortOptions);

        return res.status(200).json({
            success: true,
            courses: courses || []
        });
    } catch (error) {
        console.error("Search course error:", error);
        return res.status(500).json({
            message: "Failed to search courses"
        });
    }
};

export const getPublishedCourse = async (_, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .populate({ path: "creator", select: "name photoUrl" });

        if (!courses) {
            return res.status(404).json({
                message: "No published courses found"
            });
        }

        return res.status(200).json({ courses });
    } catch (error) {
        console.error("Get published courses error:", error);
        return res.status(500).json({
            message: "Failed to get published courses"
        });
    }
};

export const getCreatorCourses = async (req, res) => {
    try {
        const courses = await Course.find({ creator: req.id });

        return res.status(200).json({
            courses: courses || [],
            message: "Courses fetched successfully"
        });
    } catch (error) {
        console.error("Get creator courses error:", error);
        return res.status(500).json({
            message: "Failed to get creator courses"
        });
    }
};

export const editCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;
        const thumbnail = req.file;

        let course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            });
        }

        let courseThumbnail;
        if (thumbnail) {
            if (course.courseThumbnail) {
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId);
            }
            courseThumbnail = await uploadMedia(thumbnail.path);
        }

        const updateData = {
            courseTitle,
            subTitle,
            description,
            category,
            courseLevel,
            coursePrice,
            courseThumbnail: courseThumbnail?.secure_url || course.courseThumbnail
        };

        course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

        return res.status(200).json({
            course,
            message: "Course updated successfully."
        });
    } catch (error) {
        console.error("Edit course error:", error);
        return res.status(500).json({
            message: "Failed to update course"
        });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            });
        }

        return res.status(200).json({ course });
    } catch (error) {
        console.error("Get course by ID error:", error);
        return res.status(500).json({
            message: "Failed to get course"
        });
    }
};

export const createLecture = async (req, res) => {
    try {
        const { lectureTitle } = req.body;
        const { courseId } = req.params;

        if (!lectureTitle || !courseId) {
            return res.status(400).json({
                message: "Lecture title and course ID are required"
            });
        }

        const lecture = await Lecture.create({ lectureTitle });
        await Course.findByIdAndUpdate(
            courseId,
            { $push: { lectures: lecture._id } },
            { new: true }
        );

        return res.status(201).json({
            lecture,
            message: "Lecture created successfully."
        });
    } catch (error) {
        console.error("Create lecture error:", error);
        return res.status(500).json({
            message: "Failed to create lecture"
        });
    }
};

export const getCourseLecture = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId)
            .populate("lectures");

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        return res.status(200).json({
            lectures: course.lectures
        });
    } catch (error) {
        console.error("Get course lectures error:", error);
        return res.status(500).json({
            message: "Failed to get lectures"
        });
    }
};

export const editLecture = async (req, res) => {
    try {
        const { lectureTitle, videoUrl, publicId, isPreviewFree,pdfUrl,pdfPublicId } = req.body;
        const videoFile = req.file;
        const pdfFile = req.file;
        const { courseId, lectureId } = req.params;

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ message: "Lecture not found!" });
        }

        // Handle video upload if new file provided
        if (videoFile) {
            // Delete old video if exists
            if (lecture.publicId) {
                await deleteVideoFromCloudinary(lecture.publicId);
            }
            
            // Upload new video
            const uploadedVideo = await uploadMedia(videoFile.path);
            lecture.videoUrl = uploadedVideo.secure_url;
            lecture.publicId = uploadedVideo.public_id;
        } else if (videoUrl && publicId) {
            // Use provided URLs if no new file
            lecture.videoUrl = videoUrl;
            lecture.publicId = publicId;
        }

        if (pdfFile) {
            // Delete old PDF if exists
            if (lecture.pdfPublicId) {
                await deletePDFFromCloudinary(lecture.pdfPublicId);
            }
            
            // Upload new PDF
            const uploadedPDF = await uploadPDFToCloudinary(pdfFile.path);
            lecture.pdfUrl = uploadedPDF.secure_url;
            lecture.pdfPublicId = uploadedPDF.public_id;
        } else if (pdfUrl && pdfPublicId) {
            // Use provided URLs if no new file
            lecture.pdfUrl = pdfUrl;
            lecture.pdfPublicId = pdfPublicId;
        }


        // Update other fields
        if (lectureTitle) lecture.lectureTitle = lectureTitle;
        if (isPreviewFree !== undefined) {
            lecture.isPreviewFree = isPreviewFree === "true" || Boolean(isPreviewFree);
        }

        await lecture.save();

        // Ensure lecture is referenced in course
        await Course.updateOne(
            { _id: courseId, lectures: { $ne: lectureId } },
            { $push: { lectures: lectureId } }
        );

        return res.status(200).json({
            lecture,
            message: "Lecture updated successfully.",
        });
    } catch (error) {
        console.error("Edit lecture error:", error);
        return res.status(500).json({ message: "Failed to edit lecture" });
    }
};

export const removeLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found!"
            });
        }

        // Delete video from Cloudinary
        if (lecture.publicId) {
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        // Remove from course references
        await Course.updateMany(
            { lectures: lectureId },
            { $pull: { lectures: lectureId } }
        );

        return res.status(200).json({
            message: "Lecture removed successfully."
        });
    } catch (error) {
        console.error("Remove lecture error:", error);
        return res.status(500).json({
            message: "Failed to remove lecture"
        });
    }
};

export const getLectureById = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.lectureId);
        
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found!"
            });
        }

        return res.status(200).json({ lecture });
    } catch (error) {
        console.error("Get lecture by ID error:", error);
        return res.status(500).json({
            message: "Failed to get lecture"
        });
    }
};

export const togglePublishCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { publish } = req.query;

        const course = await Course.findByIdAndUpdate(
            courseId,
            { isPublished: publish === "true" },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            });
        }

        const statusMessage = course.isPublished ? "published" : "unpublished";
        return res.status(200).json({
            message: `Course ${statusMessage} successfully.`,
            course
        });
    } catch (error) {
        console.error("Toggle publish error:", error);
        return res.status(500).json({
            message: "Failed to update publish status"
        });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            });
        }

        // Delete thumbnail
        if (course.courseThumbnail) {
            const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
            await deleteMediaFromCloudinary(publicId);
        }

        // Delete all lectures and their videos
        const lectures = await Lecture.find({ _id: { $in: course.lectures } });
        for (const lecture of lectures) {
            if (lecture.publicId) {
                await deleteVideoFromCloudinary(lecture.publicId);
            }
            await Lecture.findByIdAndDelete(lecture._id);
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            message: "Course deleted successfully."
        });
    } catch (error) {
        console.error("Delete course error:", error);
        return res.status(500).json({
            message: "Failed to delete course"
        });
    }
};