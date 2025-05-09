import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/features/api/authApi";

import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [path, setPath] = useState("");  // New state for path
  const [deleteUser] = useDeleteUserMutation();

  const { data, isLoading, isError, error, refetch } = useLoadUserQuery();
  const [
    updateUser,
    {
      data: updateUserData,
      isLoading: updateUserIsLoading,
      isError: isUpdateError,
      error: updateError,
      isSuccess,
    },
  ] = useUpdateUserMutation();

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  //delete function
  
  const handleDeleteAccount = async () => {
    toast(
        (t) => (
            <div className="flex flex-col items-center gap-4">
                <p className="text-center">
                    Are you sure you want to delete your account? <br />
                    This action is <span className="text-red-500 font-bold">irreversible</span>.
                </p>
                <div className="flex gap-4">
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={async () => {
                            try {
                                await deleteUser();
                                toast.success("Account deleted successfully.");
                                navigate("/login");
                            } catch (error) {
                                console.error("Failed to delete account:", error);
                                toast.error("Failed to delete account. Please try again.");
                            }
                            toast.dismiss(t); // Close the toast
                        }}
                    >
                        OK
                    </button>
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                        onClick={() => toast.dismiss(t)} // Close the toast on cancel
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ),
        { duration: Infinity } // Keeps the toast open until the user responds
    );
};////

  
  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("profilePhoto", profilePhoto);
    formData.append("path", path);  // Add path to form data
    await updateUser(formData);
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(updateUserData?.message || "Profile updated.");
    }
    if (isUpdateError) {
      toast.error(updateError?.message || "Failed to update profile");
    }
  }, [updateError, updateUserData, isSuccess, isUpdateError]);

  if (isLoading) return <h1>Profile Loading...</h1>;
  if (isError) return <h1>Error: {error?.message || "Failed to load profile"}</h1>;

  const user = data?.user;

  if (!user) return <h1>No user data found</h1>;

  return (
    <div className="max-w-4xl mx-auto px-4 my-10">
      <h1 className="font-bold text-2xl text-center md:text-left">MY PROFILE</h1>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4">
            <AvatarImage
              src={user?.photoUrl || "https://github.com/shadcn.png"}
              alt="@shadcn"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 ">
              Name:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {user.name}
              </span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 ">
              Email:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {user.email}
              </span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 ">
              Role:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {user.role.toUpperCase()}
              </span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 ">
              Date of Birth:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {new Date(user.dob).toLocaleDateString()}
              </span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 ">
              My Role:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {user.path}
              </span>
            </h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="mt-2">
                Edit Profile
              </Button>
            </DialogTrigger>

              <Button size="sm" className="mt-2 ml-4" onClick={handleDeleteAccount}>
                Delete My Account
              </Button>
              <Button size="sm" className="mt-2 ml-4" >
                Change Password
              </Button>
           
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Profile Photo</Label>
                  <Input
                    onChange={onChangeHandler}
                    type="file"
                    accept="image/*"
                    className="col-span-3"
                  />
                </div>
                {/* Dropdown for Path */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>My Path</Label>
                  <Select onValueChange={setPath} value={path}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select your path" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web Developeing">Web Developeing</SelectItem>
                      <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                      <SelectItem value="graphic-designing">Graphic Designing</SelectItem>
                      <SelectItem value="Data science">Data Science</SelectItem>
                      <SelectItem value="Network Engineering">Network Engineering</SelectItem>
                      <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                      <SelectItem value="Mobile Application Developing">Mobile Application Developing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={updateUserIsLoading}
                  onClick={updateUserHandler}
                >
                  {updateUserIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                      wait
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div>
        <h1 className="font-medium text-lg">My Courses</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-5">
          {user.enrolledCourses?.length === 0 ? (
            <h1>You haven't enrolled yet</h1>
          ) : (
            user.enrolledCourses?.map((course) => (
              <Course course={course} key={course._id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;