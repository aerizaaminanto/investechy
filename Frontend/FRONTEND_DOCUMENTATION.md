# Dokumentasi Frontend InvesTechy

## 1. Ringkasan Project

Frontend InvesTechy dibangun menggunakan:

- React 18
- Vite
- React Router DOM
- Redux Toolkit
- React Redux
- Redux thunk middleware bawaan dari `configureStore`

Tujuan dokumen ini:

- memetakan struktur frontend
- menunjukkan lokasi penggunaan React Redux
- menunjukkan lokasi penggunaan Redux Thunk
- menunjukkan lokasi penggunaan `useState`
- menunjukkan lokasi penggunaan `useEffect`
- merangkum file penting lain yang perlu dipahami tim

## 2. Lokasi File Penting

### Entry point dan bootstrap aplikasi

- `src/main.jsx`
  - membuat root React
  - membungkus aplikasi dengan `Provider` dari React Redux
  - membungkus aplikasi dengan `AppSettingsProvider`
- `src/App.jsx`
  - mendefinisikan routing utama
  - membungkus seluruh router dengan `PopupProvider`

### Folder utama

- `src/components`
  - komponen UI reusable
- `src/context`
  - context global non-Redux
- `src/pages`
  - halaman user
- `src/pagesadmin`
  - halaman admin
- `src/services`
  - helper API dan normalizer data
- `src/store`
  - store Redux, slice, dan thunk

## 3. Dependensi Frontend

Berdasarkan `package.json`, dependensi inti frontend adalah:

- `react`
- `react-dom`
- `react-router-dom`
- `@reduxjs/toolkit`
- `react-redux`
- `redux`
- `html2canvas`
- `jspdf`

Catatan penting:

- package ini tidak mendeklarasikan paket `redux-thunk` secara langsung di `package.json`
- namun `Redux Toolkit` melalui `configureStore()` sudah menyertakan thunk middleware secara default
- project ini memakai dua pola async:
  - `createAsyncThunk` dari Redux Toolkit
  - thunk manual berbentuk `(dispatch) => async (...)`

## 4. Arsitektur Frontend

### 4.1 Alur umum

1. `src/main.jsx` merender aplikasi.
2. `Provider` menghubungkan seluruh komponen ke Redux store.
3. `AppSettingsProvider` menangani pengaturan UI seperti theme dan language.
4. `PopupProvider` menyediakan alert, confirm, dan toast global.
5. `src/App.jsx` memetakan halaman user dan admin melalui React Router.
6. Halaman memanggil `dispatch(...)` untuk async thunk atau reducer Redux.
7. Thunk memanggil `src/services/api.js`.
8. Response dinormalisasi lalu masuk ke slice Redux atau state lokal komponen.

### 4.2 Provider yang aktif

- Redux Provider
  - file: `src/main.jsx`
- App Settings Provider
  - file: `src/context/AppSettingsContext.jsx`
- Popup Provider
  - file: `src/components/PopupProvider.jsx`

## 5. Routing Halaman

Seluruh route utama didefinisikan di `src/App.jsx`.

### Landing dan autentikasi

- `/` -> `Home`
- `/login` -> `Login`
- `/auth/google/callback` -> `GoogleAuthCallback`
- `/register` -> `Register`
- `/forgot-password` -> `ForgotPassword`
- `/verify-otp` -> `VerifyOtp`
- `/reset-password` -> `ResetPassword`

### Halaman user

- `/dashboard` -> `Dashboard`
- `/profile` -> `Profile`
- `/report-list` -> `Report`
- `/report-list/:id` -> `ReportSummary`
- `/report-detail/:projectId/:reportId` -> `ReportDetail`
- `/new-project` -> `NewProject`
- `/new-project/survey` -> `Survey`
- `/project-list` -> `ProjectList`
- `/edit-data/:id` -> `EditData`
- `/consult` -> `Consult`
- `/settings` -> `Settings`

### Halaman admin

- `/admin/dashboard` -> `AdminDashboard`
- `/admin/consultant` -> `ConsultantPage`
- `/admin/consultant/form` -> `ConsultantForm`
- `/admin/consultant/form/:id` -> `ConsultantForm`
- `/admin/settings` -> `AdminSettings`

### Redirect

- `/main`
  - admin -> `/admin/dashboard`
  - user biasa -> `/dashboard`
- `*`
  - fallback ke `/`

## 6. Dokumentasi Redux

## 6.1 Store utama

File: `src/store/store.js`

Store dibuat dengan `configureStore()` dan memiliki reducer:

- `project`
- `analysis`
- `ai`
- `consultant`

Implikasi penting:

