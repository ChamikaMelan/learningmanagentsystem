import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useForgotPasswordMutation,
  useVerifyOTPMutation,
  useResetPasswordMutation,
} from "@/features/api/authApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const validatePassword = (password) => {
  return {
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*]/.test(password),
    isLongEnough: password.length >= 6,
  };
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);

  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const handleSendOtp = async () => {
    if (!email.endsWith("@gmail.com")) {
      toast.error("Only Gmail addresses are allowed");
      return;
    }

    try {
      const result = await forgotPassword(email).unwrap();
      toast.success(result.message);
      setStep(2);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const result = await verifyOTP({ email, otp }).unwrap();
      toast.success(result.message);
      setStep(3);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to verify OTP");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const validation = validatePassword(newPassword);
    if (
      !validation.hasUpperCase ||
      !validation.hasLowerCase ||
      !validation.hasNumber ||
      !validation.hasSpecialChar ||
      !validation.isLongEnough
    ) {
      toast.error(
        "Password must be at least 6 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    try {
      const result = await resetPassword({ email, otp, newPassword }).unwrap();
      toast.success(result.message);
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {step === 1
              ? "Forgot Password"
              : step === 2
              ? "Verify OTP"
              : "Reset Password"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSendOtp}
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
                <p className="text-sm text-gray-500">
                  We've sent a 6-digit OTP to your email
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>

              {newPassword && (
                <div className="text-sm space-y-1">
                  {(() => {
                    const v = validatePassword(newPassword);
                    return (
                      <>
                        <p className={v.isLongEnough ? "text-green-600" : "text-red-500"}>
                          • At least 6 characters
                        </p>
                        <p className={v.hasUpperCase ? "text-green-600" : "text-red-500"}>
                          • Contains uppercase letter
                        </p>
                        <p className={v.hasLowerCase ? "text-green-600" : "text-red-500"}>
                          • Contains lowercase letter
                        </p>
                        <p className={v.hasNumber ? "text-green-600" : "text-red-500"}>
                          • Contains a number
                        </p>
                        <p className={v.hasSpecialChar ? "text-green-600" : "text-red-500"}>
                          • Contains special character (!@#$%^&*)
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className={
                    confirmPassword && newPassword !== confirmPassword
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleResetPassword}
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
