import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

type UserShape = {
  username?: string;
  name?: string;
  email?: string;
  id?: string;
  _id?: string;
};

type RegisterResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: UserShape;
  data?: { user?: UserShape };
  userData?: UserShape;
  message?: string;
};

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!username.trim() || !email.trim() || !password) {
      return "All fields are required.";
    }
    const emailOk = /\S+@\S+\.\S+/.test(email);
    if (!emailOk) return "Please enter a valid email.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // Send both name and username to match various backends
      const payload = {
        username: username.trim(),
        name: username.trim(),
        email: email.trim(),
        password,
      };

      const { data } = await api.post<RegisterResponse>("/auth/register", payload);

      // Safely get token and user
      const token = data?.token || data?.accessToken || data?.jwt;
      const user =
        data?.user || data?.data?.user || data?.userData || undefined;

      if (token) {
        localStorage.setItem("token", token);
      }
      if (user) {
        const displayName =
          user.username || user.name || user.email?.split("@")[0] || "user";
        localStorage.setItem("username", displayName);
      }

      

      navigate("/chat");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Register failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border rounded p-2 text-black placeholder-gray-500"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <input
          className="w-full border rounded p-2 text-black placeholder-gray-500"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          className="w-full border rounded p-2 text-black placeholder-gray-500"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-black text-white rounded p-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p className="text-sm mt-3">
        Already have an account?{" "}
        <Link className="underline" to="/login">
          Login
        </Link>
      </p>
    </div>
  );
}