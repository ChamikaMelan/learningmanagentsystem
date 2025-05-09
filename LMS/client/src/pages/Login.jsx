import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    path: ""
  });

  const [loginInput, setLoginInput] = useState({ email: "", password: "" });

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();
  
  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();
  
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    const isLongEnough = password.length >= 6;
    
    return {
      isValid: hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isLongEnough
    };
  };

  const changeInputHandler = (e, type) => { 
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleRegistration = async (type) => {
    if (type === "signup") {
      // Email validation
      if (!signupInput.email.endsWith("@gmail.com")) {
        toast.error("Only Gmail addresses are allowed");
        return;
      }

      // Password validation
      const passwordValidation = validatePassword(signupInput.password);
      if (!passwordValidation.isValid) {
        toast.error("Password must contain uppercase, lowercase, number, special character, and be at least 6 characters");
        return;
      }

      // Confirm password
      if (signupInput.password !== signupInput.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      // Required fields
      if (!signupInput.name || !signupInput.dob || !signupInput.path) {
        toast.error("Please fill all required fields");
        return;
      }
    }

    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;
    
    try {
      await action(inputData);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Signup successful.");
    }
    if (registerError) {
      toast.error(registerError?.data?.message || "Signup failed");
    }
    if (loginIsSuccess && loginData) {
      toast.success(loginData.message || "Login successful.");
      navigate("/");
    }
    if (loginError) { 
      toast.error(loginError?.data?.message || "Login failed");
    }
  }, [
    loginIsLoading,
    registerIsLoading,
    loginData,
    registerData,
    loginError,
    registerError,
    registerIsSuccess,
    loginIsSuccess,
    navigate
  ]);

  const passwordValidation = validatePassword(signupInput.password);

  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Name Field */}
              <div className="space-y-1">
                <Label htmlFor="name">Username</Label>
                <Input
                  type="text"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="username"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={signupInput.email}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Eg. example@gmail.com"
                  required
                  className={`
                    border-2
                    ${
                      signupInput.email && 
                      !signupInput.email.endsWith("@gmail.com")
                        ? "border-red-500 focus:border-red-500"
                        : "border-black-300 focus:border-black-500"
                    }
                    rounded-md px-3 py-2 focus:outline-none
                  `}
                />
                {signupInput.email && !signupInput.email.endsWith("@gmail.com") && (
                  <p className="text-red-500 text-sm mt-1">
                    Only Gmail addresses are allowed (e.g., user@gmail.com)
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={signupInput.password}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Must be 6+, A-Z, a-z, 0-9, and special chars"
                  required
                  className={`
                    border-2
                    ${
                      signupInput.password && 
                      !passwordValidation.isValid
                        ? "border-red-500 focus:border-red-500"
                        : "border-black-300 focus:border-black-500"
                    }
                    rounded-md px-3 py-2 focus:outline-none
                  `}
                />
                {signupInput.password && (
                  <div className="text-xs text-gray-500 mt-1">
                    Password must contain:
                    <ul className="list-disc pl-5">
                      <li className={passwordValidation.isLongEnough ? "text-green-500" : "text-red-500"}>
                        At least 6 characters
                      </li>
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
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={signupInput.confirmPassword}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Confirm your password"
                  required
                  className={`
                    border-2
                    ${
                      signupInput.password && 
                      signupInput.confirmPassword && 
                      signupInput.password !== signupInput.confirmPassword
                        ? "border-red-500 focus:border-red-500"
                        : "border-black-300 focus:border-black-500"
                    }
                    rounded-md px-3 py-2 focus:outline-none
                  `}
                />
                {signupInput.password && 
                 signupInput.confirmPassword && 
                 signupInput.password !== signupInput.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Date of Birth Field */}
              <div className="space-y-1">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  type="text"
                  name="dob"
                  value={signupInput.dob}
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => (e.target.type = 'text')}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Select Date of Birth"
                  required
                />
              </div>

              {/* Path/Role Field */}
              <div className="space-y-1">
                <Label htmlFor="path">Role</Label>
                <select 
                  name="path"
                  value={signupInput.path}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  className="w-full p-2 border rounded"
                  style={{ backgroundColor: "#070717", color: "white", border: "1px solid #161f33" }} 
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Web Developeing">Web Developing</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="graphic-designing">Graphic Designing</option>
                  <option value="Data science">Data Science</option>
                  <option value="Network Engineering">Network Engineering</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Mobile Application Developing">Mobile Application Development</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={registerIsLoading}
                onClick={() => handleRegistration("signup")}
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Login Tab Content */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your credentials to login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
            <div className="space-y-1">

  <Label htmlFor="email">Email</Label>
  <Input
    type="email"
    name="email"
    value={loginInput.email}
    onChange={(e) => changeInputHandler(e, "login")}
    placeholder="Eg. example@gmail.com"
    required
    className={`
      border-2
      ${
        loginInput.email && 
        !loginInput.email.endsWith("@gmail.com")
          ? "border-red-500 focus:border-red-500"
          : "border-black-300 focus:border-black-500"
      }
      rounded-md px-3 py-2 focus:outline-none
    `}
  />
  {loginInput.email && !loginInput.email.endsWith("@gmail.com") && (
    <p className="text-red-500 text-sm mt-1">
      Only Gmail addresses are allowed (e.g., user@gmail.com)
    </p>
  )}
</div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={loginInput.password}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder="Enter your password"
                  required
                />
                <div className="text-right">
    <a href="/forgot-password" className="text-sm text-blue-500 hover:underline"
    onClick={(e) => {
      e.preventDefault();
      navigate("/forgot-password");
    }}
  >
      Forgot Password?
    </a>
  </div>

              </div>
              
            </CardContent>
            <CardFooter>
              <Button
                disabled={loginIsLoading}
                onClick={() => handleRegistration("login")}
              >
                {loginIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;