const DEFAULT_BASE_URL = "/api";
const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || DEFAULT_BASE_URL;

export const getGoogleAuthURL = (callbackPath = "/auth/google/callback") => {
  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const redirectUri = `${currentOrigin}${callbackPath}`;
  const params = new URLSearchParams({
    redirect_uri: redirectUri,
  });
  return `${API_BASE_URL}/auth/google?${params.toString()}`;
};

export const GOOGLE_AUTH_URL = getGoogleAuthURL();

const TOKEN_KEY = "investechy_token";
const USER_KEY = "investechy_user";
const RESET_PASSWORD_EMAIL_KEY = "investechy_reset_password_email";
const RESET_PASSWORD_OTP_VERIFIED_KEY = "investechy_reset_password_otp_verified";
const LOCAL_AVATAR_MODE_KEY = "__localAvatarMode";
const LOCAL_AVATAR_VALUE_KEY = "__localAvatarValue";
export const DEFAULT_USER_AVATAR =
  "https://img.icons8.com/?size=100&id=bC0O28EGsK5f&format=png&color=00381e";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);

export const extractAuthSession = (payload) => {
  if (!isObject(payload)) {
    return {
      token: null,
      user: null,
    };
  }

  const token =
    payload.token ||
    payload.access_token ||
    payload.accessToken ||
    payload.idToken ||
    payload.id_token ||
    payload.data?.token ||
    payload.data?.access_token ||
    payload.data?.accessToken ||
    payload.data?.idToken ||
    payload.data?.id_token ||
    payload.data?.data?.token ||
    payload.data?.data?.access_token ||
    payload.data?.data?.accessToken ||
    payload.data?.data?.idToken ||
    payload.data?.data?.id_token ||
    null;

  const userCandidate =
    payload.user ||
    payload.profile ||
    payload.data?.user ||
    payload.data?.profile ||
    payload.data?.data?.user ||
    payload.data?.data?.profile ||
    payload.data ||
    null;

  const user = isObject(userCandidate) ? userCandidate : null;

  return { token, user };
};

export const setSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(withLocalAvatarPreference(user)));
  }
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const setResetPasswordEmail = (email) => {
  const normalizedEmail = String(email || "").trim();

  if (!normalizedEmail) {
    localStorage.removeItem(RESET_PASSWORD_EMAIL_KEY);
    return;
  }

  localStorage.setItem(RESET_PASSWORD_EMAIL_KEY, normalizedEmail);
};

export const getResetPasswordEmail = () =>
  localStorage.getItem(RESET_PASSWORD_EMAIL_KEY);

export const setResetPasswordOtpVerified = (isVerified) => {
  if (isVerified) {
    localStorage.setItem(RESET_PASSWORD_OTP_VERIFIED_KEY, "true");
    return;
  }

  localStorage.removeItem(RESET_PASSWORD_OTP_VERIFIED_KEY);
};

export const isResetPasswordOtpVerified = () =>
  localStorage.getItem(RESET_PASSWORD_OTP_VERIFIED_KEY) === "true";

export const clearResetPasswordFlow = () => {
  localStorage.removeItem(RESET_PASSWORD_EMAIL_KEY);
  localStorage.removeItem(RESET_PASSWORD_OTP_VERIFIED_KEY);
};

export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

export const updateStoredUser = (nextUser) => {
  if (!nextUser || typeof nextUser !== "object") {
    return;
  }

  const currentUser = getStoredUser() || {};
  localStorage.setItem(USER_KEY, JSON.stringify(mergeStoredUser(currentUser, nextUser)));
};

export const getUserDisplayName = (user) =>
  user?.name ||
  user?.fullName ||
  user?.username ||
  user?.businessOwnerName ||
  "User";

export const getUserBusinessName = (user) =>
  user?.businessName || user?.company || user?.companyName || "";