- thunk middleware aktif secara default
- project menggunakan Redux Toolkit sebagai fondasi state management

## 6.2 Slice yang digunakan

### `src/store/projectSlice.js`

State utama:

- `projectList`
- `adminDashboard`
- `currentProject`
- `currentDraft`
- `selectedProject`
- `status`
- `loading`
- `error`

Reducer lokal:

- `clearProjectError`
- `resetCurrentProject`

Async flow yang ditangani:

- `fetchProjects`
- `fetchAdminDashboard`
- `createProject`
- `fetchProjectDraft`
- `fetchProjectById`
- `updateProjectDraft`
- `deleteProject`

Catatan:

- slice ini adalah pusat data project untuk halaman user dan admin
- ada helper `mergeProjectState()` untuk menggabungkan hasil update agar draft dan list tetap sinkron

### `src/store/consultantSlice.js`

State utama:

- `items`
- `currentItem`
- `loading`
- `saving`
- `deleting`
- `error`

Reducer lokal:

- `clearCurrentConsultant`

Async flow yang ditangani:

- `fetchConsultants`
- `fetchConsultantById`
- `createConsultant`
- `updateConsultant`
- `deleteConsultant`

### `src/store/analysisSlice.js`

State utama:

- `roi`
- `payback`
- `benefit`
- `investment`

Reducer:

- `setAnalysis`

### `src/store/aiSlice.js`

State utama:

- `loading`
- `result`

Reducer:

- `setLoading`
- `setResult`

## 6.3 Dokumentasi Redux Thunk

Project ini menggunakan dua jenis thunk.

### A. `createAsyncThunk` dari Redux Toolkit

#### `src/store/projectThunk.js`

Thunk yang tersedia:

- `fetchProjects`
- `createProject`
- `fetchProjectDraft`
- `fetchProjectById`
- `fetchAdminDashboard`
- `updateProjectDraft`
- `deleteProject`

Endpoint yang dipanggil:

- `GET /projects`
- `POST /projects`
- `GET /projects/:projectId`
- `GET /admin/dashboard`
- `PUT /projects/:projectId`
- `DELETE /projects/:projectId`

Catatan:

- file ini memakai helper dari `src/services/projectNormalizer.js`
- ada mekanisme override nama project di local storage agar nama project tetap konsisten walau backend mengembalikan nama generik

#### `src/store/consultantThunk.js`

Thunk yang tersedia:

- `fetchConsultants`
- `fetchConsultantById`
- `createConsultant`
- `updateConsultant`
- `deleteConsultant`

Endpoint yang dipanggil:

- `GET /consultants`
- `GET /consultants/:consultantId`
- `POST /consultants`
- `PUT /consultants/:id`
- `DELETE /consultants/:consultantId`

Catatan:

- mendukung upload file foto dengan `FormData`
- menyimpan override data consultant di local storage
- melakukan normalisasi banyak variasi nama field backend seperti `photo`, `image`, `foto`, `fee`, `harga`, `sessionFee`

### B. Thunk manual

#### `src/store/analysisThunk.js`

Thunk manual:

- `generateAnalysis = (data) => async (dispatch) => { ... }`

Perilaku:

- memanggil `POST /analysis`
- dispatch `setAnalysis(...)`

#### `src/store/aiThunk.js`

Thunk manual:

- `askAI = (question) => async (dispatch) => { ... }`

Perilaku:

- dispatch `setLoading(true)`
- memanggil `POST /ai`
- dispatch `setResult(...)`
- dispatch `setLoading(false)`

### Kesimpulan Redux Thunk

Lokasi implementasi thunk di project:

- `src/store/projectThunk.js`
- `src/store/consultantThunk.js`
- `src/store/analysisThunk.js`
- `src/store/aiThunk.js`

## 6.4 Lokasi penggunaan React Redux di komponen/halaman

### Provider

- `src/main.jsx`
  - `Provider`

### File yang memakai `useDispatch` dan/atau `useSelector`

- `src/components/ProjectStatusNotifier.jsx`
- `src/pages/Consult.jsx`
- `src/pages/EditData.jsx`
- `src/pages/ProjectList.jsx`
- `src/pages/report.jsx`
- `src/pages/ReportSummary.jsx`
- `src/pages/Survey.jsx`
- `src/pagesadmin/AdminDashboard.jsx`
- `src/pagesadmin/consultant.jsx`
- `src/pagesadmin/ConsultantForm.jsx`

### Mapping Redux per file

