import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Check your email to confirm your account");
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
          <h2 className="font-display text-2xl text-foreground mb-1">Create your account</h2>
          <p className="text-muted-foreground text-sm">Start tracking your finances</p>
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

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && (
            <div className="text-expense text-sm text-center">{error}</div>
          )}

          {success && (
            <div className="text-primary text-sm text-center">{success}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Sign Up"}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <span 
              className="text-primary cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Sign in
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
