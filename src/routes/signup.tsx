import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/store";
import { Camera } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/signup")({
  ssr: false,
  component: SignupPage,
});

function SignupPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  // Registration fields state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"admin" | "officer">("officer");
  const [country, setCountry] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [password, setPassword] = useState("");
  
  // Validation states
  const [emailError, setEmailError] = useState("");

  // Profile picture upload state
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  if (user) return <Navigate to="/" />;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateEmail = (val: string) => {
    setEmail(val);
    if (!val) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError("Please enter a valid email address (e.g. user@example.com)");
      return false;
    }
    setEmailError("");
    return true;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-xl shadow-lg border border-border/50 bg-card animate-in fade-in duration-300">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl text-center font-bold">Register</CardTitle>
          <CardDescription className="text-center text-sm">Create a new VendorBridge account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Avatar Selector from PC */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div 
              className="group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted hover:border-primary/50 overflow-hidden transition-all duration-300 shadow-inner"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="User Avatar" 
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Camera className="h-7 w-7 mb-1 group-hover:text-primary transition-colors duration-200" />
                  <span className="text-[10px] font-medium">Add Photo</span>
                </div>
              )}
              
              {/* Hover overlay */}
              {avatarUrl && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={avatarInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange} 
            />
            <span className="text-xs text-muted-foreground mt-2">
              {avatarUrl ? "Click to change photo" : "Select profile photo from PC"}
            </span>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              
              // Final validation check
              if (!validateEmail(email)) {
                return;
              }

              const fullName = `${firstName} ${lastName}`.trim();
              const extra = {
                firstName,
                lastName,
                phone,
                country,
                additionalInfo,
                username: email.split("@")[0]
              };
              
              login(email, fullName, avatarUrl, role, extra);
              navigate({ to: "/" });
            }}
          >
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
              </div>
            </div>

            {/* Email & Phone Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className={emailError ? "text-destructive" : ""}>Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => validateEmail(e.target.value)} 
                  placeholder="john@example.com"
                  className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {emailError && (
                  <p className="text-xs text-destructive mt-1 font-medium">{emailError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            {/* Role & Country */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(val: "admin" | "officer") => setRole(val)}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="officer">Officer (Procurement)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" required value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea 
                id="additionalInfo" 
                value={additionalInfo} 
                onChange={(e) => setAdditionalInfo(e.target.value)} 
                placeholder="Tell us any additional requirements or notes..." 
                className="min-h-[80px]"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <Button type="submit" className="w-full h-10 select-none font-semibold text-sm">Register</Button>
            <p className="text-center text-xs text-muted-foreground pt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}