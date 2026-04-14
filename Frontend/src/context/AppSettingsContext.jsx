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
    projectsPortfolio: "Portofolio Proyek",
    projectsPortfolioSub: "Kelola dan simulasikan proyek investasi TI Anda",
    totalProjects: "Total Proyek",
    calculated: "Terhitung",
    waitingInput: "Menunggu Input",
    drafting: "Drafting",
    recentProjects: "Proyek Terbaru",
    newProject: "Proyek Baru",
    noProjects: "Belum ada proyek",
    startCreating: "Mulai dengan membuat analisis pertama Anda",
    projectName: "Nama Proyek",
    createdAt: "Dibuat Pada",
    viewDetail: "Lihat Detail",
    delete: "Hapus",
    deleting: "Menghapus...",
    editDataTitle: "Edit Data",
    editDataSubtitle: "Edit hasil generate AI untuk proyek ini, lalu simpan perubahan sesuai kebutuhanmu.",
    calculatedScale: "Skala Terhitung",
    mcfarlanQuadrant: "Kuadran McFarlan",
    expiresAt: "Kadaluarsa Pada",
    scenarioNameLabel: "Nama Skenario",
    scenarioDescription: "Gunakan nama skenario yang paling sesuai untuk simulasi ini.",
    scenarioPlaceholder: "Contoh: Skenario Optimis",
    addItem: "Tambah Item",
    removeItem: "Hapus",
    itemLabel: "Item",
    itemPlaceholder: "Contoh item",
    descriptionLabel: "Deskripsi",
    descriptionPlaceholder: "Tambahkan deskripsi item",
    nominalLabel: "Nominal",
    nominalPlaceholder: "Masukkan nominal",
    simulationSettings: "Pengaturan Simulasi",
    simulationSettingsSub: "Masukkan nilai rate dalam format persen, misalnya 5 berarti 5%.",
    inflationRate: "Tingkat Inflasi",
    taxRate: "Tingkat Pajak",
    discountRate: "Tingkat Diskonto",
    yearsExpected: "Tahun yang Diharapkan",
    aiHelpyGreeting: "Halo, saya AI Helpy. Ada yang ingin ditanyakan tentang proyek ini?",
    aiHelpyEmptyHistory: "Belum ada riwayat yang tersimpan.",
    aiHelpyEmptyChat: "Belum ada chat history. Coba mulai pertanyaan baru.",
    aiHelpyLoading: "Memuat riwayat chat...",
    aiHelpyErrorResponse: "Maaf, AI Helpy belum bisa merespons sekarang.",
    aiHelpyConnectionError: "Koneksi ke AI Helpy belum tersedia.",
    aiHelpySendError: "Pesan belum berhasil dikirim ke backend.",
    askAnything: "Tanya apa saja yang Anda butuhkan...",
    resultsSummary: "Ringkasan Hasil",
    resultsSummarySub: "Hasil ini langsung dihitung dari data yang baru saja kamu isi di halaman edit.",
    back: "Kembali",
    saving: "Menyimpan...",
    exportPdf: "Ekspor PDF",
    readyForReport: "Siap Untuk Laporan",
    needReview: "Perlu Review",
    loadingProjects: "Memuat proyek...",
    loadingDraft: "Memuat draf proyek...",
    otherItemsIncluded: "item lain tetap dihitung di total",
    needsAdjustment: "Proyek masih perlu penyesuaian tambahan sebelum implementasi penuh.",
    goodResults: "Proyek menunjukkan hasil yang baik dengan ROI {roi}% dan payback period {payback} tahun.",
    topProject: "Proyek Teratas",
    noTopProject: "Belum ada data proyek teratas.",
    investment: "Investasi",
    status: "Status",
    ieScoreAndRoiComparison: "Perbandingan Skor IE dan ROI",
    noComparisonData: "Belum ada data perbandingan.",
    ieScoreProjection: "Proyeksi Skor IE",
    statistics: "Statistik",
    ieScore: "Skor IE",
    roi: "ROI",
    welcomeMissYou: "Selamat datang kembali, kami rindu kehadiran Anda",
    logout: "Keluar",
    projectUpdate: "Pembaruan Proyek",
    isWaitingInput: "{projectName} sedang menunggu input pengguna.",
    aboutUs: "Tentang Kami",
    contact: "Kontak",
    login: "Masuk",
    register: "Daftar",
    incompleteData: "Data Belum Lengkap",
    fillAtLeastOne: "Isi minimal satu data dulu sebelum menyimpan.",
    refresh: "Segarkan",
    sending: "Mengirim...",
    send: "Kirim",
    you: "Anda",
    chatHistory: "Riwayat chat",
    currentConversation: "Percakapan saat ini",
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
    projectsPortfolio: "Projects Portfolio",
    projectsPortfolioSub: "Manage and simulate your IT investment projects",
    totalProjects: "Total Projects",
    calculated: "Calculated",
    waitingInput: "Waiting Input",
    drafting: "Drafting",
    recentProjects: "Recent Projects",
    newProject: "New Project",
    noProjects: "No projects yet",
    startCreating: "Start by creating your first analysis",
    projectName: "Project Name",
    createdAt: "Created At",
    viewDetail: "View Detail",
    delete: "Delete",
    deleting: "Deleting...",
    editDataTitle: "Edit Data",
    editDataSubtitle: "Edit the AI-generated results for this project, then save the changes according to your needs.",
    calculatedScale: "Calculated Scale",
    mcfarlanQuadrant: "McFarlan Quadrant",
    expiresAt: "Expires At",
    scenarioNameLabel: "Scenario Name",
    scenarioDescription: "Use the scenario name that best fits this simulation.",
    scenarioPlaceholder: "Example: Optimistic Scenario",
    addItem: "Add Item",
    removeItem: "Remove",
    itemLabel: "Item",
    itemPlaceholder: "Example item",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Add item description",
    nominalLabel: "Nominal",
    nominalPlaceholder: "Enter nominal amount",
    simulationSettings: "Simulation Settings",
    simulationSettingsSub: "Enter the rate value in percentage format, for example, 5 means 5%.",
    inflationRate: "Inflation Rate",
    taxRate: "Tax Rate",
    discountRate: "Discount Rate",
    yearsExpected: "Years Expected",
    aiHelpyGreeting: "Hello, I am AI Helpy. Anything you want to ask about this project?",
    aiHelpyEmptyHistory: "No history saved yet.",
    aiHelpyEmptyChat: "No chat history. Try starting a new question.",
    aiHelpyLoading: "Loading chat history...",
    aiHelpyErrorResponse: "Sorry, AI Helpy cannot respond right now.",
    aiHelpyConnectionError: "Connection to AI Helpy is not yet available.",
    aiHelpySendError: "Message failed to send to backend.",
    askAnything: "Ask anything you need...",
    resultsSummary: "Result Summary",
    resultsSummarySub: "These results are calculated directly from the data you just filled in the edit page.",
    back: "Back",
    saving: "Saving...",
    exportPdf: "Export PDF",
    readyForReport: "Ready For Report",
    needReview: "Need Review",
    loadingProjects: "Loading projects...",
    loadingDraft: "Loading project draft...",
    otherItemsIncluded: "other items are still included in the total",
    needsAdjustment: "The project still needs further adjustments before full implementation.",
    goodResults: "The project shows good results with an ROI of {roi}% and a payback period of {payback} years.",
    topProject: "Top Project",
    noTopProject: "No top project data yet.",
    investment: "Investment",
    status: "Status",
    ieScoreAndRoiComparison: "IE Score And ROI Comparison",
    noComparisonData: "No comparison data yet.",
    ieScoreProjection: "IE Score Projection",
    statistics: "Statistics",
    ieScore: "IE Score",
    roi: "ROI",
    welcomeMissYou: "Welcome back, We miss you coming",
    logout: "Log Out",
    projectUpdate: "Project Update",
    isWaitingInput: "{projectName} is waiting for user input.",
    aboutUs: "About Us",
    contact: "Contact",
    login: "Login",
    register: "Register",
    incompleteData: "Incomplete Data",
    fillAtLeastOne: "Please fill in at least one item before saving.",
    refresh: "Refresh",
    sending: "Sending...",
    send: "Send",
    you: "You",
    chatHistory: "Chat history",
    currentConversation: "Current conversation",
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
