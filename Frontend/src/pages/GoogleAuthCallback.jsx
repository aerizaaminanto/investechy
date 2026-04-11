import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  extractAuthSession,
  fetchCurrentUser,
  getStoredUser,
  setSession,
} from "../services/api";
import "../components/auth.css";

const decodeParamValue = (value) => {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const parseUserParam = (rawUser) => {
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    try {
      return JSON.parse(decodeParamValue(rawUser));
    } catch {
      return null;
    }
  }
};

const parseJsonParam = (rawValue) => {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    try {
      return JSON.parse(decodeParamValue(rawValue));
    } catch {
      return null;
    }
  }
};

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  const authPayload = useMemo(() => {
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash,
    );
    const getParam = (key) => searchParams.get(key) || hashParams.get(key) || null;

    const rawUser = getParam("user");
    const rawData = getParam("data");
    const parsedUser = parseUserParam(rawUser);
    const parsedData = parseJsonParam(rawData);
    const session = extractAuthSession({
      token:
        getParam("token") ||
        getParam("accessToken") ||
        getParam("access_token") ||
        getParam("idToken") ||
        getParam("id_token") ||
        null,
      user: parsedUser,
      data: parsedData || (parsedUser ? { user: parsedUser } : null),
    });

    return {
      ...session,
      error:
        getParam("error") ||
        getParam("message") ||
        parsedData?.error ||
        parsedData?.message ||
        null,
    };
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const completeGoogleLogin = async () => {
      try {
        if (authPayload.error) {
          throw new Error(authPayload.error);
        }

        if (authPayload.token) {
          setSession({
            token: authPayload.token,
            user: authPayload.user,
          });
        }

        const currentUser = await fetchCurrentUser().catch(() => authPayload.user || getStoredUser());

        if (!currentUser) {
          throw new Error("Google login belum mengembalikan data user ke aplikasi.");
        }

        setSession({
          token: authPayload.token || undefined,
          user: currentUser,
        });

        window.history.replaceState({}, document.title, window.location.pathname);

        if (!isMounted) {
          return;
        }

        const destination =
          currentUser?.role?.toLowerCase?.() === "admin"
            ? "/admin/dashboard"
            : "/dashboard";

        navigate(destination, { replace: true });
      } catch (loginError) {
        if (!isMounted) {
          return;
        }

        setError(
          loginError?.message ||
            "Google login belum berhasil diselesaikan.",
        );
      }
    };

    completeGoogleLogin();

    return () => {
      isMounted = false;
    };
  }, [authPayload, navigate]);

  return (
    <div className="auth-body">
      <div className="auth-container">
        <div className="auth-form-section" style={{ width: "100%" }}>
          <div className="form-box" style={{ margin: "80px auto" }}>
            <h2>Google Sign-In</h2>
            {error ? (
              <p style={{ color: "#b42318", marginTop: "16px" }}>{error}</p>
            ) : (
              <p style={{ marginTop: "16px", color: "#4A5568" }}>
                Menyelesaikan login Google...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
