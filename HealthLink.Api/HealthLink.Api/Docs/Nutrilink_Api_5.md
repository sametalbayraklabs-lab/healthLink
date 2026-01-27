13. Admin Dashboard & Raporlama API
Bu bölüm:
* Admin panelindeki ana dashboard kutucuklar? (KPI’lar)
* Zaman serisi grafikleri (ciro, yeni kullan?c?, seans say?s? vb.)
* Top listeler (en çok seans yapan uzmanlar, en çok okunan içerikler)
* Detayl? rapor gridleri için temel endpoint’ler
için kullan?lacak API’leri kapsar.
?lgili tablolar (TDD):
* User, Client, Expert
* Appointment
* Payment, ClientPackage
* Review
* Complaint
* ContentItem
* SystemSetting
* AuditLog (kritik aksiyon log’u)

13.1 Admin Dashboard Overview
13.1.1 GET /admin/dashboard/overview
Amaç:
Admin’in giri?te gördü?ü üst seviye özet kutucuklar? tek seferde döner.
Auth:
Admin
Response (200 OK – örnek):
{
  "date": "2025-02-12",
  "kpis": {
    "totalClients": 1234,
    "totalExperts": 87,
    "activeExperts": 72,
    "totalAppointments": 4520,
    "appointmentsToday": 34,
    "appointmentsNext7Days": 210,
    "totalRevenueAllTime": 1250000.00,
    "totalRevenueThisMonth": 145000.00,
    "openComplaints": 5,
    "pendingReviews": 12,
    "pendingExpertApplications": 4
  }
}
Notlar:
* totalRevenue* ? Payment tablosu üzerinden, Status = Success.
* appointments* ? Appointment tablosu üzerinden.
* openComplaints ? Complaint.Status IN ('Open', 'InReview').
* pendingReviews ? Review.Status = 'PendingApproval'.
* pendingExpertApplications ? Expert.Status = 'Pending'.

13.2 Zaman Serisi – Ciro / Ödeme Grafikleri
13.2.1 GET /admin/dashboard/timeseries/revenue
Amaç:
Admin dashboard’da gösterilecek ciro grafi?i için günlük/haftal?k/ayl?k gelir zaman serisi döner.
Auth:
Admin
Query parametreleri:
* from=2025-02-01
* to=2025-02-28
* groupBy=day (day / week / month)
Response:
{
  "currency": "TRY",
  "groupBy": "day",
  "points": [
    {
      "periodStart": "2025-02-01",
      "periodEnd": "2025-02-01",
      "totalRevenue": 5400.00,
      "successfulPayments": 18,
      "failedPayments": 2
    },
    {
      "periodStart": "2025-02-02",
      "periodEnd": "2025-02-02",
      "totalRevenue": 7200.00,
      "successfulPayments": 23,
      "failedPayments": 1
    }
  ]
}
Kurallar:
* Payment.Status = 'Success' olanlar ciroya al?n?r.
* failedPayments say?s? için Status = 'Failed' say?labilir.
* groupBy’a göre tarih aral??? normalize edilir (hafta/ay ba?? gibi).

13.3 Zaman Serisi – Yeni Kullan?c? / Aktivite Grafikleri
13.3.1 GET /admin/dashboard/timeseries/new-users
Amaç:
Yeni Client ve Expert kay?tlar?n? gösteren grafik.
Auth:
Admin
Query parametreleri:
* from=2025-02-01
* to=2025-02-28
* groupBy=day
Response:
{
  "groupBy": "day",
  "points": [
    {
      "periodStart": "2025-02-01",
      "periodEnd": "2025-02-01",
      "newClients": 12,
      "newExperts": 1
    },
    {
      "periodStart": "2025-02-02",
      "periodEnd": "2025-02-02",
      "newClients": 9,
      "newExperts": 0
    }
  ]
}

13.3.2 GET /admin/dashboard/timeseries/appointments
Amaç:
Sistemde gerçekle?en seans adetlerini gösteren grafik (trafik yo?unlu?u).
Auth:
Admin
Query parametreleri:
* from, to
* groupBy=day
Response:
{
  "groupBy": "day",
  "points": [
    {
      "periodStart": "2025-02-01",
      "periodEnd": "2025-02-01",
      "scheduled": 25,
      "completed": 20,
      "cancelledByClient": 3,
      "cancelledByExpert": 2,
      "noShow": 1
    }
  ]
}

