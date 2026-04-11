import React, { useEffect, useState } from "react";
import SidebarAdmin from "./admsidebar";
import { usePopup } from "../components/PopupProvider";
import { useAppSettings } from "../context/AppSettingsContext";
import { useAdminPageTransition } from "./useAdminPageTransition";
import "./adminTransitions.css";
import "./AdminSettings.css";

const AdminSettings = () => {
  const { settings, updateSettings, t } = useAppSettings();
  const popup = usePopup();
  const { transitionClassName } = useAdminPageTransition();
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("id");

  useEffect(() => {
    setTheme(settings.theme || "light");
    setLanguage(settings.language || "id");
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      ...settings,
      theme,
      language,
    });
    popup.notify({
      title: { id: "Pengaturan Tersimpan", en: "Settings Saved" },
      message: t("settingsSaved"),
    });
  };

  return (
    <div className="admin-container">
      <SidebarAdmin activeMenu="Settings" />

      <main className={`admin-content ${transitionClassName}`}>
        <div className="settings-card">
          <h1 className="settings-title">{t("systemPreferences")}</h1>

          <div className="form-group">
            <label>{t("theme")}</label>
            <select className="form-control" value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">{t("light")}</option>
              <option value="dark">{t("dark")}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t("language")}</label>
            <select className="form-control" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="id">{t("indonesian")}</option>
              <option value="en">{t("english")}</option>
            </select>
          </div>

          <div className="settings-actions">
            <button className="btn-save-settings" type="button" onClick={handleSave}>
              {t("saveChanges")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
