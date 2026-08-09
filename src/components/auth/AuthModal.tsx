import { useEffect, useState } from "react";
import { LogIn, LogOut, ShieldCheck, UserPlus, Sparkles, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export function AuthModal() {
  const [open, setOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const checkAuth = async () => {
    const token = localStorage.getItem("ia_session_token");
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "me", token }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem("ia_session_token");
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const action = isSignUp ? "signup" : "signin";
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, email, password, name }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Authentication failed.");
        return;
      }

      if (data.token) {
        localStorage.setItem("ia_session_token", data.token);
        setUser(data.user);
        setOpen(false);
        setEmail("");
        setPassword("");
        setName("");
      }
    } catch (err) {
      console.error("Auth submit error:", err);
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const token = localStorage.getItem("ia_session_token");
    if (token) {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "signout", token }),
      });
      localStorage.removeItem("ia_session_token");
    }
    setUser(null);
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 glow-emerald"
        >
          <Database className="size-3 text-emerald-400" />
          <span className="font-semibold">{user.name}</span>
          <span className="text-[10px] text-muted-foreground">({user.email})</span>
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
        >
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-500/30 bg-surface-raised/80 font-medium text-xs text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/10 px-2 sm:px-3 cursor-pointer"
        >
          <LogIn className="size-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">PostgreSQL </span>Auth
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-sidebar/95 backdrop-blur-xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <ShieldCheck className="size-5 text-emerald-400" />
            {isSignUp ? "Create Judge / Developer Account" : "Sign In to Interview Console"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Backed by Neon PostgreSQL (`POSTGRES_URL`) for session tracking, applicant
            authentication, and result storage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/15 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-foreground/90">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                required
                className="bg-surface text-sm"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-foreground/90">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="judge@hackathon.ai"
              required
              className="bg-surface text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs text-foreground/90">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="bg-surface text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
          >
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isSignUp ? (
              <>
                <UserPlus className="size-4" /> Sign Up with Postgres
              </>
            ) : (
              <>
                <LogIn className="size-4" /> Sign In
              </>
            )}
          </Button>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            {isSignUp ? "Already registered?" : "Need an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="font-medium text-emerald-400 hover:underline"
            >
              {isSignUp ? "Sign In instead" : "Create an account"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
