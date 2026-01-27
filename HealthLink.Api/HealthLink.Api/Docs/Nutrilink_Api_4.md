10. Expert Panel API (Uzman Paneli)
Bu bölüm, uzman?n kendi panelinde yapt??? tüm i?lemleri kapsar:
* Dashboard (özet)
* Profil yönetimi
* Randevu listesi
* Seans raporu yazma
* Kazanç/ödemeler ekran?
* Takvim yönetimi (referans: Randevu & Takvim API 6.x)
?lgili tablolar (TDD):
* Expert
* Appointment
* AppointmentReport
* Client
* ClientPackage
* Payment
* ExpertScheduleTemplate
* ExpertScheduleException

10.1 GET /experts/me/dashboard
Amaç:
Uzman?n panel aç?l???nda görece?i özet dashboard verilerini tek endpoint ile döner.
Auth: Expert
Response (200 OK – örnek):
{
  "expertId": 70,
  "displayName": "Dyt. Ay?e Kaya",
  "expertType": "Dietitian",
  "stats": {
    "totalClients": 42,
    "totalAppointments": 320,
    "upcomingAppointmentsToday": 3,
    "upcomingAppointmentsNext7Days": 8,
    "averageRating": 4.8,
    "totalReviewCount": 120
  },
  "nextAppointments": [
    {
      "appointmentId": 101,
      "startDateTime": "2025-02-12T10:00:00Z",
      "endDateTime": "2025-02-12T10:30:00Z",
      "clientName": "Ahmet Y.",
      "status": "Scheduled"
    }
  ],
  "recentReviews": [
    {
      "reviewId": 501,
      "rating": 5,
      "comment": "Çok ilgiliydi.",
      "createdAt": "2025-02-10T18:00:00Z"
    }
  ],
  "earningsSummary": {
    "currentMonthGross": 12000.00,
    "currency": "TRY",
    "totalPayoutsThisMonth": 9000.00,
    "lastPayoutDate": "2025-02-05T09:00:00Z"
  }
}
Not:
Buradaki alt bloklar?n hepsi ayr? endpoint’lerle de al?nabilir ama dashboard için tek shot performansl? olur.

10.2 Profil Yönetimi
10.2.1 GET /experts/me/profile
Amaç:
Uzman?n kendi profil bilgilerini (edit formu için) döner.
Auth: Expert
Response:
{
  "expertId": 70,
  "displayName": "Dyt. Ay?e Kaya",
  "expertType": "Dietitian",
  "bio": "Uzun bio metni...",
  "city": "?stanbul",
  "workType": "Online",
  "experienceYear": 7,
  "status": "Approved",
  "specializations": [
    {
      "id": 1,
      "name": "Kilo Verme"
    },
    {
      "id": 2,
      "name": "Sporcu Beslenmesi"
    }
  ],
  "hasIntroVideo": true,
  "introVideoUrl": "https://cdn.nutrilink/.../intro.mp4"
}

10.2.2 PUT /experts/me/profile
Amaç:
Uzman?n profil bilgilerini güncellemesi.
Auth: Expert
Request:
{
  "displayName": "Dyt. Ay?e Kaya",
  "bio": "Merhaba, ben klinik ve sporcu beslenmesi alan?nda çal??an bir uzman?m.",
  "city": "?stanbul",
  "workType": "Online",
  "experienceYear": 7,
  "specializationIds": [1, 2, 3]
}
Response (200 OK):
{
  "success": true
}
Kurallar:
* displayName bo? olamaz.
* workType sadece tan?ml? de?erlerden biri olabilir (Online, Offline, Hybrid).
* specializationIds ? ExpertSpecialization tablosu güncellenir (önce sil, sonra ek yakla??m?).

10.2.3 POST /experts/me/profile/intro-video
Not: Sadece metadata + upload URL yönetimi API’de, gerçek upload storage üzerinden yap?l?r (örn. pre-signed URL).
Amaç:
Uzman?n k?sa tan?t?m videosu yüklemesi.
Auth: Expert
Request:
{
  "fileName": "intro.mp4",
  "fileSize": 40000000
}
Response (200 OK – pre-signed upload URL örne?i):
{
  "uploadUrl": "https://storage.nutrilink.com/upload/xyz...",
  "maxSize": 52428800,
  "acceptedMimeTypes": ["video/mp4"]
}
Upload tamamland?ktan sonra ikinci bir endpoint ile “bu video art?k haz?r” diye i?aretlenebilir:
POST /experts/me/profile/intro-video/confirm
{
  "publicUrl": "https://cdn.nutrilink.com/videos/intro-70.mp4"
}

