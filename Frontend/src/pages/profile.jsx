import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { usePopup } from "../components/PopupProvider";
import {
  clearSession,
  clearResetPasswordFlow,
  DEFAULT_USER_AVATAR,
  fetchCurrentUser,
  getStoredUser,
  getUserBusinessName,
  getUserDisplayName,
  getUserPhoto,
  getUserRoleLabel,
  saveUserProfile,
} from "../services/api";
import "../components/profile.css";

const resizeImageToDataUrl = (file, maxWidth = 1200, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const ratio = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Failed to process image."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      image.onerror = () => reject(new Error("Failed to read image."));
      image.src = fileReader.result;
    };

    fileReader.onerror = () => reject(new Error("Failed to read image."));
    fileReader.readAsDataURL(file);
  });

const createProfileState = (user) => ({
  name: getUserDisplayName(user),
  email: user?.email || "",
  businessName: getUserBusinessName(user),
  role: getUserRoleLabel(user),
  profilePic: getUserPhoto(user),
  profilePicFile: null,
});

const Profile = () => {
  const navigate = useNavigate();
  const popup = usePopup();
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedData, setSavedData] = useState(() => createProfileState(getStoredUser()));
  const [formData, setFormData] = useState(() => createProfileState(getStoredUser()));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowPhotoMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncCurrentUser = async () => {
      try {
        const nextUser = await fetchCurrentUser();
        if (!isMounted) {
          return;
        }

        const nextState = createProfileState(nextUser);
        setSavedData(nextState);
        setFormData(nextState);
      } catch {
        // Keep session snapshot if fetching current user fails.
      }
    };

    syncCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const compressedImage = await resizeImageToDataUrl(file);
      setFormData((prev) => ({
        ...prev,
        profilePic: compressedImage,
        profilePicFile: file,
      }));
      setError("");
      setShowPhotoMenu(false);
    } catch (uploadError) {
      setError(uploadError.message || "Foto profil belum berhasil diproses.");
    }
  };

  const handleDeletePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePic: null, profilePicFile: null }));
    setShowPhotoMenu(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    const isConfirmed = await popup.confirm({
      title: { id: "Simpan Perubahan Profil", en: "Save Profile Changes" },
      message: {
        id: "Yakin ingin menyimpan perubahan pada profile kamu?",
        en: "Are you sure you want to save your profile changes?",
      },
      confirmText: { id: "Simpan", en: "Save" },
      cancelText: { id: "Batal", en: "Cancel" },
    });

    if (!isConfirmed) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const nextUser = await saveUserProfile({
        name: formData.name,
        businessName: formData.businessName,
        photo: formData.profilePic,
        avatarFile: formData.profilePicFile,
      });

      const nextState = createProfileState({
        ...getStoredUser(),
        ...nextUser,
      });

      setSavedData(nextState);
      setFormData(nextState);
      setIsEditing(false);
      setShowPhotoMenu(false);
      popup.notify({
        title: { id: "Profile Tersimpan", en: "Profile Saved" },
        message: {
          id: "Perubahan profile kamu berhasil diperbarui.",
          en: "Your profile changes were updated successfully.",
        },
      });
    } catch (saveError) {
      setError(
        saveError?.data?.message ||
          saveError?.message ||
          "Perubahan profil belum berhasil disimpan ke server.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...savedData });
    setIsEditing(false);
    setShowPhotoMenu(false);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogout = () => {
    clearSession();
    clearResetPasswordFlow();
    document.body.classList.add("page-exit");
    document.body.classList.add("auth-page-exit");
    window.setTimeout(() => {
      navigate("/login");
    }, 260);
  };

  return (
    <div className="profile-layout">
      <Sidebar activeMenu="" />

      <main className="profile-main-content">
        <div className="profile-inner-container">
          <header className="profile-header">
            <div className="user-profile-info">
              <div className="avatar-wrapper">
                <img
                  src={formData.profilePic || DEFAULT_USER_AVATAR}
                  alt="User Avatar"
                  className="profile-avatar-img"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />

                {isEditing && (
                  <div className="edit-photo-container" ref={menuRef}>
                    <button
                      className="edit-photo-badge"
                      onClick={() => setShowPhotoMenu((prev) => !prev)}
                      type="button"
                      aria-label="Edit photo"
                    >
                      <img
                        src="https://img.icons8.com/?size=100&id=sKp0dy2A108d&format=png&color=FFFFFF"
                        alt=""
                        width="14"
                        height="14"
                      />
                    </button>

                    {showPhotoMenu && (
                      <div className="photo-options-menu">
                        <button type="button" onClick={() => fileInputRef.current?.click()}>
                          Upload Photo
                        </button>
                        <button type="button" className="delete-btn" onClick={handleDeletePhoto}>
                          Delete Photo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <h1 className="user-display-name">{formData.name}</h1>
            </div>

            <div className="profile-header-actions">
              {isEditing ? (
                <>
                  <button className="btn-action-cancel" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                  </button>
                  <button className="btn-action-save" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button className="btn-action-edit" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>
          </header>

          <section className="profile-form-card">
            {error ? <p style={{ color: "#b42318", marginBottom: "16px" }}>{error}</p> : null}

            <div className="profile-form-grid">
              <div className="form-input-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="input-locked"
                />
              </div>
              <div className="form-input-group">
                <label>Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-input-group">
                <label>Role</label>
                <input
                  type="text"
                  value={formData.role}
                  disabled
                  className="input-locked"
                />
              </div>
            </div>

            {!isEditing && (
              <div className="profile-footer">
                <button className="btn-profile-logout" onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
