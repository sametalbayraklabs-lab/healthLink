# HealthLink - Servisleri Başlatma Rehberi

## 🚀 Hızlı Başlangıç

### Yöntem 1: PowerShell ile (2 Terminal)

#### Terminal 1 - Backend (API)
```powershell
cd c:\Workspaces\Healthlink\healthLink\HealthLink.Api\HealthLink.Api
dotnet run
```
Stop-Process -Name "dotnet" -Force

✅ Backend başladığında: `http://localhost:5107`

#### Terminal 2 - Frontend
```powershell
cd c:\Workspaces\Healthlink\healthLink\healthlink-frontend
npm run dev
```
✅ Frontend başladığında: `http://localhost:3000`

---

## 📝 Detaylı Açıklama

### Backend (ASP.NET Core API)

**Konum:** `c:\Workspaces\Healthlink\healthLink\HealthLink.Api\HealthLink.Api`

**Başlatma:**
```powershell
dotnet run
```

**Alternatif (Hot Reload ile):**
```powershell
dotnet watch run
```

**Port:** `http://localhost:5107`

**Swagger UI:** `http://localhost:5107/swagger`

**Durdurma:** `Ctrl + C`

---

### Frontend (Next.js)

**Konum:** `c:\Workspaces\Healthlink\healthLink\healthlink-frontend`

**İlk Kurulum (Sadece bir kez):**
```powershell
npm install
```

**Başlatma:**
```powershell
npm run dev
```

**Port:** `http://localhost:3000`

**Durdurma:** `Ctrl + C`

---

## 🔧 Yöntem 2: VS Code ile

### Backend
1. VS Code'da `HealthLink.Api.sln` dosyasını aç
2. `F5` tuşuna bas veya `Run > Start Debugging`
3. Veya terminal: `dotnet run`

### Frontend
1. VS Code'da `healthlink-frontend` klasörünü aç
2. Terminal'de: `npm run dev`
3. Veya `package.json` içinde "dev" script'ine sağ tıklayıp "Run Script"

---

## 🐛 Sorun Giderme

### Backend Başlamıyor
```powershell
# .NET SDK kontrolü
dotnet --version

# Bağımlılıkları restore et
dotnet restore

# Temiz build
dotnet clean
dotnet build
```

### Frontend Başlamıyor
```powershell
# Node.js kontrolü
node --version
npm --version

# node_modules'ü sil ve yeniden yükle
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Port Zaten Kullanımda
```powershell
# Backend (5107 portunu kullanan process'i bul)
netstat -ano | findstr :5107
taskkill /PID <PID> /F

# Frontend (3000 portunu kullanan process'i bul)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📦 Production Build

### Backend
```powershell
dotnet publish -c Release -o ./publish
```

### Frontend
```powershell
npm run build
npm start
```

---

## 🔐 Önemli Notlar

1. **Backend önce başlamalı** - Frontend API'ye bağlanır
2. **Database çalışıyor olmalı** - PostgreSQL
3. **Environment variables** - `appsettings.json` ve `.env.local` kontrol et
4. **JWT Secret** - Production'da güvenli bir key kullan

---

## 🎯 Hızlı Test

Backend ve Frontend başladıktan sonra:

1. Tarayıcıda: `http://localhost:3000`
2. Login sayfasına git
3. Test kullanıcısı ile giriş yap:
   - Email: `testexpert@healthlink.com`
   - Password: `Test123!`

✅ Başarılı giriş → Expert Dashboard'a yönlendirileceksiniz