10.3 Randevu Listeleri (Expert Taraf?)
Randevu & Takvim API’de 6.10.1 ve 6.10.2 ile k?smen tan?mland?. Burada Expert panel kullan?m?na göre netle?tiriyoruz.
10.3.1 GET /experts/me/appointments
Amaç:
Uzman?n kendi seanslar?n? listelemesi (panelde “Seanslar?m” ekran?).
Auth: Expert
Query parametreleri:
* from=2025-02-01T00:00:00Z
* to=2025-02-29T23:59:59Z
* status=Scheduled,Completed,CancelledByClient,CancelledByExpert (opsiyonel)
* clientName=Ahmet (opsiyonel arama)
* page=1&pageSize=20
Response:
{
  "items": [
    {
      "appointmentId": 101,
      "startDateTime": "2025-02-12T10:00:00Z",
      "endDateTime": "2025-02-12T10:30:00Z",
      "status": "Scheduled",
      "clientId": 45,
      "clientName": "Ahmet Y.",
      "hasReport": false,
      "serviceType": "NutritionSession"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 8
}

10.3.2 GET /experts/me/appointments/{appointmentId}
Amaç:
Uzman?n bir seans?n detay?n? görmesi (seans detay? modal?).
Auth: Expert (appointment kendi experti ise)
Response:
{
  "appointmentId": 101,
  "client": {
    "id": 45,
    "displayName": "Ahmet Y."
  },
  "serviceType": "NutritionSession",
  "startDateTime": "2025-02-12T10:00:00Z",
  "endDateTime": "2025-02-12T10:30:00Z",
  "status": "Scheduled",
  "zoomLink": "https://zoom.us/j/xxx",
  "clientPackage": {
    "clientPackageId": 33,
    "packageName": "4'lü Paket"
  },
  "hasReport": true
}
Zoom link gösterimi için ayn? kurallar geçerli: sadece taraf ve seansa yak?n süre.

10.4 Seans Raporu (AppointmentReport)
10.4.1 GET /experts/me/appointments/{appointmentId}/report
Amaç:
Uzman?n daha önce yazd??? raporu görüntülemesi (varsa).
Auth: Expert (appointment kendi experti ise)
Response (varsa):
{
  "appointmentId": 101,
  "reportText": "Seans özeti, öneriler, takip notlar?...",
  "createdAt": "2025-02-12T11:00:00Z",
  "updatedAt": "2025-02-12T11:30:00Z"
}
Response (yoksa – 404):
404 NOT_FOUND veya body’de hasReport = false dönebilir; tasar?ma göre.

10.4.2 POST /experts/me/appointments/{appointmentId}/report
Amaç:
Uzman?n seans sonras? ilk raporu olu?turmas?.
Auth: Expert
Request:
{
  "reportText": "Dan??an?n ilk seans?. Hedef: 3 ayda 6 kg ya? kayb?..."
}
Response (201 Created):
{
  "appointmentId": 101,
  "expertId": 70,
  "createdAt": "2025-02-12T11:00:00Z"
}
Kurallar:
* Appointment:
o Bu experte ait olmal?,
o En az?ndan Scheduled olmal? (genelde Completed sonras? yaz?l?r, ama MVP’de serbest b?rak?labilir).
* reportText bo? olamaz.
* Tek Appointment ? tek rapor kayd? (varsa POST yerine PUT kullanmak da mümkün).

10.4.3 PUT /experts/me/appointments/{appointmentId}/report
Amaç:
Mevcut raporu güncellemek.
Auth: Expert
Request:
{
  "reportText": "Seans sonras? revize edilmi? rapor..."
}
Response (200 OK):
{
  "appointmentId": 101,
  "updatedAt": "2025-02-12T11:30:00Z"
}

10.5 Uzman?n Client Görünümü (Basit “Dan??anlar?m” Ekran?)
Bu tamamen uzman paneli taraf?nda, “Dan??anlar?m” gibi bir ekran gösterir.
10.5.1 GET /experts/me/clients
Amaç:
Uzman?n ?imdiye kadar seans yapt??? tüm client’lar?n özet listesi.
Auth: Expert
Query parametreleri:
* search=Ahmet (opsiyonel)
* page=1&pageSize=20
Response:
{
  "items": [
    {
      "clientId": 45,
      "displayName": "Ahmet Y.",
      "totalAppointments": 5,
      "lastAppointmentAt": "2025-02-10T14:00:00Z",
      "lastStatus": "Completed"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 10
}

10.5.2 GET /experts/me/clients/{clientId}
Amaç:
Uzman?n belirli bir client için özet bilgi görmesi:
* Son seanslar
* Son raporlar
* H?zl? linkler
Auth: Expert
Response:
{
  "clientId": 45,
  "displayName": "Ahmet Y.",
  "basicInfo": {
    "firstAppointmentAt": "2025-01-10T14:00:00Z",
    "totalAppointments": 5
  },
  "recentAppointments": [
    {
      "appointmentId": 101,
      "startDateTime": "2025-02-10T14:00:00Z",
      "status": "Completed",
      "hasReport": true
    }
  ]
}
Burada t?bbi veri tutmuyoruz, sadece randevu/rapor meta’s?. Detay zaten AppointmentReport üzerinden.

10.6 Kazanç & Ödeme Raporlar? (Expert)
10.6.1 GET /experts/me/earnings/summary
Amaç:
Uzman?n kazanç özetini göstermesi (panelde “Kazançlar?m” üst kartlar?).
Auth: Expert
Query parametreleri (opsiyonel):
* from=2025-02-01
* to=2025-02-29
Response:
{
  "expertId": 70,
  "currency": "TRY",
  "period": {
    "from": "2025-02-01",
    "to": "2025-02-29"
  },
  "grossAmount": 15000.00,
  "platformCommission": 4500.00,
  "netAmount": 10500.00,
  "payoutAmount": 9000.00,
  "pendingPayoutAmount": 1500.00
}
Komisyon oran? SystemSetting üzerinden hesaplan?r.

10.6.2 GET /experts/me/earnings/appointments
Amaç:
Uzman?n kazançlar?na katk? sa?layan seans bazl? liste.
Auth: Expert
Query parametreleri:
* from, to
* status=Completed
* page, pageSize
Response:
{
  "items": [
    {
      "appointmentId": 101,
      "startDateTime": "2025-02-10T14:00:00Z",
      "status": "Completed",
      "clientName": "Ahmet Y.",
      "servicePackageName": "4'lü Paket",
      "expertShareAmount": 250.00,
      "currency": "TRY"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 30
}

10.6.3 GET /experts/me/payouts
E?er ileride ayr? bir “Payout” tablosu tan?mlarsan, oradan okunur. ?imdilik Payment üzerinden de kurgulanabilir.
Amaç:
Uzman?n kendisine yap?lan ödeme/payout kay?tlar?n? listelemek.
Auth: Expert
Response:
{
  "items": [
    {
      "payoutId": 10,
      "amount": 5000.00,
      "currency": "TRY",
      "payoutDate": "2025-02-05T09:00:00Z",
      "periodFrom": "2025-01-01",
      "periodTo": "2025-01-31",
      "status": "Paid"
    }
  ]
}
Bu k?s?m TDD’de ileride geni?letilebilir (Payout tablosu eklendi?inde tekrar refine ederiz).

10.7 Takvim Yönetimi (Referans)
Takvim ve çal??ma saatleri için Expert taraf? kulland??? endpoint’ler:
* GET /experts/me/schedule/template
* PUT /experts/me/schedule/template
* GET /experts/me/schedule/exceptions
* POST /experts/me/schedule/exceptions
* DELETE /experts/me/schedule/exceptions/{id}
* GET /experts/{expertId}/availability
Bunlar?n detaylar? Randevu & Takvim API bölümünde (6.7, 6.8, 6.9) tan?mland?; Expert panelinde bu endpoint’ler kullan?larak:
* Haftal?k çal??ma saatleri
* Tatil ve özel bloklar
* Uygun saat slotlar?
ekran? yönetiliyor.
11. Content API (Blog, Fit Tarifler, Duyurular)
Bu API:
* Public tarafta blog yaz?lar?, fit tarifler, duyurular?n listelenmesi ve detay?n?
* Expert / Admin taraf?nda içerik olu?turma, düzenleme, yay?nlama ak??lar?n?
kapsar.
TDD’de ilgili tablo: ``
* Type: Blog, Recipe, Announcement
* Status: Draft, PendingApproval, Published, Archived

11.1 Public Content List API
11.1.1 GET /content
Amaç:
Landing, Blog ve Fit Tarifler sayfalar?nda kullan?lacak public içerik listesini döner.
Auth:
Public (giri? zorunlu de?il)
Query parametreleri (opsiyonel):
* type=Blog / Recipe / Announcement
* category=Kilo Verme (opsiyonel)
* search=insülin direnci (ba?l?k / içerik içinde arama)
* page=1&pageSize=10
Response (200 OK):
{
  "items": [
    {
      "id": 101,
      "title": "?nsülin Direnci Nedir?",
      "subTitle": "Belirtiler, nedenler ve beslenme önerileri",
      "slug": "insulin-direnci-nedir",
      "type": "Blog",
      "category": "Metabolizma",
      "coverImageUrl": "https://cdn.nutrilink.com/content/101-cover.jpg",
      "status": "Published",
      "publishedAt": "2025-02-10T10:00:00Z",
      "authorDisplayName": "Dyt. Ay?e Kaya"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 42
}
Kurallar:
* Public endpoint’te yaln?zca Status = Published içerikler listelenir.
* PublishedAt geçmi? bir tarih olmal?d?r (gelecek tarihli schedule varsa ?imdilik filtrelenebilir).

11.1.2 GET /content/featured
Amaç:
Landing page’de “öne ç?kan yaz?lar” / “öne ç?kan tarifler” için küçük bir set döner.
Auth:
Public
Query parametreleri:
* type=Blog veya type=Recipe (opsiyonel)
* limit=3 (varsay?lan 3–6 aras?)
Response:
{
  "items": [
    {
      "id": 201,
      "title": "Kahvalt?da Tok Tutan 3 Öneri",
      "slug": "kahvaltida-tok-tutan-3-oneri",
      "type": "Recipe",
      "category": "Fit Tarif",
      "coverImageUrl": "https://cdn.nutrilink.com/content/201-cover.jpg",
      "publishedAt": "2025-02-08T09:00:00Z"
    }
  ]
}
Kurallar:
* Seçim mant???:
o ?leride IsFeatured alan? ekleyebilirsin; ?imdilik:
* En son yay?nlanan N içerik, veya
* En çok okunanlar (ileride view count eklersen).

11.1.3 GET /content/{slug}
Amaç:
Blog / tarif / duyuru detay?n? döner.
Auth:
Public
Path param:
* slug: insulin-direnci-nedir gibi.
Response (200 OK):
{
  "id": 101,
  "title": "?nsülin Direnci Nedir?",
  "subTitle": "Belirtiler, nedenler ve beslenme önerileri",
  "slug": "insulin-direnci-nedir",
  "type": "Blog",
  "category": "Metabolizma",
  "coverImageUrl": "https://cdn.nutrilink.com/content/101-cover.jpg",
  "bodyHtml": "<p>?nsülin direnci, vücudun...</p>",
  "seoTitle": "?nsülin Direnci Nedir? Belirtileri ve Çözüm Önerileri",
  "seoDescription": "?nsülin direnci hakk?nda temel bilgiler...",
  "publishedAt": "2025-02-10T10:00:00Z",
  "author": {
    "id": 70,
    "displayName": "Dyt. Ay?e Kaya",
    "expertType": "Dietitian"
  }
}
Kurallar:
* Sadece Status = Published olan içerik public olarak döner.
* ?çerik yay?nlanmam??sa:
o Public istek ? 404 NOT_FOUND
o Admin veya author istekleri ? tasar?ma göre detayl? dönebilir.

11.2 Expert Taraf? – ?çerik Yönetimi (MVP: Opsiyonel)
?stersen bunu Faz-2 olarak da dü?ünebilirsin. MVP’de tüm içerikleri sadece Admin yazabilir; ileride Expert’lerin kendi blog yaz?lar?n? yazd??? bir sistem açars?n. Ben API’yi, ileride ihtiyac?n olursa diye çok net b?rak?yorum.
11.2.1 GET /experts/me/content
Amaç:
Uzman?n kendi olu?turdu?u içerikleri listelemesi (blog yaz?lar?, tarifler).
Auth:
Expert
Query parametreleri:
* type=Blog / Recipe
* status=Draft,PendingApproval,Published,Archived
* page=1&pageSize=10
Response:
{
  "items": [
    {
      "id": 301,
      "title": "Sporcu Beslenmesinde 5 Temel Kural",
      "slug": "sporcu-beslenmesinde-5-temel-kural",
      "type": "Blog",
      "status": "PendingApproval",
      "createdAt": "2025-02-09T12:00:00Z",
      "updatedAt": "2025-02-10T08:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 3
}

11.2.2 POST /experts/me/content
Amaç:
Uzman?n yeni bir içerik tasla?? olu?turmas?.
Auth:
Expert
Request:
{
  "type": "Blog",
  "title": "Sporcu Beslenmesinde 5 Temel Kural",
  "subTitle": "Antreman öncesi ve sonras? beslenme ipuçlar?",
  "category": "Sporcu Beslenmesi",
  "bodyHtml": "<p>?çerik gövdesi buraya gelir...</p>"
}
Response (201 Created):
{
  "id": 301,
  "status": "Draft",
  "slug": "sporcu-beslenmesinde-5-temel-kural"
}
Kurallar:
* type zorunlu (Blog, Recipe veya Announcement ama uzmanlar için genelde sadece Blog/Recipe).
* title zorunlu, max ~200 karakter.
* slug backend’de otomatik üretilir (title’dan).
* Ba?lang?ç durumu: Status = Draft.
* AuthorUserId = currentUserId.

11.2.3 PUT /experts/me/content/{id}
Amaç:
Uzman?n kendi tasla??n? / içeri?ini güncellemesi (Draft veya PendingApproval durumunda).
Auth:
Expert (sadece kendi AuthorUserId’si ise)
Request:
{
  "title": "Sporcu Beslenmesinde 5 Temel Kural (Güncellendi)",
  "subTitle": "Antreman öncesi ve sonras? beslenme ipuçlar?",
  "category": "Sporcu Beslenmesi",
  "bodyHtml": "<p>Güncellenmi? içerik...</p>"
}
Response:
{
  "success": true
}
Kurallar:
* Status = Published olan içerik, uzman taraf?ndan direkt de?i?tirilemez (admin onay? gerekebilir).
* ?stersen: Published içerik için yeni versiyon tasla?? olu?turma yakla??m? da ekleyebilirsin (?imdilik MVP için gerekmez).

11.2.4 POST /experts/me/content/{id}/submit-for-approval
Amaç:
Uzman?n draft içeri?ini admin onay?na göndermesi.
Auth:
Expert
Response:
{
  "id": 301,
  "status": "PendingApproval"
}
Kurallar:
* Sadece Draft durumundan PendingApproval’a geçilir.
* Admin panelinde PendingApproval içerikler listelenir.

11.3 Admin Content Management API
Admin tüm içerikleri görebilir, yay?nlar, ar?ivler, reddeder.
11.3.1 GET /admin/content
Amaç:
Admin’in içerik listesini filtrelemesi.
Auth:
Admin
Query parametreleri:
* type=Blog,Recipe,Announcement
* status=Draft,PendingApproval,Published,Archived
* authorId=70
* search=insülin
* page=1&pageSize=20
Response:
{
  "items": [
    {
      "id": 101,
      "title": "?nsülin Direnci Nedir?",
      "type": "Blog",
      "status": "Published",
      "authorDisplayName": "Dyt. Ay?e Kaya",
      "createdAt": "2025-02-01T10:00:00Z",
      "publishedAt": "2025-02-10T10:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 50
}

11.3.2 GET /admin/content/{id}
Amaç:
Tek bir içeri?in admin detay ekran?nda gösterilmesi.
Auth:
Admin
Response:
{
  "id": 301,
  "title": "Sporcu Beslenmesinde 5 Temel Kural",
  "subTitle": "Antreman öncesi ve sonras? beslenme ipuçlar?",
  "slug": "sporcu-beslenmesinde-5-temel-kural",
  "type": "Blog",
  "category": "Sporcu Beslenmesi",
  "coverImageUrl": "https://cdn.nutrilink.com/content/301-cover.jpg",
  "bodyHtml": "<p>?çerik gövdesi...</p>",
  "seoTitle": "Sporcu beslenmesi rehberi",
  "seoDescription": "Performans art?rmak için do?ru beslenme yöntemleri...",
  "status": "PendingApproval",
  "author": {
    "id": 70,
    "displayName": "Dyt. Ay?e Kaya"
  },
  "createdAt": "2025-02-09T12:00:00Z",
  "updatedAt": "2025-02-10T08:00:00Z",
  "publishedAt": null
}

11.3.3 POST /admin/content
Amaç:
Admin’in do?rudan içerik olu?turmas? (örn. duyuru, genel blog).
Auth:
Admin
Request:
{
  "type": "Announcement",
  "title": "Nutrilink Platformu Aç?ld?!",
  "subTitle": "Türkiye'nin sa?l?k odakl? yeni platformu",
  "category": "Genel",
  "bodyHtml": "<p>Merhaba, Nutrilink yay?nda...</p>",
  "seoTitle": "Nutrilink Aç?ld?",
  "seoDescription": "Nutrilink platformunun aç?l?? duyurusu"
}
Response (201 Created):
{
  "id": 401,
  "status": "Published",
  "slug": "nutrilink-platformu-acildi"
}
Admin için istersen direkt Published da yapabilirsin veya önce Draft ? Publish diye de kurgulayabilirsin.

11.3.4 PUT /admin/content/{id}
Amaç:
Mevcut içeri?i admin taraf?nda güncellemek.
Auth:
Admin
Request:
{
  "title": "?nsülin Direnci Nedir? (Güncellendi)",
  "subTitle": "Yeni bilgilerle güncellendi",
  "category": "Metabolizma",
  "bodyHtml": "<p>Güncellenmi? metin...</p>",
  "seoTitle": "?nsülin Direnci Nedir? 2025 Güncel Rehber",
  "seoDescription": "?nsülin direnci ile ilgili güncel bilgiler..."
}
Response:
{
  "success": true
}

11.3.5 POST /admin/content/{id}/publish
Amaç:
?çeri?i yay?nlamak (Draft veya PendingApproval ? Published).
Auth:
Admin
Request:
{
  "publishDate": "2025-02-15T09:00:00Z"
}
Response:
{
  "id": 301,
  "status": "Published",
  "publishedAt": "2025-02-15T09:00:00Z"
}
Kurallar:
* E?er publishDate bo? gelirse now kullan?labilir.
* Publish i?lemi AuditLog’a yaz?lmal?:
o ActionType = "PublishContent"

11.3.6 POST /admin/content/{id}/archive
Amaç:
Mevcut yay?nlanm?? içeri?i ar?ive almak, art?k public listelerde göstermemek.
Auth:
Admin
Request:
{
  "reason": "?çerik güncelli?ini yitirdi."
}
Response:
{
  "id": 301,
  "status": "Archived"
}
Kurallar:
* Status = Archived olan içerikler public listelerde görünmez.
* Admin panelinde filtrelenebilir.

11.3.7 POST /admin/content/{id}/reject
E?er Expert taraf?ndan gelen PendingApproval içerikleri reddetmek istersen.
Amaç:
Onay bekleyen içeri?i reddetmek.
Auth:
Admin
Request:
{
  "adminNote": "?çerikte t?bbi aç?dan yanl?? bilgi var, lütfen düzeltin."
}
Response:
{
  "id": 301,
  "status": "Rejected"
}
Ek:
* ?stersen Rejected statüsü için ayr?ca Notification tetikleyebilirsin (expert’e bilgi maili).

11.4 Non-Fonksiyonel Notlar
* SEO / SSG:
o Public GET /content ve GET /content/{slug} endpoint’leri
* Next.js taraf?nda SSG/ISR için ideal (blog sayfalar? için).
* Performans:
o Public listing için ça??rsan bile pageSize’? 10–20 civar?nda tut.
* Güvenlik:
o Admin endpoint’leri mutlaka role-based auth ile korunur.
* Versiyonlama (ileride):
o ?çerik versiyonlar? için ayr? bir ContentVersion tablosu eklenebilir (?imdilik ?art de?il).
12. Complaint / Destek API (?ikayet & Destek Kay?tlar?)
Bu bölüm:
* Dan??an?n ?ikayet / destek kayd? açmas?
* ?ikayetlerin listelenmesi ve detay görüntüleme
* Admin’in ?ikayetleri yönetmesi (durum de?i?tirme, not ekleme)
* ?leride uzman taraf?nda “hakk?mdaki ?ikayetleri görme” (opsiyonel)
ak??lar?n? kapsar.
?lgili tablo (TDD):
* Complaint
Alanlar (özet):
* ClientId, ExpertId, AppointmentId (nullable FK’ler)
* Category (Expert, System, Payment)
* Type (Behaviour, NoShow, Technical, Other vb.)
* Title, Description
* Status (Open, InReview, Resolved, Rejected)
* AdminNote
* CreatedAt, UpdatedAt, ClosedAt

12.1 Client Taraf? – ?ikayet / Destek Kayd?
12.1.1 POST /complaints
Amaç:
Dan??an?n platform üzerinden bir ?ikayet veya destek talebi olu?turmas?n? sa?lar.
Auth:
Client
Request:
{
  "category": "Expert",
  "type": "Behaviour",
  "expertId": 70,
  "appointmentId": 101,
  "title": "Seans s?ras?nda uygunsuz konu?ma",
  "description": "Seans s?ras?nda bana kar?? yeterince profesyonel bir dil kullan?lmad???n? dü?ünüyorum."
}
Alan kurallar?:
* category (zorunlu): Expert, System, Payment gibi kodlar.
* type (zorunlu): Behaviour, NoShow, Technical, Other vb.
* title (zorunlu, max ~200)
* description (opsiyonel ama tavsiye edilir)
* expertId:
o category = Expert veya type = Behaviour / NoShow ise zorunlu.
* appointmentId:
o Seansla ilgili ?ikayet ise (NoShow, seans içeri?i v.b.) zorunlu.
Response (201 Created):
{
  "id": 9001,
  "status": "Open",
  "createdAt": "2025-02-11T12:00:00Z"
}
?? kurallar?:
* ClientId = currentClient.
* Status ba?lang?çta ``.
* Admin paneline dü?er (Admin Complaint Management).

12.1.2 GET /complaints/my
Amaç:
Dan??an?n geçmi?te açt??? tüm ?ikayet/destek kay?tlar?n? listeler.
Client taraf?ndaki “Destek / ?ikayetlerim” ekran? için.
Auth:
Client
Query parametreleri (opsiyonel):
* status=Open,InReview,Resolved,Rejected
* page=1&pageSize=20
Response (200 OK):
{
  "items": [
    {
      "id": 9001,
      "category": "Expert",
      "type": "Behaviour",
      "title": "Seans s?ras?nda uygunsuz konu?ma",
      "status": "InReview",
      "createdAt": "2025-02-11T12:00:00Z",
      "updatedAt": "2025-02-12T09:30:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 3
}

12.1.3 GET /complaints/{id}
Amaç:
Dan??an?n kendi açt??? bir ?ikayet/destek kayd?n?n detay?n? görmesi.
Auth:
Client (sadece kendi ClientId’ine ait kay?tlar? görebilir)
Response (200 OK):
{
  "id": 9001,
  "category": "Expert",
  "type": "Behaviour",
  "title": "Seans s?ras?nda uygunsuz konu?ma",
  "description": "Seans s?ras?nda bana kar?? yeterince profesyonel bir dil kullan?lmad???n? dü?ünüyorum.",
  "status": "InReview",
  "clientId": 45,
  "expert": {
    "id": 70,
    "displayName": "Dyt. Ay?e Kaya"
  },
  "appointment": {
    "id": 101,
    "startDateTime": "2025-02-10T14:00:00Z"
  },
  "adminNote": "?ikayetiniz inceleniyor, en k?sa sürede dönü? yap?lacakt?r.",
  "createdAt": "2025-02-11T12:00:00Z",
  "updatedAt": "2025-02-12T09:30:00Z",
  "closedAt": null
}
Kurallar:
* Ba?ka bir mü?terinin ?ikayetini görmeye çal???rsa ? 403 FORBIDDEN.

12.2 Expert Taraf? – Hakk?mdaki ?ikayetler (Opsiyonel Faz-2)
MVP’de zorunlu de?il; ama tasar?m? düzgün dursun diye netle?tiriyorum.
12.2.1 GET /experts/me/complaints
Amaç:
Uzman?n kendisiyle ilgili aç?lm?? ?ikayetleri özet olarak görmesi.
Auth:
Expert
Query parametreleri:
* status=Open,InReview,Resolved,Rejected
* page=1&pageSize=20
Response:
{
  "items": [
    {
      "id": 9001,
      "category": "Expert",
      "type": "Behaviour",
      "title": "Seans s?ras?nda uygunsuz konu?ma",
      "status": "InReview",
      "createdAt": "2025-02-11T12:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 1
}
?stersen uzman detayda description’? göstermeyebilirsin; sadece ba?l?k + admin aç?klamas? ile çok daha “yumu?ak” bir deneyim sunabilirsin.

12.3 Admin – ?ikayet Yönetimi (Complaint Management)
12.3.1 GET /admin/complaints
Amaç:
Admin’in ?ikayet/destek kay?tlar?n? filtreleyerek listelemesi.
Admin panelindeki “?ikayet Yönetimi” grid’i.
Auth:
Admin
Query parametreleri:
* status=Open,InReview,Resolved,Rejected
* category=Expert,System,Payment
* type=Behaviour,NoShow,Technical,Other
* expertId=70 (opsiyonel)
* clientId=45 (opsiyonel)
* from=2025-02-01
* to=2025-02-28
* page=1&pageSize=20
Response (200 OK):
{
  "items": [
    {
      "id": 9001,
      "category": "Expert",
      "type": "Behaviour",
      "title": "Seans s?ras?nda uygunsuz konu?ma",
      "status": "Open",
      "clientId": 45,
      "clientMask": "A*** Y******",
      "expertId": 70,
      "expertDisplayName": "Dyt. Ay?e Kaya",
      "appointmentId": 101,
      "createdAt": "2025-02-11T12:00:00Z",
      "updatedAt": "2025-02-11T12:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 5
}

12.3.2 GET /admin/complaints/{id}
Amaç:
Admin’in tek bir ?ikayet kayd?n?n detay?n? görmesi.
Auth:
Admin
Response (200 OK):
{
  "id": 9001,
  "category": "Expert",
  "type": "Behaviour",
  "title": "Seans s?ras?nda uygunsuz konu?ma",
  "description": "Seans s?ras?nda bana kar?? yeterince profesyonel bir dil kullan?lmad???n? dü?ünüyorum.",
  "status": "InReview",
  "client": {
    "id": 45,
    "maskedName": "A*** Y******"
  },
  "expert": {
    "id": 70,
    "displayName": "Dyt. Ay?e Kaya"
  },
  "appointment": {
    "id": 101,
    "startDateTime": "2025-02-10T14:00:00Z",
    "status": "Completed"
  },
  "adminNote": "?ikayetiniz inceleniyor.",
  "createdAt": "2025-02-11T12:00:00Z",
  "updatedAt": "2025-02-12T09:30:00Z",
  "closedAt": null
}
?stersen burada ilgili konu?ma (Mesajla?ma) için conversationId meta bilgisi de dönebilir; admin gerekirse oraya atlay?p meta bakar.

12.3.3 POST /admin/complaints/{id}/update-status
Amaç:
Admin’in ?ikayet kayd?n?n durumunu de?i?tirmesi (Open ? InReview ? Resolved / Rejected).
Auth:
Admin
Request:
{
  "newStatus": "InReview",
  "adminNote": "Taraflarla ileti?ime geçilecek, görü?me kay?tlar? inceleniyor."
}
Response (200 OK):
{
  "id": 9001,
  "status": "InReview",
  "updatedAt": "2025-02-12T09:30:00Z"
}
Kurallar:
* newStatus sadece ?u de?erlerden biri olabilir:
o Open, InReview, Resolved, Rejected
* Resolved veya Rejected durumuna geçerken:
o ClosedAt = now
* Her de?i?iklik:
o AuditLog tablosuna yaz?lmal?:
* ActionType = "UpdateComplaintStatus"
* TargetType = "Complaint"
* TargetId = complaintId

12.3.4 POST /admin/complaints/{id}/add-note (Opsiyonel)
?stersen status de?i?tirmeden de not ekleyebilmek için ayr? endpoint.
Amaç:
Admin’in ?ikayete aç?klama/not eklemesi.
Auth:
Admin
Request:
{
  "adminNote": "Diyetisyenle görü?üldü, bir sonraki seansta telafi edilecek."
}
Response:
{
  "id": 9001,
  "status": "InReview",
  "adminNote": "Diyetisyenle görü?üldü, bir sonraki seansta telafi edilecek.",
  "updatedAt": "2025-02-12T10:00:00Z"
}

12.4 Non-Fonksiyonel Notlar
* Gizlilik:
o Admin panelinde client adlar? mümkün oldu?unca maskelenmi? gösterilebilir (A*** Y******).
* Audit:
o Tüm status de?i?iklikleri ve admin not güncellemeleri AuditLog’a yaz?lmal?.
* Rate Limit:
o POST /complaints için:
* Ayn? client’?n çok k?sa sürede çok fazla ?ikayet açmas? engellenebilir (örn. saatlik limit).
* ?li?ki:
o AppointmentId dolu ise, seans detay ekran?ndaki “?ikayet olu?tur” butonu bu endpoint’i kullan?r.
o ConversationId ile ili?ki kurmak istersen, TDD’de Complaint tablosuna ConversationId eklenebilir (?u an opsiyonel).