export const getUserRoleLabel = (user) => {
  const rawRole = user?.role;

  if (!rawRole) {
    return "User";
  }

  if (typeof rawRole !== "string") {
    return "User";
  }

  if (rawRole.toLowerCase() === "user") {
    return "UMKM Owner";
  }

  return rawRole
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

export const getUserPhoto = (user) =>
  getResolvedUserPhoto(user);

const getRawUserPhoto = (user) =>
  user?.photo ||
  user?.photoUrl ||
  user?.avatar ||
  user?.avatarUrl ||
  user?.profilePhoto ||
  user?.profilePicture ||
  user?.profilePic ||
  user?.image ||
  user?.picture ||
  null;

const withLocalAvatarPreference = (user, explicitPhoto) => {
  if (!isObject(user)) {
    return user;
  }

  if (explicitPhoto !== undefined) {
    return {
      ...user,
      [LOCAL_AVATAR_MODE_KEY]: explicitPhoto ? "custom" : "default",
      [LOCAL_AVATAR_VALUE_KEY]: explicitPhoto || null,
    };
  }

  if (user?.[LOCAL_AVATAR_MODE_KEY] === "default") {
    return {
      ...user,
      [LOCAL_AVATAR_MODE_KEY]: "default",
      [LOCAL_AVATAR_VALUE_KEY]: null,
    };
  }

  if (user?.[LOCAL_AVATAR_MODE_KEY] === "custom") {
    return {
      ...user,
      [LOCAL_AVATAR_MODE_KEY]: "custom",
      [LOCAL_AVATAR_VALUE_KEY]: user?.[LOCAL_AVATAR_VALUE_KEY] || getRawUserPhoto(user),
    };
  }

  const detectedPhoto = getRawUserPhoto(user);
  if (detectedPhoto) {
    return {
      ...user,
      [LOCAL_AVATAR_MODE_KEY]: "custom",
      [LOCAL_AVATAR_VALUE_KEY]: detectedPhoto,
    };
  }

  return {
    ...user,
    [LOCAL_AVATAR_MODE_KEY]: "default",
    [LOCAL_AVATAR_VALUE_KEY]: null,
  };
};

const mergeStoredUser = (currentUser, nextUser) => {
  const mergedUser = {
    ...(currentUser || {}),
    ...(nextUser || {}),
  };

  const currentMode = currentUser?.[LOCAL_AVATAR_MODE_KEY];
  const currentValue = currentUser?.[LOCAL_AVATAR_VALUE_KEY] || null;
  const nextMode = nextUser?.[LOCAL_AVATAR_MODE_KEY];
  const nextValue = nextUser?.[LOCAL_AVATAR_VALUE_KEY];

  if (nextMode === "default") {
    return withLocalAvatarPreference(mergedUser, null);
  }

  if (nextMode === "custom") {
    return withLocalAvatarPreference(mergedUser, nextValue || getRawUserPhoto(nextUser));
  }

  if (currentMode === "default") {
    return withLocalAvatarPreference(mergedUser, null);
  }

  if (currentMode === "custom" && currentValue) {
    return withLocalAvatarPreference(mergedUser, currentValue);
  }

  return withLocalAvatarPreference(mergedUser);
};

const getResolvedUserPhoto = (user) => {
  if (!user) return null;
  if (user?.[LOCAL_AVATAR_MODE_KEY] === "default") return null;
  if (user?.[LOCAL_AVATAR_MODE_KEY] === "custom") {
    return user?.[LOCAL_AVATAR_VALUE_KEY] || getRawUserPhoto(user) || null;
  }

  return getRawUserPhoto(user);
};

const splitUserName = (fullName = "") => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const extractUserObject = (payload) => {
  if (!isObject(payload)) {
    return null;
  }

  const userCandidate =
    payload.user ||
    payload.profile ||
    payload.data?.user ||
    payload.data?.profile ||
    payload.data?.data?.user ||
    payload.data?.data?.profile ||
    payload.data ||
    payload.data?.data ||
    null;

  return isObject(userCandidate) ? userCandidate : null;
};

export const buildUserProfilePayload = ({ name, businessName, photo }) => {
  const normalizedName = String(name || "").trim();
  const normalizedBusinessName = String(businessName || "").trim();
  const normalizedPhoto = photo || null;
  const { firstName, lastName } = splitUserName(normalizedName);

  return {
    name: normalizedName,
    fullName: normalizedName,
    firstName,
    lastName,
    businessName: normalizedBusinessName,
    company: normalizedBusinessName,
    companyName: normalizedBusinessName,
    ...(normalizedPhoto
      ? {
          photo: normalizedPhoto,
          photoUrl: normalizedPhoto,
          avatar: normalizedPhoto,
          avatarUrl: normalizedPhoto,
          profilePhoto: normalizedPhoto,
          profilePicture: normalizedPhoto,
          profilePic: normalizedPhoto,
          image: normalizedPhoto,
          picture: normalizedPhoto,
        }
      : {
          photo: null,
          photoUrl: null,
          avatar: null,
          avatarUrl: null,
          profilePhoto: null,
          profilePicture: null,
          profilePic: null,
          image: null,
          picture: null,
        }),
  };
};

const buildHeaders = (headers = {}) => {
  const finalHeaders = {
    "ngrok-skip-browser-warning": "true",
    ...headers,
  };

  const token = getToken();
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  return finalHeaders;
};

const request = async (endpoint, options = {}) => {
  const isFormDataBody = options.body instanceof FormData;
  const headers = buildHeaders(options.headers);

  if (!isFormDataBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      body?.message || body?.error || "Request failed.",
    );
    error.status = response.status;
    error.data = body;
    throw error;
  }

  return body;
};

const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, {
      ...options,
      method: "GET",
    }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: (endpoint, options = {}) =>
    request(endpoint, {
      ...options,
      method: "DELETE",
    }),
};

export const saveUserProfile = async (profile) => {
  const payload = buildUserProfilePayload(profile);
  const formData = new FormData();
  formData.append("firstName", payload.firstName || "");
  formData.append("lastName", payload.lastName || "");
  formData.append("businessName", payload.businessName || "");
  formData.append("removeAvatar", profile.photo ? "false" : "true");

  if (profile.avatarFile instanceof File) {
    formData.append("avatar", profile.avatarFile);
  }

  const endpoints = ["/auth/profile", "/users/me", "/users/profile", "/profile", "/auth/me"];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const requestBody = endpoint === "/auth/profile" ? formData : payload;
      const response = await api.put(endpoint, requestBody);
      const responseUser = extractUserObject(response) || {};
      const nextUser = withLocalAvatarPreference({
        ...responseUser,
        ...payload,
      }, profile.photo || null);

      updateStoredUser(nextUser);
      return nextUser;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Profile update failed.");
};

export const fetchCurrentUser = async () => {
  const endpoints = ["/auth/profile", "/users/me", "/users/profile", "/profile", "/auth/me"];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      const nextUser = extractUserObject(response);

      if (nextUser) {
        updateStoredUser(nextUser);
        return mergeStoredUser(getStoredUser() || {}, nextUser);
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Failed to fetch current user.");
};

export default api;
