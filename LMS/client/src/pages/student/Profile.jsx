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

import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangePasswordMutation,
} from "@/features/api/authApi";
import Swal from 'sweetalert2';

import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [path, setPath] = useState("");  // New state for path
  const [deleteUser] = useDeleteUserMutation();

  // Inside your Profile component:----change password part
const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmNewPassword, setConfirmNewPassword] = useState("");
const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
const [isCurrentPasswordInvalid, setIsCurrentPasswordInvalid] =
useState(false);

const [passwordValidation, setPasswordValidation] = useState({
  hasUpperCase: false,
  hasLowerCase: false,
  hasNumber: false,
  hasSpecialChar: false,
  isLongEnough: false
});

const validatePassword = (password) => {
  const validation = {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*]/.test(password),
      isLongEnough: password.length >= 6
  };
  setPasswordValidation(validation);
  return Object.values(validation).every(Boolean);
};

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
    // Show SweetAlert2 confirmation dialog
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action is irreversible.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#255680',
        cancelButtonColor: '#61707d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        background: "#b2bcd1", 
    });

    // If the user confirmed the deletion
    if (result.isConfirmed) {
        try {
            await deleteUser();
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Your account has been deleted.',
                confirmButtonText: 'Okay',
                background: "#b2bcd1", 
            });
            navigate("/login");
        } catch (error) {
            console.error("Failed to delete account:", error);
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Failed to delete account. Please try again.',
                confirmButtonText: 'Okay'
            });
        }
    }
};////
///change passwor-----------
const handlePasswordChange = async () => {
  if (!validatePassword(newPassword)) {
    toast.error("Password doesn't meet requirements");
    return;
}

if (newPassword !== confirmNewPassword) {
    toast.error("New passwords don't match");
    return;
}
  try {
      const result = await changePassword({ currentPassword, newPassword });
      if (result.data?.success) {
          toast.success("Password changed successfully");
          setIsPasswordDialogOpen(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
          setIsCurrentPasswordInvalid(false); // reset error
      } else {
        setIsCurrentPasswordInvalid(true); // show red border
          toast.error(result.error?.data?.message || "Failed to change password");
      }
  } catch (error) {
      toast.error("An error occurred while changing password");
  }
};


////
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

              {/*//////////change password*/}
             
<Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
    <DialogTrigger asChild>
        <Button size="sm" className="mt-2 ml-4">
            Change Password
        </Button>
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
                Enter your current password and set a new one.
            </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {setCurrentPassword(e.target.value);
                      setIsCurrentPasswordInvalid(false)}
                    }
                    className={`col-span-3 ${isCurrentPasswordInvalid ? "border-red-500" : ""}`}
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                     id="newPassword"
                     type="password"
                     value={newPassword}
                     onChange={(e) => {
                        setNewPassword(e.target.value);
                        validatePassword(e.target.value);
        }}
          className="col-span-3"
    />
            </div>
            {newPassword && (
    <div className="text-xs text-gray-500 mt-1">
        Password must contain:
        <ul className="list-disc pl-5">
            <li className={passwordValidation.hasUpperCase ? "text-green-500" : "text-red-500"}>
                One uppercase letter (A-Z)
            </li>
            <li className={passwordValidation.hasLowerCase ? "text-green-500" : "text-red-500"}>
                One lowercase letter (a-z)
            </li>
            <li className={passwordValidation.hasNumber ? "text-green-500" : "text-red-500"}>
                One number (0-9)
            </li>
            <li className={passwordValidation.hasSpecialChar ? "text-green-500" : "text-red-500"}>
                One special character (@, #, $, etc.)
            </li>
            <li className={passwordValidation.isLongEnough ? "text-green-500" : "text-red-500"}>
                At least 6 characters
            </li>
        </ul>
    </div>
)}


            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={`col-span-3 ${
                      confirmNewPassword && confirmNewPassword !== newPassword
                        ? "border-red-600"
                        : ""
                    }`}
                />
            </div>
        </div>
        <DialogFooter>
            <Button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
            >
                {isChangingPassword ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing...
                    </>
                ) : (
                    "Save changes"
                )}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>

{/**delte button create */}
<Button
    variant="ghost"
    size="icon"
    onClick={handleDeleteAccount}
    className="ml-3"
  >
    <Trash className="h-4 w-4 text-red-500" />
  </Button>

              
              
               {/*////////////change password*/}
              
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
                  <Label>My Role</Label>
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