| File | Hook Redux | Slice yang dipakai | Kegunaan |
| --- | --- | --- | --- |
| `src/components/ProjectStatusNotifier.jsx` | `useDispatch`, `useSelector` | `project` | memantau daftar project dan notifikasi status |
| `src/pages/Consult.jsx` | `useDispatch`, `useSelector` | `consultant` | mengambil data konsultan untuk user |
| `src/pages/EditData.jsx` | `useDispatch`, `useSelector` | `project` | mengambil dan update draft project |
| `src/pages/ProjectList.jsx` | `useDispatch`, `useSelector` | `project` | daftar project user dan delete project |
| `src/pages/report.jsx` | `useDispatch`, `useSelector` | `project` | daftar report berbasis project |
| `src/pages/ReportSummary.jsx` | `useDispatch`, `useSelector` | `project` | menampilkan detail ringkasan project/report |
| `src/pages/Survey.jsx` | `useDispatch`, `useSelector` | `project` | submit data survey/update draft project |
| `src/pagesadmin/AdminDashboard.jsx` | `useDispatch`, `useSelector` | `project` | dashboard admin |
| `src/pagesadmin/consultant.jsx` | `useDispatch`, `useSelector` | `consultant` | daftar dan hapus konsultan |
| `src/pagesadmin/ConsultantForm.jsx` | `useDispatch`, `useSelector` | `consultant` | form tambah/edit konsultan |

## 7. Dokumentasi `useState`

Berikut lokasi penggunaan `useState` di project. Baris di bawah mengacu pada hasil pencarian file saat dokumentasi ini dibuat.

| File | State yang dipakai |
| --- | --- |
| `src/components/Navbar.jsx` | `isMenuOpen`, `setIsMenuOpen` |
| `src/components/PopupProvider.jsx` | `dialog`, `setDialog`; `toasts`, `setToasts` |
| `src/components/ProjectStatusNotifier.jsx` | `notifications`, `setNotifications` |
| `src/components/sidebar.jsx` | `isOpen`, `setIsOpen` |
| `src/context/AppSettingsContext.jsx` | `settings`, `setSettings` |
| `src/pages/Consult.jsx` | `animate`, `setAnimate` |
| `src/pages/Dashboard.jsx` | `isLoaded`, `setIsLoaded`; `storedUser`, `setStoredUser`; `dashboardData`, `setDashboardData` |
| `src/pages/EditData.jsx` | `isChatOpen`, `setIsChatOpen`; `showResultCard`, `setShowResultCard`; `sections`, `setSections`; `simulationForm`, `setSimulationForm`; `chatMessages`, `setChatMessages`; `chatHistoryEntries`, `setChatHistoryEntries`; `chatInput`, `setChatInput`; `chatLoading`, `setChatLoading`; `chatSending`, `setChatSending`; `chatError`, `setChatError` |
| `src/pages/ForgotPassword.jsx` | `isLoaded`, `setIsLoaded`; `email`, `setEmail`; `loading`, `setLoading`; `error`, `setError` |
| `src/pages/GoogleAuthCallback.jsx` | `error`, `setError` |
| `src/pages/Login.jsx` | `isLoaded`, `setIsLoaded`; `form`, `setForm`; `showPassword`, `setShowPassword`; `loading`, `setLoading`; `error`, `setError` |
| `src/pages/NewProject.jsx` | `isLoaded`, `setIsLoaded`; `formData`, `setFormData` |
| `src/pages/profile.jsx` | `isEditing`, `setIsEditing`; `showPhotoMenu`, `setShowPhotoMenu`; `isSaving`, `setIsSaving`; `error`, `setError`; `savedData`, `setSavedData`; `formData`, `setFormData` |
| `src/pages/ProjectList.jsx` | `animate`, `setAnimate`; `deletingId`, `setDeletingId` |
| `src/pages/Register.jsx` | `isLoaded`, `setIsLoaded`; `form`, `setForm`; `showPassword`, `setShowPassword`; `showConfirmPassword`, `setShowConfirmPassword`; `loading`, `setLoading`; `error`, `setError` |
| `src/pages/report.jsx` | `isLoaded`, `setIsLoaded`; `isOrderOpen`, `setIsOrderOpen`; `isStatusOpen`, `setIsStatusOpen`; `isProjectOpen`, `setIsProjectOpen`; `filterStatus`, `setFilterStatus`; `sortType`, `setSortType`; `reportLoading`, `setReportLoading`; `reportError`, `setReportError`; `reports`, `setReports`; `selectedProjectId`, `setSelectedProjectId` |
| `src/pages/ReportDetail.jsx` | `report`, `setReport`; `loading`, `setLoading`; `error`, `setError`; `isPreviewOpen`, `setIsPreviewOpen` |
| `src/pages/ResetPassword.jsx` | `isLoaded`, `setIsLoaded`; `showPassword`, `setShowPassword`; `showConfirmPassword`, `setShowConfirmPassword`; `email`, `setEmail`; `password`, `setPassword`; `confirmPassword`, `setConfirmPassword` |
| `src/pages/Settings.jsx` | `form`, `setForm`; `animate`, `setAnimate` |
| `src/pages/Survey.jsx` | `answers`, `setAnswers` |
| `src/pages/VerifyOtp.jsx` | `isLoaded`, `setIsLoaded`; `email`, `setEmail`; `otp`, `setOtp`; `loading`, `setLoading`; `error`, `setError` |
| `src/pagesadmin/AdminDashboard.jsx` | `filter`, `setFilter` |
| `src/pagesadmin/AdminSettings.jsx` | `theme`, `setTheme`; `language`, `setLanguage` |
| `src/pagesadmin/admsidebar.jsx` | `isOpen`, `setIsOpen` |
| `src/pagesadmin/consultant.jsx` | `positionFilter`, `setPositionFilter`; `alphabetFilter`, `setAlphabetFilter`; `feeFilter`, `setFeeFilter` |
| `src/pagesadmin/ConsultantForm.jsx` | `formData`, `setFormData` |
| `src/pagesadmin/useAdminPageTransition.js` | `transitionStage`, `setTransitionStage` |

