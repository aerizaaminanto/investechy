import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SidebarAdmin from "./admsidebar";
import { usePopup } from "../components/PopupProvider";
import { clearCurrentConsultant } from "../store/consultantSlice";
import {
  createConsultant,
  fetchConsultantById,
  fetchConsultants,
  updateConsultant,
} from "../store/consultantThunk";
import { useAdminPageTransition } from "./useAdminPageTransition";
import "./adminTransitions.css";
import "./ConsultantForm.css";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  whatsapp: "",
  positions: [],
  positionInput: "",
  fee: "",
  photoPreview: null,
  photoFile: null,
  removePhoto: false,
};

const normalizePosition = (value = "") => value.trim().replace(/\s+/g, " ");

const formatWhatsappValue = (value = "") => {
  const normalized = String(value || "").trim();
  if (!normalized) return "";

  if (normalized.startsWith("https://wa.me/")) {
    return normalized.replace("https://wa.me/", "");
  }

  return normalized.replace(/\D/g, "");
};

const formatWhatsappLink = (value = "") => {
  const normalized = formatWhatsappValue(value);
  return normalized ? `https://wa.me/${normalized}` : "";
};

const formatMailtoValue = (value = "") => String(value || "").trim().replace(/^mailto:/i, "");

const getConsultantFeeValue = (consultant) => {
  const rawFee =
    consultant?.harga_per_sesi ??
    consultant?.sessionFee ??
    consultant?.perSessionFee ??
    consultant?.fee ??
    consultant?.price ??
    consultant?.harga;

  if (typeof rawFee === "number") {
    return rawFee.toString();
  }

  if (typeof rawFee === "string") {
    const normalizedFee = rawFee.replace(/[^\d]/g, "");
    return normalizedFee || "";
  }

  return "";
};

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const mapConsultantToFormData = (consultant) => {
  if (!consultant) {
    return { ...EMPTY_FORM };
  }

  const { firstName, lastName } = splitName(
    consultant.nama || [consultant.firstName, consultant.lastName].filter(Boolean).join(" "),
  );

  const photoUrl = consultant.photoUrl || consultant.photo || consultant.image || consultant.foto || null;

  return {
    firstName,
    lastName,
    email: formatMailtoValue(consultant.email),
    whatsapp: formatWhatsappValue(consultant.whatsapp || consultant.nomor_whatsapp || ""),
    positions: Array.isArray(consultant.spesialisasi)
      ? consultant.spesialisasi.filter(Boolean)
      : consultant.spesialisasi
        ? [consultant.spesialisasi]
        : consultant.position
          ? [consultant.position]
          : [],
    positionInput: "",
    fee: getConsultantFeeValue(consultant),
    photoPreview: photoUrl,
    photoFile: null,
    removePhoto: false,
  };
};