13.4 Top Listeler – Expert & ?çerik
13.4.1 GET /admin/dashboard/top-experts
Amaç:
En çok seans yapan veya en yüksek puanl? uzmanlar? göstermek.
Auth:
Admin
Query parametreleri:
* metric=sessions / rating
* from, to (opsiyonel, sessions için)
* limit=10 (varsay?lan 10)
Response:
{
  "metric": "sessions",
  "items": [
    {
      "expertId": 70,
      "displayName": "Dyt. Ay?e Kaya",
      "expertType": "Dietitian",
      "totalAppointments": 120,
      "averageRating": 4.9,
      "totalReviewCount": 80
    },
    {
      "expertId": 81,
      "displayName": "Psik. Deniz Y?lmaz",
      "expertType": "Psychologist",
      "totalAppointments": 95,
      "averageRating": 4.7,
      "totalReviewCount": 40
    }
  ]
}
Kurallar:
* metric = sessions ise:
o Appointment.Status = 'Completed' say?l?r.
* metric = rating ise:
o Expert.AverageRating ve TotalReviewCount üzerinden s?ralama.

13.4.2 GET /admin/dashboard/top-content
Amaç:
En çok okunan veya en son yay?nlanan içerikleri (blog / tarif) göstermek.
Not: View say?s?n? tutmak için ileride ContentView gibi bir tablo eklenebilir. ?imdilik sadece “en son yay?nlananlar” da yeter.
Auth:
Admin
Query parametreleri:
* type=Blog / Recipe / Announcement
* limit=5
Response:
{
  "items": [
    {
      "id": 101,
      "title": "?nsülin Direnci Nedir?",
      "type": "Blog",
      "category": "Metabolizma",
      "publishedAt": "2025-02-10T10:00:00Z",
      "authorDisplayName": "Dyt. Ay?e Kaya",
      "status": "Published"
    }
  ]
}

13.5 Admin Raporlama Grid API’leri (Detay Tablolar)
Bu endpoint’ler, admin panelindeki detay listeler / filtreli raporlar için kullan?lacak.
Bir k?sm? ba?ka bölümlerde tan?mlad???m?z listelerin “rapor” versiyonu gibi çal???r.
13.5.1 GET /admin/reports/appointments
Amaç:
Seans bazl? detay rapor (Excel export, filtreli grid).
Auth:
Admin
Query parametreleri:
* from, to
* status=Scheduled,Completed,CancelledByClient,CancelledByExpert,NoShow
* expertId, clientId
* expertType=Dietitian, Psychologist, ...
* page=1&pageSize=50
Response:
{
  "items": [
    {
      "appointmentId": 101,
      "startDateTime": "2025-02-10T14:00:00Z",
      "endDateTime": "2025-02-10T14:30:00Z",
      "status": "Completed",
      "clientId": 45,
      "clientNameMasked": "A*** Y******",
      "expertId": 70,
      "expertDisplayName": "Dyt. Ay?e Kaya",
      "serviceType": "NutritionSession",
      "clientPackageId": 33,
      "servicePackageName": "4'lü Paket"
    }
  ],
  "page": 1,
  "pageSize": 50,
  "totalCount": 320
}

13.5.2 GET /admin/reports/payments
Amaç:
Ödeme bazl? rapor ekran? (ciro, iade, gateway durumu).
Auth:
Admin
Query parametreleri:
* from, to
* status=Pending,Success,Failed
* clientId
* page, pageSize
Response:
{
  "items": [
    {
      "paymentId": 501,
      "createdAt": "2025-02-10T10:00:00Z",
      "status": "Success",
      "amount": 499.00,
      "currency": "TRY",
      "clientId": 45,
      "clientEmail": "a***@gmail.com",
      "clientPackageId": 33,
      "servicePackageName": "4'lü Paket",
      "gateway": "iyzico",
      "gatewayPaymentId": "iyz-12345"
    }
  ],
  "page": 1,
  "pageSize": 50,
  "totalCount": 150
}

