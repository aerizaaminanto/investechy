import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import { usePopup } from "../components/PopupProvider";
import { useAppSettings } from "../context/AppSettingsContext";
import "./settings.css";

export default function Settings() {
  const { settings, updateSettings, t } = useAppSettings();
  const popup = usePopup();
  const [form, setForm] = useState(settings);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    document.body.classList.remove("page-exit");
    setAnimate(true);
  }, []);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (form.password !== form.confirmPassword) {
      await popup.alert({
        title: { id: "Periksa Password", en: "Check Your Password" },
        message: t("passwordMismatch"),
        tone: "danger",
      });
      return;
    }

    updateSettings(form);
    popup.notify({
      title: { id: "Pengaturan Tersimpan", en: "Settings Saved" },
      message: t("settingsSaved"),
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeMenu="Settings" />

      <main className={`main-content ${animate ? "page-enter" : ""}`}>
        <h1 className="settings-title">{t("settingsTitle")}</h1>
        <p className="settings-subtitle">{t("settingsSubtitle")}</p>

        <div className="settings-card">
          <h2>{t("profileInformation")}</h2>

          <div className="form-group">
            <label>{t("fullName")}</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>{t("email")}</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>{t("company")}</label>
            <input type="text" name="company" value={form.company} onChange={handleChange} />
          </div>
        </div>

        <div className="settings-card">
          <h2>{t("systemPreferences")}</h2>

          <div className="form-group">
            <label>{t("theme")}</label>
            <select name="theme" value={form.theme} onChange={handleChange}>
              <option value="light">{t("light")}</option>
              <option value="dark">{t("dark")}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t("language")}</label>
            <select name="language" value={form.language} onChange={handleChange}>
              <option value="id">{t("indonesian")}</option>
              <option value="en">{t("english")}</option>
            </select>
          </div>
        </div>

        <div className="settings-card">
          <h2>{t("security")}</h2>

          <div className="form-group">
            <label>{t("newPassword")}</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>{t("confirmPassword")}</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="settings-action">
          <button className="btn-save" onClick={handleSave}>
            {t("saveChanges")}
          </button>
        </div>
      </main>
    </div>
  );
}
