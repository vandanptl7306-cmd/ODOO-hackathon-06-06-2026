import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/store";
import { Camera } from "lucide-react";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: LoginPage,
});

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("officer");
  const [password, setPassword] = useState("demo1234");
  
  // Custom image state
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

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border border-border/50 bg-card animate-in fade-in duration-300">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">Sign in to your VendorBridge workspace.</CardDescription>
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
              login(username, undefined, avatarUrl);
              navigate({ to: "/" });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full h-10 select-none">Sign in</Button>
            <p className="text-center text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-accent hover:underline">Register</Link>
            </p>
            <p className="rounded-md bg-muted p-3 text-center text-[11px] text-muted-foreground leading-relaxed">
              Demo build — any username/password works. Select a profile picture and use the role switcher after signing in.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}