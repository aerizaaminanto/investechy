# Quick Start

Panduan singkat untuk mematikan project lain dan menyalakan `Investechy`.

## 1. Cek apakah port dipakai

```powershell
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in @(3000, 5173) } |
  Select-Object LocalPort, OwningProcess
```

## 2. Matikan proses yang bentrok

```powershell
$pids = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in @(3000, 5173) } |
  Select-Object -ExpandProperty OwningProcess -Unique

if ($pids) {
  Stop-Process -Id $pids -Force
}
```

## 3. Nyalakan backend

```powershell
cd D:\KADA\Capstone\Investechy\Backend
npm run dev
```

Backend jalan di:

```text
http://localhost:3000
```

## 4. Nyalakan frontend

Buka terminal baru:

```powershell
cd D:\KADA\Capstone\Investechy\Frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

Frontend jalan di:

```text
http://localhost:5173
```

## 5. Matikan project ini

Kalau terminal masih terbuka:

- tekan `Ctrl + C` di terminal backend
- tekan `Ctrl + C` di terminal frontend

Kalau proses masih nyangkut:

```powershell
$pids = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in @(3000, 5173) } |
  Select-Object -ExpandProperty OwningProcess -Unique

if ($pids) {
  Stop-Process -Id $pids -Force
}
```
