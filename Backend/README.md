# IT Investment Backend Server

Ini adalah dokumentasi komprehensif untuk aplikasi *backend* Sistem Manajemen dan Analisis Kelayakan Investasi IT. Dibangun di atas fondasi Node.js, Express, dan basis data MongoDB, aplikasi ini tidak hanya berfungsi sebagai medium CRUD biasa, melainkan juga menaungi perhitungan kompleks dan algoritma asinkron melalui AI.

---

## 🏆 Arsitektur & Hierarki Kode

Sebelum menyelami detail fungsionalitas, perlu dipahami bahwa struktur *backend* ini telah direfaktor agar sangat modular:
- **`src/models/`**: Menampung *blueprint* database Mongoose (e.g., `Project.js`). Terdapat sentralisasi impor melalui `index.js` agar file lain cukup mengimpor folder `/models`.
- **`src/controllers/`**: Menampung logika interaksi API HTTP dengan *client*.
- **`src/services/`**: Seluruh *logic* algoritma (LLM, perhitungan finansial matematis, aturan strategi *Mcfarlan*) dipisahkan ke sini. Fungsi-fungsi pelayanan tidak terikat pada satu *controller* dan bisa didaur ulang.

---

## 🚀 Bedah Fungsionalitas Modul **Project**

Inti dari aplikasi ini adalah menilai rancangan proyek IT baru secara otomatis. Modul *Project* akan menavigasi siklus mulai dari input awal, estimasi dari *Intelligence Model*, hingga sistem simulasi manual jika *user* merasa ada data yang perlu disesuaikan.

### 1. Tahap Inisiasi (`POST /api/projects` - createProject)
Saat *user* membuat draf evaluasi baru, hanya diperlukan form data demografi perusahaan dasar dan form kuesioner IT (kuantitatif). *Controller* akan melalui beberapa langkah otomasi internal:
1. **Validasi Fundamental**: Memastikan semua _nested objects_ milih *businessDomain* dan *technologyDomain* tersedia.
2. **Business Scale Mapping**: Menentukan apakah skala bisnis merupakan Mikro, Kecil, Menengah, atau Besar melalui kalkulasi jumlah karyawan (`employeeCount`).
3. **McFarlan Strategic Grid Analytics (`mcfarlanService.js`)**: Angka hasil survei diproses di *service* penilai untuk memasukkan arsitektur IT potensial ke kuadran strategisnya (*Infrastructure*, *Investment*, *Breakthrough Management*, atau *Strategic*).
4. **Drafting Tersimpan Cepat**: Sistem akan menyimpan draf statusnya dengan kode `DRAFTING` sehingga API *response* (201 Created) bisa dikembalikan ke HTTP *client* secara kilat, tanpa perlu menyebabkan pengguna menunggu lama saat mengunggah.
5. **Autopilot AI LLM (`llmService.js`)**: Di *background* / proses asinkron, sistem kita mengeksekusi integrasi dengan Gemini 2.5 Flash API (*Large Language Model*). Gemini diberikan taksonomi bisnis yang didaftarkan guna menganalisa dan menerka besaran komponen finansial murni seperti:
   - Biaya Modal / CAPEX (*Capital Expenditure*).
   - Biaya Operasional / OPEX (*Operating Expense*).
   - *Tangible Benefits* (Benefit Nyata) & *Intangible Benefits* (Benefit Tak Tampak).
   Setelah Gemini menjawab dan sukses men-*generate* komponen lengkap, status Project secara harfiah akan di-update ke `WAITING_USER_INPUT`.

### 2. Modul Simulasi Finansial & Parameter Custom (`PUT /api/projects/:id` - updateDraftProject)

Di tahap ini, AI mungkin sudah menghasilkan draf komponen, namun *user* diberi kendali untuk memodifikasi total nilai atau mensimulasikan masa depan investasinya sebelum dianggap resmi kelak. Request ini menerima matriks kompleks dari *client*, menghitungnya dengan rumusan investasi, dan menaruh rekam jejak tersebut.

