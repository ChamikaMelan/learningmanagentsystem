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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from "@/features/api/courseApi";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const MEDIA_API = "http://localhost:8000/api/v1/media";

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [uploadPdfInfo, setUploadPdfInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadType, setCurrentUploadType] = useState(null);
  const params = useParams();
  const { courseId, lectureId } = params;

  const {data:lectureData} = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(()=>{
    if(lecture){
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo({
        videoUrl: lecture.videoUrl,
        publicId: lecture.publicId
      });
      setUploadPdfInfo({
        pdfUrl: lecture.pdfUrl,
        pdfPublicId: lecture.pdfPublicId
      });
    }
  },[lecture]);

  const [editLecture, { data, isLoading, error, isSuccess }] = useEditLectureMutation();
  const [removeLecture, {data:removeData, isLoading:removeLoading, isSuccess:removeSuccess}] = useRemoveLectureMutation();

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    setCurrentUploadType(type);
    setMediaProgress(true);
    
    try {
      const endpoint = type === 'video' ? 'upload-video' : 'upload-pdf';
      const res = await axios.post(`${MEDIA_API}/${endpoint}`, formData, {
        onUploadProgress: ({ loaded, total }) => {
          setUploadProgress(Math.round((loaded * 100) / total));
        },
      });

      if (res.data.success) {
        if (type === 'video') {
          setUploadVideoInfo({
            videoUrl: res.data.data.url,
            publicId: res.data.data.public_id,
          });
        } else {
          setUploadPdfInfo({
            pdfUrl: res.data.data.url,
            pdfPublicId: res.data.data.public_id,
          });
        }
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(`${type} upload failed`);
    } finally {
      setMediaProgress(false);
      setCurrentUploadType(null);
    }
  };

  const editLectureHandler = async () => {
    await editLecture({
      lectureTitle,
      videoUrl: uploadVideoInfo?.videoUrl,
      publicId: uploadVideoInfo?.publicId,
      pdfUrl: uploadPdfInfo?.pdfUrl,
      pdfPublicId: uploadPdfInfo?.pdfPublicId,
      isPreviewFree: isFree,
      courseId,
      lectureId,
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  useEffect(()=>{
    if(removeSuccess){
      toast.success(removeData.message);
    }
  },[removeSuccess]);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled={removeLoading} variant="destructive" onClick={removeLectureHandler}>
            {removeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Please wait
              </>
            ) : "Remove Lecture"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
          />
        </div>

        <div className="my-5">
          <Label>
            Video <span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileUpload(e.target.files[0], 'video')}
            className="w-fit"
          />
          {uploadVideoInfo?.videoUrl && (
            <p className="text-sm text-muted-foreground mt-2">
              Current video: {uploadVideoInfo.videoUrl.split('/').pop()}
            </p>
          )}
        </div>

        <div className="my-5">
          <Label>PDF Material</Label>
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileUpload(e.target.files[0], 'pdf')}
            className="w-fit"
          />
          {uploadPdfInfo?.pdfUrl && (
            <p className="text-sm text-muted-foreground mt-2">
              Current PDF: {uploadPdfInfo.pdfUrl.split('/').pop()}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 my-5">
          <Switch checked={isFree} onCheckedChange={setIsFree} id="free-lecture" />
          <Label htmlFor="free-lecture">Is this video FREE</Label>
        </div>

        {mediaProgress && (
          <div className="my-4">
            <Progress value={uploadProgress} />
            <p>
              Uploading {currentUploadType}: {uploadProgress}%
            </p>
          </div>
        )}

        <div className="mt-4">
          <Button disabled={isLoading} onClick={editLectureHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Please wait
              </>
            ) : "Update Lecture"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;