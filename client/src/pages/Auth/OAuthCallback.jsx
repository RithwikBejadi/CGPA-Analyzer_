import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { useAuth } from "../../contexts/AuthContext";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");

    if (!code) {
      navigate("/login?error=oauth_failed", { replace: true });
      return;
    }

    const exchangeCode = async () => {
      try {
        const response = await apiClient("/api/auth/exchange-code", {
          method: "POST",
          body: JSON.stringify({ code }),
          skipAuthRedirect: true,
        });

        if (response.ok) {
          await checkAuth();
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/login?error=oauth_failed", { replace: true });
        }
      } catch {
        navigate("/login?error=oauth_failed", { replace: true });
      }
    };

    exchangeCode();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Completing sign-in…
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
