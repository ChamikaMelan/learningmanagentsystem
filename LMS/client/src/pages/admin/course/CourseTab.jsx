import Swal from "sweetalert2"; // Import SweetAlert2
import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEditCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation,
  useDeleteCourseMutation,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseTab = () => {
  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
  });

  const params = useParams();
  const courseId = params.courseId;
  const { data: courseByIdData, isLoading: courseByIdLoading, refetch } =
    useGetCourseByIdQuery(courseId);

  const [publishCourse] = usePublishCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [previewThumbnail, setPreviewThumbnail] = useState("");

  useEffect(() => {
    if (courseByIdData?.course) {
      const course = courseByIdData.course;
      setInput({
        courseTitle: course.courseTitle,
        subTitle: course.subTitle,
        description: course.description,
        category: course.category,
        courseLevel: course.courseLevel,
        coursePrice: course.coursePrice,
        courseThumbnail: "",
      });
      setPreviewThumbnail(course.courseThumbnail);
    }
  }, [courseByIdData]);

  const navigate = useNavigate();
  const [editCourse, { data, isLoading, isSuccess, error }] = useEditCourseMutation();

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    if (name === "coursePrice" && value < 0) {
      toast.error("Cannot Add Negative values for price");
      return; // Prevent updating state with negative value
    }
    setInput({ ...input, [name]: value });
  };

  const selectCategory = (value) => setInput({ ...input, category: value });
  const selectCourseLevel = (value) => setInput({ ...input, courseLevel: value });

  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const updateCourseHandler = async () => {
    const formData = new FormData();
    formData.append("courseTitle", input.courseTitle);
    formData.append("subTitle", input.subTitle);
    formData.append("description", input.description);
    formData.append("category", input.category);
    formData.append("courseLevel", input.courseLevel);
    formData.append("coursePrice", input.coursePrice);
    formData.append("courseThumbnail", input.courseThumbnail);

    await editCourse({ formData, courseId });
  };

  const publishStatusHandler = async (action) => {
    try {
      const response = await publishCourse({ courseId, query: action });
      if (response.data) {
        refetch();
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to publish or unpublish course");
    }
  };

  // Delete Course with SweetAlert confirmation
  const deleteCourseHandler = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You are about to delete this course. This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteCourse(courseId).unwrap();
          toast.success(response.message || "Course deleted successfully.");
          navigate("/admin/course");
        } catch (error) {
          toast.error(error?.data?.message || "Failed to delete course");
        }
      }
    });
  };

  // Delete Lecture with SweetAlert confirmation (if necessary)
  const deleteLectureHandler = (lectureId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You are about to delete this lecture. This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Assuming there's a deleteLecture mutation available
        // await deleteLecture({ courseId, lectureId });
        toast.success("Lecture deleted successfully.");
      }
    });
  };

  useEffect(() => {
    if (isSuccess) toast.success(data.message || "Course updated.");
    if (error) toast.error(error.data.message || "Failed to update course");
  }, [isSuccess, error]);

  if (courseByIdLoading) return <h1>Loading...</h1>;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Basic Course Information</CardTitle>
          <CardDescription>
            Make changes to your course here. Click save when you're done.
          </CardDescription>
        </div>
        <div className="space-x-2">
          <Button
            disabled={courseByIdData?.course.lectures.length === 0}
            variant="outline"
            onClick={() => publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}
          >
            {courseByIdData?.course.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button
            disabled={isDeleting}
            onClick={deleteCourseHandler}
            variant="destructive"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              "Remove Course"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-5">
          <div>
            <Label>Title</Label>
            <Input
              type="text"
              name="courseTitle"
              value={input.courseTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Fullstack developer"
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input
              type="text"
              name="subTitle"
              value={input.subTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Become a Fullstack developer from zero to hero in 2 months"
            />
          </div>
          <div>
            <Label>Description</Label>
            <RichTextEditor input={input} setInput={setInput} />
          </div>
          <div className="flex items-center gap-5">
            <div>
              <Label>Category</Label>
              <Select defaultValue={input.category} onValueChange={selectCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Category</SelectLabel>
                    <SelectItem value="Next JS">Next JS</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                    <SelectItem value="Fullstack Development">Fullstack Development</SelectItem>
                    <SelectItem value="MERN Stack Development">MERN Stack Development</SelectItem>
                    <SelectItem value="Javascript">Javascript</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Docker">Docker</SelectItem>
                    <SelectItem value="MongoDB">MongoDB</SelectItem>
                    <SelectItem value="HTML">HTML</SelectItem>
                    <SelectItem value="CyberSecurity">CyberSecurity</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Course Level</Label>
              <Select defaultValue={input.courseLevel} onValueChange={selectCourseLevel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a course level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Course Level</SelectLabel>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Advance">Advance</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price in (LKR)</Label>
              <Input
                type="number"
                name="coursePrice"
                value={input.coursePrice}
                onChange={changeEventHandler}
                className="w-fit"
                min="0" // Prevent negative values in the input
                step="1" // Ensure single-unit increments
              />
            </div>
          </div>
          <div>
            <Label>Course Thumbnail</Label>
            <Input type="file" onChange={selectThumbnail} accept="image/*" className="w-fit" />
            {previewThumbnail && (
              <img src={previewThumbnail} className="w-64 my-2 rounded-lg shadow" alt="Course Thumbnail" />
            )}
          </div>
          <div>
            <Button onClick={() => navigate("/admin/course")} variant="outline">Cancel</Button>
            <Button disabled={isLoading} onClick={updateCourseHandler}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTab;