### Ringkasan `useState`

- penggunaan `useState` ditemukan di 27 file
- dominan dipakai untuk:
  - animasi/transition halaman
  - form input
  - popup dan toast
  - filter, sorting, dan dropdown
  - state lokal halaman yang tidak perlu masuk Redux

## 8. Dokumentasi `useEffect`

Berikut lokasi penggunaan `useEffect` di project.

| File | Indikasi fungsi `useEffect` |
| --- | --- |
| `src/components/ProjectStatusNotifier.jsx` | memantau perubahan daftar project dan mengatur siklus notifikasi |
| `src/components/sidebar.jsx` | sinkronisasi sidebar dengan resize atau state UI |
| `src/context/AppSettingsContext.jsx` | memuat settings dari local storage dan sinkronisasi theme/language ke DOM |
| `src/pages/Consult.jsx` | memicu animasi awal halaman dan/atau fetch data konsultan |
| `src/pages/Dashboard.jsx` | inisialisasi dashboard, user tersimpan, dan data tampilan |
| `src/pages/EditData.jsx` | memuat draft project, sinkronisasi form/section, dan perilaku chat/result |
| `src/pages/ForgotPassword.jsx` | animasi awal halaman |
| `src/pages/GoogleAuthCallback.jsx` | memproses callback login Google |
| `src/pages/Login.jsx` | animasi awal halaman |
| `src/pages/NewProject.jsx` | animasi awal halaman |
| `src/pages/profile.jsx` | sinkronisasi user profile lokal dan interaksi menu foto |
| `src/pages/ProjectList.jsx` | fetch daftar project dan animasi awal |
| `src/pages/Register.jsx` | animasi awal halaman |
| `src/pages/report.jsx` | fetch project/report, sinkronisasi filter, dan animasi awal |
| `src/pages/ReportDetail.jsx` | fetch detail report berdasarkan route parameter |
| `src/pages/ReportSummary.jsx` | fetch summary project berdasarkan route parameter |
| `src/pages/ResetPassword.jsx` | validasi flow reset password dan animasi awal |
| `src/pages/Settings.jsx` | sinkronisasi form settings dan animasi awal |
| `src/pages/Survey.jsx` | inisialisasi halaman survey |
| `src/pages/VerifyOtp.jsx` | mengisi email awal dan animasi awal halaman |
| `src/pagesadmin/AdminDashboard.jsx` | fetch dashboard admin saat filter berubah / saat halaman dimuat |
| `src/pagesadmin/AdminSettings.jsx` | menerapkan theme/language admin settings |
| `src/pagesadmin/admsidebar.jsx` | sinkronisasi sidebar admin dengan state UI |
| `src/pagesadmin/consultant.jsx` | fetch list consultant dan sinkronisasi filter |
| `src/pagesadmin/ConsultantForm.jsx` | mode tambah/edit consultant, preload data, preview file/form |
| `src/pagesadmin/useAdminPageTransition.js` | mengatur status transisi halaman admin |

### Ringkasan `useEffect`

- penggunaan `useEffect` ditemukan di 26 file
- pola paling sering:
  - fetch data saat mount
  - mengaktifkan animasi setelah render awal
  - sinkronisasi state ke DOM atau local storage
  - memproses route parameter/callback auth

## 9. Dokumentasi Context dan Provider Non-Redux

