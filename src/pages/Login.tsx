import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/logo.png" alt="FinTrack AI Logo" className="h-8 w-8 object-contain rounded-lg" />
          <div>
            <h1 className="font-display text-lg leading-tight text-foreground">FinTrack</h1>
            <span className="font-mono-dm text-xs text-muted-foreground">AI Edition</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="text-expense text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            Don't have an account?{" "}
            <span 
              className="text-primary cursor-pointer hover:underline"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