const mapFormDataToPayload = (formData) => {
  const nama = [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim();
  const feeValue = Number.parseInt(String(formData.fee || "").replace(/[^\d]/g, ""), 10);
  const normalizedFee = Number.isNaN(feeValue) ? 0 : feeValue;
  const spesialisasi = formData.positions.map(normalizePosition).filter(Boolean);
  const whatsappLink = formatWhatsappLink(formData.whatsapp);
  const normalizedEmail = formatMailtoValue(formData.email);

  return {
    nama,
    spesialisasi,
    whatsapp: whatsappLink,
    nomor_whatsapp: whatsappLink,
    email: normalizedEmail ? `mailto:${normalizedEmail}` : "",
    fee: normalizedFee,
    harga: normalizedFee,
    price: normalizedFee,
    sessionFee: normalizedFee,
    perSessionFee: normalizedFee,
    harga_per_sesi: normalizedFee,
    photoFile: formData.photoFile,
    removePhoto: formData.removePhoto,
    existingPhotoUrl: formData.photoPreview,
  };
};

const ConsultantForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const popup = usePopup();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const isEditMode = Boolean(id);
  const { items, currentItem, loading, saving, error } = useSelector((state) => state.consultant);
  const { transitionClassName, navigateWithTransition } = useAdminPageTransition();

  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const suggestedPositions = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .flatMap((consultant) =>
              Array.isArray(consultant?.spesialisasi)
                ? consultant.spesialisasi
                : consultant?.spesialisasi
                  ? [consultant.spesialisasi]
                  : [],
            )
            .map(normalizePosition)
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [items],
  );

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchConsultants());
    }

    if (isEditMode) {
      dispatch(fetchConsultantById(id));
      return;
    }

    dispatch(clearCurrentConsultant());
    setFormData({ ...EMPTY_FORM });
  }, [dispatch, id, isEditMode, items.length]);

  useEffect(() => {
    if (isEditMode && currentItem) {
      setFormData(mapConsultantToFormData(currentItem));
    }
  }, [currentItem, isEditMode]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAddPosition = () => {
    const nextPosition = normalizePosition(formData.positionInput);
    if (!nextPosition) {
      return;
    }

    setFormData((prev) => {
      if (prev.positions.some((item) => item.toLowerCase() === nextPosition.toLowerCase())) {
        return { ...prev, positionInput: "" };
      }

      return {
        ...prev,
        positions: [...prev.positions, nextPosition],
        positionInput: "",
      };
    });
  };

  const handleRemovePosition = (positionToRemove) => {
    setFormData((prev) => ({
      ...prev,
      positions: prev.positions.filter((item) => item !== positionToRemove),
    }));
  };

  const handlePositionKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddPosition();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setFormData((prev) => ({
      ...prev,
      photoPreview: previewUrl,
      photoFile: file,
      removePhoto: false,
    }));
  };

  const handleDeletePhoto = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setFormData((prev) => ({
      ...prev,
      photoPreview: null,
      photoFile: null,
      removePhoto: true,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = mapFormDataToPayload(formData);

    if (!payload.nama || !payload.email || payload.spesialisasi.length === 0) {
      await popup.alert({
        title: { id: "Data Belum Lengkap", en: "Incomplete Data" },
        message: {
          id: "Lengkapi nama, email, dan posisi terlebih dahulu.",
          en: "Please complete name, email, and position first.",
        },
        tone: "danger",
      });
      return;
    }

    const action = isEditMode ? updateConsultant({ id, payload }) : createConsultant(payload);
    const resultAction = await dispatch(action);

    if (!resultAction.type.endsWith("/rejected")) {
      popup.notify({
        title: isEditMode
          ? { id: "Konsultan Diperbarui", en: "Consultant Updated" }
          : { id: "Konsultan Ditambahkan", en: "Consultant Added" },
        message: isEditMode
          ? {
              id: "Perubahan profil konsultan berhasil disimpan.",
              en: "The consultant profile changes were saved successfully.",
            }
          : {
              id: "Konsultan baru berhasil ditambahkan ke direktori.",
              en: "A new consultant was added to the directory successfully.",
            },
      });
      navigateWithTransition("/admin/consultant");
    }
  };

  return (
    <div className="admin-page-layout">
      <SidebarAdmin activeMenu="Consultant" />

      <main className={`admin-content-area ${transitionClassName}`}>
        <header className="form-header-container">
          <h2 className="form-title">Consultant Profile</h2>
        </header>

        {loading && isEditMode && <p>Loading consultant data...</p>}
        {error && <p style={{ color: "#b42318" }}>{error}</p>}

        <form id="profileForm" className="profile-form-container" onSubmit={handleSubmit}>
          <div className="photo-section-group">
            <label className="input-label">Photo</label>
            <div className="photo-box-wrapper">
              <div className="photo-display-area" onClick={() => fileInputRef.current?.click()}>
                {formData.photoPreview ? (
                  <img src={formData.photoPreview} alt="Preview" className="img-preview-fill" />
                ) : (
                  <div className="upload-placeholder">
                    <img
                      src="https://img.icons8.com/?size=100&id=2445&format=png&color=BBBBBB"
                      alt="upload"
                    />
                    <span>Tap to upload</span>
                  </div>
                )}
              </div>

              {formData.photoPreview && (
                <div className="photo-action-container">
                  <button type="button" className="photo-btn edit-photo" onClick={() => fileInputRef.current?.click()}>
                    Edit Photo
                  </button>
                  <button type="button" className="photo-btn delete-photo" onClick={handleDeletePhoto}>
                    Delete Photo
                  </button>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
          </div>

          <div className="inputs-grid-layout">
            <div className="input-group">
              <label className="input-label">First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Your First Name"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Your Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Registered Email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label className="input-label">WhatsApp Number</label>
              <input
                type="text"
                name="whatsapp"
                placeholder="6281234567890"
                value={formData.whatsapp}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Position</label>
              <div className="position-editor">
                <div className="position-input-row">
                  <input
                    type="text"
                    name="positionInput"
                    list="consultant-position-options"
                    placeholder="Add a position then press Enter"
                    value={formData.positionInput}
                    onChange={handleInputChange}
                    onKeyDown={handlePositionKeyDown}
                  />
                  <button type="button" className="position-add-btn" onClick={handleAddPosition}>
                    Add
                  </button>
                </div>
                <datalist id="consultant-position-options">
                  {suggestedPositions.map((position) => (
                    <option key={position} value={position} />
                  ))}
                </datalist>
                <div className="position-chip-list">
                  {formData.positions.length === 0 && <span className="position-empty">No positions added yet.</span>}
                  {formData.positions.map((position) => (
                    <span key={position} className="position-chip">
                      {position}
                      <button
                        type="button"
                        className="position-chip-remove"
                        onClick={() => handleRemovePosition(position)}
                        aria-label={`Remove ${position}`}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Per Session Fee</label>
              <input
                type="text"
                name="fee"
                placeholder="IDR"
                value={formData.fee}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-actions-bottom">
            <button
              type="button"
              className="btn-rect cancel"
              onClick={() => navigateWithTransition("/admin/consultant")}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn-rect save" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ConsultantForm;
