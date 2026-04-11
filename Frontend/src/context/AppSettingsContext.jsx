import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "app_settings";

const defaultSettings = {
  name: "",
  email: "user@email.com",
  company: "InvesTechy",
  theme: "light",
  language: "id",
  notifications: true,
  password: "",
  confirmPassword: "",
};

const translations = {
  id: {
    navDashboard: "Dashboard",
    navNewProject: "Proyek Baru",
    navProjectList: "Daftar Proyek",
    navReportList: "Daftar Laporan",
    navConsult: "Konsultasi",
    navSettings: "Pengaturan",
    dashboardGreeting: "Hello",
    dashboardWelcome: "Selamat datang kembali",
    dashboardSearch: "Cari apa pun...",
    totalInvestment: "Total Investment",
    roiEstimation: "Estimasi ROI",
    paybackPeriod: "Payback Period",
    annualBenefit: "Manfaat Tahunan",
    settingsTitle: "Pengaturan",
    settingsSubtitle: "Kelola preferensi akun dan konfigurasi sistem",
    profileInformation: "Informasi Profil",
    fullName: "Nama Lengkap",
    email: "Email",
    company: "Perusahaan",
    systemPreferences: "Preferensi Sistem",
    theme: "Tema",
    language: "Bahasa",
    notifications: "Aktifkan Notifikasi",
    security: "Keamanan",
    newPassword: "Password Baru",
    confirmPassword: "Konfirmasi Password",
    saveChanges: "Simpan Perubahan",
    light: "Terang",
    dark: "Gelap",
    indonesian: "Bahasa Indonesia",
    english: "English",
    settingsSaved: "Pengaturan berhasil disimpan!",
    passwordMismatch: "Password tidak sama!",
  },
  en: {
    navDashboard: "Dashboard",
    navNewProject: "New Project",
    navProjectList: "Project List",
    navReportList: "Report List",
    navConsult: "Consult",
    navSettings: "Settings",
    dashboardGreeting: "Hello",
    dashboardWelcome: "Welcome back",
    dashboardSearch: "Search for anything...",
    totalInvestment: "Total Investment",
    roiEstimation: "ROI Estimation",
    paybackPeriod: "Payback Period",
    annualBenefit: "Annual Benefit",
    settingsTitle: "Settings",
    settingsSubtitle: "Manage your account preferences and system configuration",
    profileInformation: "Profile Information",
    fullName: "Full Name",
    email: "Email",
    company: "Company",
    systemPreferences: "System Preferences",
    theme: "Theme",
    language: "Language",
    notifications: "Enable Notifications",
    security: "Security",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    saveChanges: "Save Changes",
    light: "Light",
    dark: "Dark",
    indonesian: "Bahasa Indonesia",
    english: "English",
    settingsSaved: "Settings saved successfully!",
    passwordMismatch: "Passwords do not match!",
  },
};

const AppSettingsContext = createContext(null);

const readStoredSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

export function AppSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    setSettings(readStoredSettings());
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme || "light");
    document.documentElement.setAttribute("lang", settings.language || "id");
    document.body.setAttribute("data-theme", settings.theme || "light");
  }, [settings.language, settings.theme]);

  const updateSettings = (nextSettings) => {
    setSettings(nextSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
  };

  const value = useMemo(() => {
    const language = settings.language || "id";
    const dictionary = translations[language] || translations.id;

    return {
      settings,
      updateSettings,
      t: (key) => dictionary[key] || key,
    };
  }, [settings]);

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);

  if (!context) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }

  return context;
}