13.5.3 GET /admin/reports/users
Amaç:
Kullan?c? (Client & Expert) bazl? rapor.
Auth:
Admin
Query parametreleri:
* role=Client,Expert (opsiyonel)
* isActive=true/false
* createdFrom, createdTo
* expertType=Dietitian,... (Expert için)
* page, pageSize
Response:
{
  "items": [
    {
      "userId": 123,
      "email": "a***@gmail.com",
      "role": "Client",
      "createdAt": "2025-01-10T09:00:00Z",
      "isActive": true,
      "client": {
        "clientId": 45,
        "fullName": "Ahmet Y?lmaz",
        "totalAppointments": 5
      },
      "expert": null
    },
    {
      "userId": 200,
      "email": "dyt.ayse@...com",
      "role": "Expert",
      "createdAt": "2025-01-05T11:00:00Z",
      "isActive": true,
      "client": null,
      "expert": {
        "expertId": 70,
        "displayName": "Dyt. Ay?e Kaya",
        "expertType": "Dietitian",
        "status": "Approved",
        "totalAppointments": 120,
        "averageRating": 4.9
      }
    }
  ],
  "page": 1,
  "pageSize": 50,
  "totalCount": 100
}

13.5.4 GET /admin/reports/reviews
Review API’de zaten admin list endpoint’i tan?mlad?k (9.4).
Bunu rapor ekran? için kullanabiliriz; istersen alias olarak /admin/reports/reviews da aç?labilir.
Filtreler:
* status, expertId, clientId, from, to
Response: Review list (zaten var).

13.5.5 GET /admin/reports/complaints
Complaint / Destek API’de admin list endpoint’i (12.3.1) tan?mland?.
Bu endpoint de rapor ekran? + export için kullan?labilir.

13.6 Sistem Sa?l??? / Operasyonel Göstergeler (Opsiyonel)
Bu k?s?m MVP’de ?art de?il, ama ileride istersen:
13.6.1 GET /admin/dashboard/system-health
Amaç:
Admin’e sistemin genel durumunu gösteren küçük bir panel:
* Son 24 saatte hata say?s? (örn. application log’lardan)
* Ba?ar?s?z ödeme oran?
* Mesajla?ma rate limit hit say?s?
* Kritik SystemSetting de?i?iklikleri son 24 saat
Auth:
Admin
Response (örnek):
{
  "last24h": {
    "totalRequests": 15200,
    "errorCount": 23,
    "failedPayments": 4,
    "complaintsOpened": 3,
    "systemSettingsChanged": 1
  }
}
Bunlar?n bir k?sm? için ileride ayr? log/metric sistemi (AppInsights, ELK vs.) ba?lanabilir; API sadece özet döner.

13.7 Non-Fonksiyonel Notlar
* Dashboard endpoint’leri cache edilebilir (örn. 30–60 saniye).
* Zaman serisi ça?r?lar? için:
o ?yi index tasar?m? (tarih alanlar? üzerinde) kritik.
* Rapor endpoint’leri:
o Grid + “Export to Excel/CSV” için kullan?labilir.
o Çok büyük veri için sayfalama zorunlu, export’ta background job (ileride).
14. Auth & Security API
Bu bölüm:
* Giri? / kay?t (client)
* Token üretimi (JWT access + refresh)
* Logout / refresh token yenileme
* ?ifre de?i?tirme / ?ifremi unuttum
* E-posta do?rulama (Faz-2’ye uygun)
* Rol & yetki (Client / Expert / Admin)
ak??lar?n? kapsar.
?lgili tablolar (TDD):
* User
* Client
* Expert
* (?leride) RefreshToken gibi bir tablo eklenebilir (kal?c? refresh token yönetimi için)
JWT taraf?nda her token’da en az:
* sub ? User.Id
* email ? User.Email
* roles ? ["Client"], ["Expert"], ["Admin"] vb.
* exp ? son kullanma zaman?
bulunur.

14.1 Client Kay?t (Sign Up)
POST /auth/register/client
Amaç:
Yeni bir dan??an?n (Client) sisteme kay?t olmas?.
Auth:
Public (üye olmayan)
Request:
{
  "email": "ahmet@example.com",
  "password": "P@ssw0rd!",
  "firstName": "Ahmet",
  "lastName": "Y?lmaz",
  "phone": "+905555555555",
  "birthYear": 1992,
  "gender": "Male"
}
Response (201 Created):
{
  "userId": 123,
  "clientId": 45,
  "accessToken": "jwt-access-token-here",
  "refreshToken": "refresh-token-here",
  "roles": ["Client"]
}
Kurallar:
* Email benzersiz olmal?:
o Varsa ? 409 EMAIL_ALREADY_EXISTS
* password minimum policy:
o En az 8 karakter, say? + harf + özel karakter (backend do?rular).
* ?? ak???:
1. User kayd? olu?turulur (PasswordHash + PasswordSalt).
2. Client kayd? olu?turulur (UserId ile ba?l?).
3. JWT access token + refresh token üretilir.
* ?leride e-posta do?rulama eklenirse:
o EmailVerified = false gibi bir alan eklenir,
o ?lk login’de baz? aksiyonlar k?s?tlanabilir.

