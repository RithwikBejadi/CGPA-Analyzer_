import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://cgpa-analyzer-mq5f.onrender.com";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password, rememberMe);

      if (!result.success) {
        setError(
          result.error || "Login failed. Please check your credentials.",
        );
        setLoading(false);
        return;
      }

      console.log("Login successful! Redirecting to dashboard...");
      navigate("/dashboard");
    } catch (err) {
      console.error("Network error during login", err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === "Google") {
      window.location.href = `${API_BASE_URL}/api/auth/google`;
    } else if (provider === "GitHub") {
      setError("GitHub authentication is not yet configured");
    }
  };

  const handleForgotPassword = () => {
    alert("Forgot password feature will be implemented");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 w-full">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center group">
              <span className="text-xl font-semibold tracking-tight text-gray-900 group-hover:text-gray-600 transition-colors">
                CGPA Calculator
              </span>
            </Link>
            <div className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-gray-900 hover:text-gray-600 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4 py-8 sm:py-16 lg:py-24 w-full">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
            <div className="hidden lg:block space-y-8 w-full">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                  Welcome back
                </h1>
                <p className="text-lg lg:text-xl text-gray-600">
                  Sign in to continue tracking your academic performance.
                </p>
              </div>
            </div>

            <div className="w-full max-w-xl mx-auto lg:max-w-none">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 lg:p-12 w-full">
                <div className="space-y-6 sm:space-y-8 w-full">
                  <div className="text-center lg:text-left space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                      Sign in
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Enter your credentials to access your account
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-900"
                      >
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all duration-200 placeholder:text-gray-400 text-gray-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-900"
                        >
                          Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          required
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all duration-200 placeholder:text-gray-400 pr-12 text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-700 cursor-pointer"
                      >
                        Remember me for 30 days
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin("Google")}
                      className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        Google
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialLogin("GitHub")}
                      className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        GitHub
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600 mt-6 lg:hidden">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-gray-900 hover:text-gray-600 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
