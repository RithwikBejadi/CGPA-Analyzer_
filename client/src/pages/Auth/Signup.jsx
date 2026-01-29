import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "../../config/axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://cgpa-analyzer-mq5f.onrender.com";

const Signup = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeId: "",
  });
  const [colleges, setColleges] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState("");

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

  const handleAddCollege = async (e) => {
    e.preventDefault();
    setError("");
    if (!newCollegeName.trim()) {
      setError("College name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/colleges", {
        name: newCollegeName.trim(),
      });
      // Add the new college to the list and select it
      setColleges((prev) => [...prev, res.data.college]);
      setFormData((prev) => ({ ...prev, collegeId: res.data.college.id }));
      setShowAddCollege(false);
      setNewCollegeName("");
    } catch (err) {
      console.error("Failed to add college:", err);
      if (err.response?.status === 409) {
        // College already exists, we can use it
        setFormData((prev) => ({
          ...prev,
          collegeId: err.response.data.college.id,
        }));
        setShowAddCollege(false);
      } else {
        setError(
          err.response?.data?.error ||
            "Failed to add college. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axios.get("/api/colleges");
        setColleges(res.data.colleges || []);
      } catch (err) {
        console.error("Failed to fetch colleges:", err);
      }
    };
    fetchColleges();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms and Privacy Policy");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      );
      return;
    }

    const usernameRegex =
      /^(?=.{3,30}$)(?!.*[.]{2})[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*$/;
    if (!usernameRegex.test(formData.username)) {
      setError(
        "Username must be 3-30 characters, alphanumeric with optional ._- separators",
      );
      return;
    }

    if (!formData.collegeId) {
      setError("Please select your college");
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        collegeId: formData.collegeId,
      });

      // Auto-login after successful registration
      const loginResult = await login(formData.email, formData.password, false);

      if (loginResult.success) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage =
        err.response?.data?.error || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    if (provider === "Google") {
      window.location.href = `${API_BASE_URL}/api/auth/google`;
    } else if (provider === "GitHub") {
      setError("GitHub authentication is not yet configured");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-900 dark:via-navy-900 dark:to-navy-800 w-full transition-colors duration-200">
      <nav className="bg-white/80 dark:bg-navy-800/80 backdrop-blur-md border-b border-gray-200 dark:border-navy-700 sticky top-0 z-50 w-full transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center group">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                CGPA Calculator
              </span>
            </Link>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4 py-8 sm:py-16 lg:py-24 w-full">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
            <div className="hidden lg:block space-y-8 animate-fade-in w-full">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                  Start Your Journey
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  Begin tracking your academic progress and stay organized
                  throughout your college experience.
                </p>
              </div>

              <div className="space-y-6 pt-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-white rounded-xl flex items-center justify-center border-2 border-gray-200 dark:border-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6 text-black dark:text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Free Forever
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      No hidden costs, no premium tiers - completely free to use
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-white rounded-xl flex items-center justify-center border-2 border-gray-200 dark:border-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6 text-black dark:text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Secure & Private
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Your academic data is encrypted and never shared
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-white rounded-xl flex items-center justify-center border-2 border-gray-200 dark:border-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6 text-black dark:text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Quick Setup
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Get started in under a minute - it's that simple
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-white rounded-xl flex items-center justify-center border-2 border-gray-200 dark:border-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6 text-black dark:text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Works Everywhere
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Access from any device - mobile, tablet, or desktop
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-xl mx-auto lg:max-w-none">
              <div className="bg-white dark:bg-navy-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-navy-700 p-6 sm:p-8 lg:p-12 w-full transition-colors duration-200">
                <div className="space-y-6 sm:space-y-8 w-full">
                  <div className="text-center lg:text-left space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Create account
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      Get started with your free account today
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleSocialSignup("Google")}
                      className="flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-navy-900 border border-gray-300 dark:border-navy-700 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-700 hover:border-gray-400 dark:hover:border-navy-600 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Google
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialSignup("GitHub")}
                      className="flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-navy-900 border border-gray-300 dark:border-navy-700 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-700 hover:border-gray-400 dark:hover:border-navy-600 transition-all duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        GitHub
                      </span>
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-navy-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-navy-800 text-gray-500 dark:text-gray-400">
                        Or sign up with email
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="john_doe"
                        required
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-navy-900 border border-gray-300 dark:border-navy-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent focus:bg-white dark:focus:bg-navy-900 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        3-30 characters, letters, numbers, and ._- only
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-900 dark:text-white"
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
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-navy-900 border border-gray-300 dark:border-navy-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent focus:bg-white dark:focus:bg-navy-900 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="collegeId"
                        className="block text-sm font-medium text-gray-900 dark:text-white"
                      >
                        College
                      </label>
                      {!showAddCollege ? (
                        <div className="space-y-2">
                          <select
                            id="collegeId"
                            name="collegeId"
                            value={formData.collegeId}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-navy-900 border border-gray-300 dark:border-navy-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent focus:bg-white dark:focus:bg-navy-900 transition-all duration-200 text-gray-900 dark:text-white"
                          >
                            <option value="">Select your college</option>
                            {colleges.map((college) => (
                              <option key={college.id} value={college.id}>
                                {college.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setShowAddCollege(true)}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium mt-1"
                          >
                            Can't find your college? Add it here
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newCollegeName}
                              onChange={(e) =>
                                setNewCollegeName(e.target.value)
                              }
                              placeholder="Enter college name"
                              className="flex-1 px-4 py-3.5 bg-gray-50 dark:bg-navy-900 border border-gray-300 dark:border-navy-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent focus:bg-white dark:focus:bg-navy-900 transition-all duration-200 text-gray-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={handleAddCollege}
                              disabled={loading}
                              className="px-4 py-3.5 bg-white dark:bg-white text-black dark:text-black rounded-xl hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              {loading ? "Adding..." : "Add"}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddCollege(false);
                              setNewCollegeName("");
                            }}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
                          >
                            ← Back to college selection
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a strong password"
                          required
                          minLength={6}
                          className="w-full px-4 py-3.5 bg-gray-50 dark:bg-navy-900 border border-gray-300 dark:border-navy-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent focus:bg-white dark:focus:bg-navy-900 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-12 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Must be at least 8 characters with uppercase, lowercase,
                        number, and special character
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Confirm password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Re-enter your password"
                          required
                          minLength={6}
                          className="w-full px-4 py-3.5 bg-gray-50 dark:bg-navy-900 border border-gray-300 dark:border-navy-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent focus:bg-white dark:focus:bg-navy-900 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-12 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-navy-700 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white cursor-pointer bg-white dark:bg-navy-900"
                      />
                      <label
                        htmlFor="terms"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        I agree to the{" "}
                        <a
                          href="#"
                          className="font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-white dark:bg-white text-black dark:text-black py-3.5 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? "Creating account..." : "Create account"}
                    </button>
                  </form>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6 lg:hidden">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