14.2 Login (Giri?)
POST /auth/login
Amaç:
Kullan?c?n?n (Client / Expert / Admin) e-posta + ?ifre ile giri? yapmas?.
Auth:
Public
Request:
{
  "email": "ahmet@example.com",
  "password": "P@ssw0rd!"
}
Response (200 OK – örnek):
{
  "userId": 123,
  "email": "ahmet@example.com",
  "roles": ["Client"],
  "hasClient": true,
  "hasExpert": false,
  "accessToken": "jwt-access-token-here",
  "refreshToken": "refresh-token-here"
}
Hata Örnekleri:
* Yanl?? ?ifre ? 401 INVALID_CREDENTIALS
* Kullan?c? pasif ? 403 USER_INACTIVE
Kurallar:
* User.IsActive = 1 olmal?.
* ?ifre do?rulama:
o PasswordHash + PasswordSalt ile backend taraf?nda yap?l?r.
* Ba?ar?l? login’de:
o Access token (k?sa süreli, örn. 15–30 dk)
o Refresh token (daha uzun süreli, örn. 7–30 gün)
o döner.
* ?leride:
o Ba?ar?s?z deneme say?s? takip edilip geçici hesap kilitleme eklenebilir.

14.3 Access Token Yenileme (Refresh)
POST /auth/refresh
Amaç:
Süresi dolmak üzere / dolmu? access token’?, geçerli refresh token ile yenilemek.
Auth:
Public (body’de refresh token gönderilir)
Request:
{
  "refreshToken": "refresh-token-here"
}
Response (200 OK):
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
Kurallar:
* Refresh token:
o Ya DB’de (RefreshToken tablosu) tutulur,
o Ya memory/cache tabanl? bir çözüm kullan?l?r.
* Güvenli yakla??m:
o Her yenilemede eski refresh token iptal, yeni refresh token üret.
* Geçersiz / süresi dolmu? token ? 401 INVALID_REFRESH_TOKEN

14.4 Logout
POST /auth/logout
Amaç:
Kullan?c?n?n ç?k?? yapmas?; aktif refresh token’?n geçersiz k?l?nmas?.
Auth:
Authenticated (Client/Expert/Admin)
Request:
{
  "refreshToken": "refresh-token-here"
}
Response:
{
  "success": true
}
Kurallar:
* Backend taraf?nda:
o ?lgili refresh token DB’de varsa Revoked i?aretlenir veya silinir.
o Ayn? token ile tekrar refresh denemesi ? 401 INVALID_REFRESH_TOKEN.

14.5 Me (Oturum Açm?? Kullan?c? Bilgisi)
GET /auth/me
Amaç:
JWT üzerinden oturum açm?? kullan?c?n?n temel bilgilerini döner.
Frontend için “ben kimim, hangi rollerim var?” sorusunun cevab?.
Auth:
Authenticated
Response (örnek – Client):
{
  "userId": 123,
  "email": "ahmet@example.com",
  "roles": ["Client"],
  "client": {
    "clientId": 45,
    "firstName": "Ahmet",
    "lastName": "Y?lmaz"
  },
  "expert": null
}
Response (örnek – Expert):
{
  "userId": 200,
  "email": "dyt.ayse@example.com",
  "roles": ["Expert"],
  "client": null,
  "expert": {
    "expertId": 70,
    "displayName": "Dyt. Ay?e Kaya",
    "expertType": "Dietitian",
    "status": "Approved"
  }
}
Kurallar:
* roles bilgisi JWT’den de okunabilir, ama backend tekrar do?rular.
* Admin paneli için roles içinde "Admin" aran?r.

