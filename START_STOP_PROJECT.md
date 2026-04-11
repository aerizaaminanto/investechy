# Menjalankan dan Mematikan Project di Windows PowerShell

Dokumen ini menjelaskan cara:

- mengecek port yang sedang dipakai
- mematikan project lain yang bentrok
- menyalakan `Backend` dan `Frontend` project `Investechy`
- memastikan project yang aktif memang project ini

Environment yang dipakai:

- OS: Windows
- Shell: PowerShell
- Backend port: `3000`
- Frontend port: `5173`
- Root project: `D:\KADA\Capstone\Investechy`

## 1. Buka folder project

Buka PowerShell lalu masuk ke folder project:

```powershell
cd D:\KADA\Capstone\Investechy
```

## 2. Cek port yang sedang dipakai

Untuk cek apakah ada proses lain yang memakai port backend atau frontend:

```powershell
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in @(3000, 5173) } |
  Select-Object LocalAddress, LocalPort, OwningProcess
```

Kalau hasilnya kosong, berarti port `3000` dan `5173` sedang bebas.

Kalau ada hasil, artinya ada proses yang sedang memakai port tersebut.

## 3. Lihat proses yang memakai port

Kalau kamu mau tahu proses itu project mana, jalankan:

```powershell
$ports = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in @(3000, 5173) } |
  Select-Object -ExpandProperty OwningProcess -Unique

Get-Process -Id $ports -ErrorAction SilentlyContinue |
  Select-Object Id, ProcessName, Path, StartTime
```

Ini akan membantu kamu melihat apakah proses itu `node`, `npm`, atau aplikasi lain.

## 4. Matikan proses yang memakai port

Kalau kamu yakin port tersebut dipakai project lain dan ingin dimatikan:

```powershell
$conn = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in @(3000, 5173) } |
  Select-Object -ExpandProperty OwningProcess -Unique

Stop-Process -Id $conn -Force
```

Kalau hanya ingin mematikan satu port tertentu:

Matikan proses di port `3000`:

```powershell
$pid3000 = (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -First 1 -ExpandProperty OwningProcess)

Stop-Process -Id $pid3000 -Force
```

Matikan proses di port `5173`:

```powershell
$pid5173 = (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -First 1 -ExpandProperty OwningProcess)

Stop-Process -Id $pid5173 -Force
```

## 5. Nyalakan backend project ini

Masuk ke folder backend:

```powershell
cd D:\KADA\Capstone\Investechy\Backend
```

Jalankan backend:

```powershell
npm run dev
```

Kalau backend berhasil jalan, biasanya akan muncul log seperti:

```text
Server running on http://localhost:3000
Connected to MongoDB
```

Biarkan terminal ini tetap terbuka.

## 6. Nyalakan frontend project ini

Buka PowerShell baru, lalu masuk ke folder frontend:

```powershell
cd D:\KADA\Capstone\Investechy\Frontend
```

Jalankan frontend:

```powershell
npm run dev -- --host 0.0.0.0 --port 5173
```

Kalau frontend berhasil jalan, biasanya akan muncul:

```text
Local: http://localhost:5173/
```

Biarkan terminal ini tetap terbuka.

## 7. Cara memastikan project yang aktif adalah project ini

Cek lagi port:

```powershell
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in @(3000, 5173) } |
  Select-Object LocalAddress, LocalPort, OwningProcess
```

Lalu cek detail prosesnya:

```powershell
$ports = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in @(3000, 5173) } |
  Select-Object -ExpandProperty OwningProcess -Unique

Get-Process -Id $ports -ErrorAction SilentlyContinue |
  Select-Object Id, ProcessName, Path
```

Kalau path proses mengarah ke `node.exe` dan kamu memang baru menjalankan `npm run dev` dari folder project ini, berarti yang aktif adalah project ini.

## 8. Cara mematikan project ini dengan aman

Kalau backend dan frontend dijalankan di dua terminal terpisah, cara paling aman:

- fokus ke terminal backend, lalu tekan `Ctrl + C`
- fokus ke terminal frontend, lalu tekan `Ctrl + C`

Kalau terminalnya sudah tertutup tapi proses masih jalan, pakai cara kill by port:

```powershell
$pids = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in @(3000, 5173) } |
  Select-Object -ExpandProperty OwningProcess -Unique

Stop-Process -Id $pids -Force
```

## 9. Shortcut cepat yang paling sering dipakai

### Cek port

```powershell
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in @(3000, 5173) } |
  Select-Object LocalPort, OwningProcess
```

### Matikan semua proses di port project

```powershell
$pids = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in @(3000, 5173) } |
  Select-Object -ExpandProperty OwningProcess -Unique

if ($pids) {
  Stop-Process -Id $pids -Force
}
```

### Nyalakan backend

```powershell
cd D:\KADA\Capstone\Investechy\Backend
npm run dev
```

### Nyalakan frontend

```powershell
cd D:\KADA\Capstone\Investechy\Frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

## 10. Troubleshooting singkat

Kalau `port already in use`:

- cek port dengan `Get-NetTCPConnection`
- lihat prosesnya dengan `Get-Process`
- matikan proses itu
- jalankan ulang project ini

Kalau backend hidup tapi upload gagal:

- cek file `.env` di folder `Backend`
- pastikan storage credentials benar
- lihat log backend di terminal backend

Kalau frontend hidup tapi tidak connect API:

- pastikan backend sudah hidup di `http://localhost:3000`
- cek apakah frontend memakai base URL yang benar

## 11. Rekomendasi workflow harian

Urutan yang paling aman:

1. Cek port `3000` dan `5173`
2. Matikan proses lain kalau ada bentrok
3. Jalankan backend
4. Jalankan frontend
5. Test di browser: `http://localhost:5173`