#### A. Input yang Diterima Draf Simulasi:
Pengguna dapat memberikan 4 konfigurasi ekonomi sebagai *setting* ke API beserta *scenarioName*. **Nilai-nilai ini juga memiliki patokan *default* di *controller* jika tidak diisi:**
- **`inflationRate` (Default 5% atau 0.05)**: Inflasi diasumsikan teraplikasi ke pengeluaran bulanan (Opex) dan pemasukan (Benefit) setiap pergantian tahun.
- **`taxRate` (Default 11% atau 0.11)**: Tingkat pajak dipotongkan semata pada Kas Bersih positif (*Gross Benefit - Gross Opex*) sebelum menjadi *Net Cash Flow*.
- **`discountRate` (Default 10% atau 0.1)**: Tolok ukur nilai waktu dari uang (*time value of money*) untuk kalkulasi NPV. 
- **`years` (Default 3 Tahun)**: Jangka umur estimasi *timeline* investasi proyek tersebut diproyeksikan.

#### B. Bagaimana Simulasi Dihitung secara Real-time?
`projectController` secara pintar akan membuat ekstrak tabel virtual berdasarkan parameter tahun ke depan:
1. Menyortir seluruh item Capex untuk menjadi modal awal *Year 0* (`initialCost`).
2. Melakukan looping tahun ke tahun:
   - Kalkulasi Opex tahunan = `Base Opex * (1 + inflationRate)^(n-1)`.
   - Kalkulasi Benefit tahunan = `Base Benefit * (1 + inflationRate)^(n-1)`.
   - Modifikasi pajak: Jika gross benefit lebih besar dari gross opex, persentasase taxRate dipotong langsung.
3. Setelah *flow array* rampung (misalnya [100jt, 120jt, 150jt]), matriks array tersebut dilempar secara independen ke `calculationService.js`.

#### C. `calculationService.js` (Engine Kalkulasi Terpisah)
Engine *matematika investasi murni* yang tidak membaca *database*, ia hanya menerima nilai lalu menghitung matriks ini kembali:
- **ROI**: (`((Total Benefit - Total Cost) / Total Cost) * 100`)
- **NPV**: Model perhitungan uang di masa depan dengan *discount rate*.
- **Payback Period**: Kalkulasi berbasis pecahan kapan proyek balik modal.
- **Break-Even Analysis (BEP)**: Detail metrik untung-rugi di setiap iterasi tahun.

#### D. *Simulation History Capping* (Manajemen Database yang Aman)
Setelah nilai keluar, proyek dikategorikan `CALCULATED`. 
1. `llmBaseDraft` asli milik AI akan langsung ditimpa (*overwrite*) dengan modifikasi item sang pengguna.
2. Pengaturan Parameter simulasi yang di-*pass* (misal Inflasi 20%) bersamaan dengan metrik ROI/NPV akan direkam diam-diam ke dalam `simulationHistory` di DB MongoDB.
3. **Mekanisme Perlindungan Limit**: Ada kode pengecekan *error* yang ketat (Batas 10x max Edit). Jika panjang array history sudah menyentuh 10. `updateDraftProject` akan melempar *HTTP 400 Bad Request error payload:*
   `"Maximum simulation limit (10 edits) has been reached. You can no longer edit this project."`
   Ini dibuat untuk mengamankan data-data ukuran raksasa membebani Node dan Server database.

### 3. Fungsionalitas Operasional Proyek Standar (`GET / DELETE`)
- **`getProjects`**: Menghasilkan daftar (List) semua proyek secara *lightweight*, hanya membaca hal-hal dasar dan *status*-nya (diformat secara elegan sesuai jam, tgl, tahun).
- **`getProjectDraft`**: Digunakan Client untuk nge- *fetch* ID referensi, melihat data penuh beserta kalkulasi komputasi simulasi terkininya.
- **`deleteProject`**: Prosedur validasi keras karena proyek yang sudah sukses masuk simulasi tidak boleh dihapus begitu saja. Hanya proyek yang terputus (statusnya `ERROR`, kemungkinan karena AI Gemini putus saat di *background*) yang memiliki kelayakan untuk dihapus (dibersihkan) melalui API.