### `src/context/AppSettingsContext.jsx`

Fungsi utama:

- menyimpan pengaturan aplikasi ke local storage dengan key `app_settings`
- menyediakan `settings`, `updateSettings`, dan `t(key)`
- mengubah attribute DOM:
  - `data-theme`
  - `lang`

Kapan dipakai:

- untuk pengaturan yang sifatnya UI/global tetapi tidak perlu masuk Redux

### `src/components/PopupProvider.jsx`

Fungsi utama:

- menyediakan API global:
  - `alert(...)`
  - `confirm(...)`
  - `notify(...)`
- mendukung lokalisasi popup berdasarkan bahasa dari `AppSettingsContext`

Kapan dipakai:

- untuk dialog dan toast lintas halaman tanpa prop drilling

## 10. Dokumentasi Service API

File utama: `src/services/api.js`

Tanggung jawab file ini:

- menentukan base URL API
- membangun header request
- memasukkan bearer token jika tersedia
- melakukan wrapper `fetch`
- menangani parsing JSON/text
- melempar error yang lebih konsisten

### Base URL

- default: `/api`
- dapat diubah lewat `VITE_API_URL`

### Method yang tersedia

- `api.get`
- `api.post`
- `api.put`
- `api.delete`

### Fitur auth/session

- `getGoogleAuthURL`
- `extractAuthSession`
- `setSession`
- `clearSession`
- `getStoredUser`
- `updateStoredUser`
- `fetchCurrentUser`
- `saveUserProfile`

### Key local storage yang dipakai di `api.js`

- `investechy_token`
- `investechy_user`
- `investechy_reset_password_email`
- `investechy_reset_password_otp_verified`
- `__localAvatarMode`
- `__localAvatarValue`

## 11. Dokumentasi Normalizer

### `src/services/projectNormalizer.js`

Fungsi utama:

- normalisasi `ObjectId` dan tanggal dari backend
- normalisasi `simulationHistory`
- menentukan `projectName` final
- menyimpan override nama project ke local storage

Key local storage yang dipakai:

- `investechy_project_overrides`
- `investechy_pending_project_override`

Penting dipahami karena:

- nama project di UI bisa berbeda dari response backend mentah
- file ini menjaga konsistensi daftar project dan detail project

## 12. Local Storage yang Dipakai Frontend

Ringkasan key yang teridentifikasi:

- `app_settings`
- `investechy_token`
- `investechy_user`
- `investechy_reset_password_email`
- `investechy_reset_password_otp_verified`
- `investechy_project_overrides`
- `investechy_pending_project_override`
- `investechy_consultant_overrides`
- `__localAvatarMode`
- `__localAvatarValue`

## 13. File Frontend yang Paling Penting Dipahami Lebih Dulu

Jika developer baru ingin onboarding cepat, urutan file yang disarankan:

1. `src/main.jsx`
2. `src/App.jsx`
3. `src/store/store.js`
4. `src/store/projectSlice.js`
5. `src/store/projectThunk.js`
6. `src/store/consultantSlice.js`
7. `src/store/consultantThunk.js`
8. `src/services/api.js`
9. `src/services/projectNormalizer.js`
10. `src/context/AppSettingsContext.jsx`
11. `src/components/PopupProvider.jsx`

## 14. Kesimpulan Teknis

### React

- project menggunakan React function component sepenuhnya
- state lokal banyak ditangani dengan `useState`
- side effect ditangani dengan `useEffect`

### Redux

- Redux sudah terpasang dengan baik lewat Redux Toolkit
- slice utama ada pada domain `project`, `consultant`, `analysis`, dan `ai`

### Redux Thunk

- async logic utama ada di:
  - `projectThunk.js`
  - `consultantThunk.js`
  - `analysisThunk.js`
  - `aiThunk.js`
- project menggabungkan `createAsyncThunk` dan thunk manual

### Catatan arsitektur

- data domain besar dikelola lewat Redux
- state UI lokal tetap dikelola di komponen dengan `useState`
- pengaturan aplikasi dan popup global dipisah ke Context agar Redux tidak terlalu penuh

## 15. Rekomendasi Pengembangan Selanjutnya

- tambahkan dokumentasi endpoint backend yang dipakai frontend
- pertimbangkan konsistensi penamaan file, misalnya `report.jsx` dan `profile.jsx` vs file PascalCase lain
- pertimbangkan memindahkan thunk manual `analysisThunk.js` dan `aiThunk.js` ke `createAsyncThunk` agar pola async seragam
- pertimbangkan menambahkan selector terpisah jika store makin besar
- pertimbangkan membuat folder `docs/` khusus bila dokumentasi frontend akan bertambah