14.6 ?ifre De?i?tirme (Logged-in)
POST /auth/change-password
Amaç:
Login olmu? kullan?c?n?n kendi ?ifresini de?i?tirmesi.
Auth:
Authenticated
Request:
{
  "currentPassword": "OldP@ssw0rd!",
  "newPassword": "NewP@ssw0rd2025!"
}
Response:
{
  "success": true
}
Kurallar:
* currentPassword do?ru olmal?, aksi takdirde ? 400 INVALID_CURRENT_PASSWORD
* newPassword policy’e uygun olmal? (en az 8 karakter, karma??k).
* Ba?ar?l? de?i?im sonras?:
o ?stersen tüm aktif refresh token’lar? revoke edip tekrar login isteyebilirsin (daha güvenli).

14.7 ?ifremi Unuttum – Talep
POST /auth/password-reset/request
Amaç:
?ifresini unutan kullan?c?ya e-posta ile reset linki göndermek.
Auth:
Public
Request:
{
  "email": "ahmet@example.com"
}
Response (her durumda):
{
  "success": true
}
Kurallar:
* Güvenlik sebebiyle:
o E-posta sistemde var/yok bilgisini ASLA aç?k etmeyiz.
* Backend:
o E?er email kay?tl? ise:
* Tek kullan?ml?k token üretir (örn. GUID + süreli).
* PasswordResetToken benzeri bir kay?t tutulur.
* Kullan?c?ya e-posta ile “?ifrenizi s?f?rlamak için t?klay?n” linki gönderilir.

14.8 ?ifremi Unuttum – Onay
POST /auth/password-reset/confirm
Amaç:
E-posta ile gelen link üzerinden yeni ?ifre belirlemek.
Auth:
Public (token ile)
Request:
{
  "token": "reset-token-from-email",
  "newPassword": "NewP@ssw0rd2025!"
}
Response:
{
  "success": true
}
Kurallar:
* Token:
o Geçerli, süresi dolmam?? ve daha önce kullan?lmam?? olmal?.
* ?ifre policy’e uygun olmal?.
* Token kullan?ld?ktan sonra:
o Tekrar kullan?lamaz (invalidate).
* ?stersen:
o ?ifre reset sonras? tüm refresh token’lar revoke edilebilir.

14.9 E-posta Do?rulama (Faz-2, Opsiyonel)
MVP’de mecburi de?il ama yap?y? haz?r tutmak için.
POST /auth/email/verify/request
Amaç:
Kullan?c?n?n e-posta do?rulama linkini yeniden istemesi.
Auth:
Authenticated (veya sadece email ile de ça?r?labilir)
Response:
{
  "success": true
}
Kurallar:
* User.EmailVerified (veya benzeri alan) false ise:
o Yeni bir verification token üretilir, e-posta gönderilir.
* Zaten do?rulanm??sa sessizce success dönebilir.

POST /auth/email/verify
Amaç:
E-posta ile gelen token’? do?rulay?p hesab? aktif hale getirmek.
Auth:
Public
Request:
{
  "token": "email-verification-token"
}
Response:
{
  "success": true
}
Kurallar:
* Token geçerliyse:
o User.EmailVerified = true
o Token invalid hale gelir.
* Token geçersiz ? 400 INVALID_TOKEN veya 410 TOKEN_EXPIRED.

14.10 Rol & Yetki Notlar?
* Rollerin kayna??:
o Basit yakla??m: User tablosunda IsAdmin flag + Client / Expert varl???na göre:
* roles = ["Client"]
* roles = ["Expert"]
* roles = ["Client","Expert"]
* roles = ["Admin"]
* API güvenli?i:
o Client endpoint’leri ? role: Client
o Expert panel endpoint’leri ? role: Expert
o Admin endpoint’leri ? role: Admin
* ?leride istersen:
o Ayr? Role ve UserRole tablolar? ekleyip daha granular yetkilendirme yapabilirsin.

14.11 Non-Fonksiyonel / Güvenlik Notlar?
* JWT access token k?sa süreli olmal? (örn. 15–30 dk).
* Refresh token:
o Uzun süreli, DB’de tutulur, çal?nma durumunda revoke edilebilir.
* Tüm kritik Auth endpoint’leri:
o Rate limit alt?nda olmal? (login, reset request vs.).
* ?ifreler:
o Sadece strong hash algoritmalar? ile saklanmal? (ör. bcrypt / Argon2 / PBKDF2).
* Tüm Auth & Security aksiyonlar? (admin taraf? + kritik user aksiyonlar?):
o AuditLog tablosuna yaz?labilir:
* Örn. ActionType = "LoginFailed", "ChangePassword", "ResetPassword"…
