6. Randevu & Takvim API
Bu bölüm:
* Dan??an taraf?nda:
o Randevu olu?turma
o Seans listesini görüntüleme
o Seans iptali
o Seans notu
* Uzman taraf?nda:
o Haftal?k çal??ma takvimi (template) yönetimi
o Takvim istisnalar? (tatil / özel blok)
o Uygun slotlar?n listelenmesi
i? ak??lar?n? kapsar.

6.1 GET /appointments/my-upcoming
Amaç:
Dan??an?n yakla?an seanslar?n? listelemek. “Seanslar?m” ekran?ndaki Yakla?an sekmesi için kullan?l?r.
Auth: Client
Query parametreleri (opsiyonel):
* page=1&pageSize=20
Response (200 OK):
{
  "items": [
    {
      "id": 101,
      "expertId": 70,
      "expertDisplayName": "Dyt. Ay?e Kaya",
      "expertType": "Dietitian",
      "startDateTime": "2025-02-10T14:00:00Z",
      "endDateTime": "2025-02-10T14:30:00Z",
      "status": "Scheduled",
      "zoomLinkAvailable": true,
      "canCancel": true
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 5
}
Kurallar:
* Sadece Status IN (Scheduled) ve bugünden sonraki seanslar listelenir.
* zoomLinkAvailable = true sadece:
o Status = Scheduled ve
o Seans ba?lang?c?na ? 15 dakika kald?ysa.

6.2 GET /appointments/my-past
Amaç:
Dan??an?n geçmi? seanslar?n? listelemek. “Seanslar?m” ekran?ndaki Geçmi? sekmesi için kullan?l?r.
Auth: Client
Query parametreleri (opsiyonel):
* page=1&pageSize=20
Response:
{
  "items": [
    {
      "id": 90,
      "expertId": 70,
      "expertDisplayName": "Dyt. Ay?e Kaya",
      "expertType": "Dietitian",
      "startDateTime": "2025-01-15T14:00:00Z",
      "endDateTime": "2025-01-15T14:30:00Z",
      "status": "Completed",
      "hasReport": true,
      "hasReview": true
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 12
}

6.3 GET /appointments/{id}
Amaç:
Tek bir seans?n detay?n? döner. “Seans Detay?” modal? için hem dan??an hem uzman taraf?nda kullan?labilir.
Auth: Client veya Expert
(e?er ilgili appointment’?n taraf?ysa)
Response (örnek – Client taraf?):
{
  "id": 101,
  "clientId": 45,
  "expertId": 70,
  "expertDisplayName": "Dyt. Ay?e Kaya",
  "serviceType": "NutritionSession",
  "startDateTime": "2025-02-10T14:00:00Z",
  "endDateTime": "2025-02-10T14:30:00Z",
  "status": "Scheduled",
  "package": {
    "clientPackageId": 33,
    "servicePackageId": 5,
    "packageName": "4'lü Paket"
  },
  "zoomLink": "https://zoom.us/j/xxx",
  "zoomLinkAvailable": true,
  "clientNote": "Bu seans için sorular?m var...",
  "hasReport": true
}
Kurallar:
* zoomLink sadece:
o Appointment’?n taraf? (client veya expert) ise
o Ve seans ba?lang?c?na ? 15 dk kald?ysa döner (veya maskelenmi? olabilir).

6.4 POST /appointments
Amaç:
Dan??an?n bir uzman ile randevu olu?turmas?n? sa?lar. “Randevu Olu?tur” ekran?n?n submit ad?m?.
Auth: Client
Request:
{
  "expertId": 70,
  "startDateTime": "2025-02-10T14:00:00Z"
}
EndDateTime backend taraf?ndan sistem seans süresine göre hesaplanabilir (ör. 30 dk).
Response (201 Created):
{
  "id": 101,
  "clientId": 45,
  "expertId": 70,
  "startDateTime": "2025-02-10T14:00:00Z",
  "endDateTime": "2025-02-10T14:30:00Z",
  "status": "Scheduled"
}
?? kurallar?:
* Dan??an?n en az 1 kullan?labilir seans hakk? olmal?:
o Aksi halde 400 + NO_AVAILABLE_SESSIONS.
* Slot uygun olmal?:
o Uzman?n çal??ma saatine uygun
o Tatil / exception ile çak??mamal?
o Ba?ka randevu taraf?ndan dolu olmamal?
* Ayn? dan??an, ayn? saatte ikinci randevu olu?turamaz.
* Slot çak??mas?nda:
o 409 + SLOT_ALREADY_BOOKED.

6.5 POST /appointments/{id}/cancel
Amaç:
Dan??an?n seans? iptal etmesini sa?lar (seans iptali i? kurallar?na göre).
Auth: Client
Request:
{
  "reason": "Bu hafta ?ehir d???nda olaca??m."
}
Response (200 OK):
{
  "id": 101,
  "status": "CancelledByClient"
}
?? kurallar? (MVP FDD’ye uygun):
* Seansa 24 saatten az süre kald?ysa:
o 400 + CANCELLATION_WINDOW_PASSED
* Dan??an haftal?k en fazla 2 seans iptal edebilir:
o Limit dolduysa 400 + WEEKLY_CANCELLATION_LIMIT_REACHED
* ?ptal edilince:
o Paket seans hakk? iade edilir (RemainingSessions++).
o Uzman?n slotu tekrar müsait hale gelir.
o Uzmana iptal bildirimi gönderilir.

6.6 PUT /appointments/{id}/note
Amaç:
Dan??an?n kendi seans?na ki?isel not eklemesini veya güncellemesini sa?lar.
Auth: Client (sadece kendi appointment’? için)
Request:
{
  "noteText": "Bu seans için: su tüketimi, uyku süresi, egzersiz s?kl??? konu?ulacak."
}
Response (200 OK):
{
  "appointmentId": 101,
  "clientId": 45,
  "noteText": "Bu seans için: su tüketimi, uyku süresi, egzersiz s?kl??? konu?ulacak.",
  "updatedAt": "2025-02-01T10:00:00Z"
}
Kurallar:
* Max 1000 karakter.
* Sadece ilgili client görebilir.
* Bo? string gönderilirse not silinebilir (karar: ya soft delete ya text = null).

6.7 Uzman Takvim ?ablonu (ExpertScheduleTemplate)
Bu bölüm uzman?n haftal?k çal??ma plan? içindir.
6.7.1 GET /experts/me/schedule/template
Amaç:
Uzman?n mevcut haftal?k çal??ma ?ablonunu döner.
Auth: Expert
Response (örnek):
{
  "expertId": 70,
  "days": [
    {
      "dayOfWeek": 1,
      "isOpen": true,
      "workStartTime": "09:00",
      "workEndTime": "18:00"
    },
    {
      "dayOfWeek": 2,
      "isOpen": false
    }
  ]
}
dayOfWeek: 0 = Pazar, 1 = Pazartesi, … 6 = Cumartesi

6.7.2 PUT /experts/me/schedule/template
Amaç:
Uzman?n haftal?k çal??ma saatlerini tan?mlamas? veya güncellemesi.
Auth: Expert
Request:
{
  "days": [
    {
      "dayOfWeek": 1,
      "isOpen": true,
      "workStartTime": "10:00",
      "workEndTime": "20:00"
    },
    {
      "dayOfWeek": 2,
      "isOpen": false
    },
    {
      "dayOfWeek": 3,
      "isOpen": true,
      "workStartTime": "09:00",
      "workEndTime": "17:00"
    }
  ]
}
Response (200 OK): Güncel ?ablon.
?? kurallar?:
* ?ablon sadece gelecekteki bo? slotlar? etkiler, halihaz?rda al?nm?? randevular korunur.
* workStartTime < workEndTime olmal?.
* Günün isOpen = false ise saat alanlar? yok say?l?r.
* Uzman çal??ma saatlerini haftada en fazla 3 kez de?i?tirebilir (opsiyonel kural ? SYSTEM_SETTING).

6.8 Takvim ?stisnalar? (ExpertScheduleException)
6.8.1 GET /experts/me/schedule/exceptions
Amaç:
Uzman?n tan?ml? tüm tatil / özel blok istisnalar?n? listeler.
Auth: Expert
Response:
[
  {
    "id": 10,
    "date": "2025-02-15",
    "type": "Holiday",
    "startTime": null,
    "endTime": null,
    "reason": "Resmi tatil"
  },
  {
    "id": 11,
    "date": "2025-02-20",
    "type": "PartialClose",
    "startTime": "15:00",
    "endTime": "17:00",
    "reason": "E?itim"
  }
]

6.8.2 POST /experts/me/schedule/exceptions
Amaç:
Uzman?n belirli bir günü veya saat aral???n? tatil / kapal? olarak i?aretlemesi.
Auth: Expert
Request (tam gün tatil):
{
  "date": "2025-02-15",
  "type": "Holiday",
  "reason": "Özel gün"
}
Request (k?smi kapan??):
{
  "date": "2025-02-20",
  "type": "PartialClose",
  "startTime": "15:00",
  "endTime": "17:00",
  "reason": "Toplant?"
}
Response (201 Created):
{
  "id": 11,
  "date": "2025-02-20",
  "type": "PartialClose",
  "startTime": "15:00",
  "endTime": "17:00",
  "reason": "Toplant?"
}
?? kurallar?:
* Tam gün tatilde (type = Holiday) tüm slotlar kapat?l?r.
* ?lgili günde halihaz?rda randevular varsa:
o Sistem uyar? üretir (UI taraf?nda onay ak???).
o Randevu iptal ak??? (ve bildirim) ayr? süreçte yönetilir (MVP’de manuel olabilir).

6.8.3 DELETE /experts/me/schedule/exceptions/{id}
Amaç:
Uzman?n daha önce ekledi?i bir istisnay? kald?rmas?.
Auth: Expert
Response (200 OK):
{
  "success": true
}
Kurallar:
* Geçmi? tarihe ait istisna silinemeyebilir (iste?e ba?l? kural).
* Sadece ilgili experte ait kay?tlar silinebilir, ba?kas?n?n exception’? silinemez.

6.9 Uygun Slotlar?n Listelenmesi (Client taraf? Randevu Ekran?)
6.9.1 GET /experts/{expertId}/availability
Amaç:
Dan??an randevu ekran?nda bir uzman?n uygun gün ve saatlerini görmek için kullan?r.
Bu endpoint:
* Uzman?n haftal?k ?ablonunu
* ?stisnalar? (tatil/kapal?)
* Mevcut dolu randevular?
dikkate alarak uygun slotlar? hesaplar.
Auth: Client (veya public read-only, ama randevu için login ?art?).
Query parametreleri:
* fromDate=2025-02-10
* toDate=2025-02-17
Response (örnek):
{
  "expertId": 70,
  "fromDate": "2025-02-10",
  "toDate": "2025-02-17",
  "days": [
    {
      "date": "2025-02-10",
      "isOpen": true,
      "slots": [
        {
          "startDateTime": "2025-02-10T14:00:00Z",
          "endDateTime": "2025-02-10T14:30:00Z",
          "isAvailable": true
        },
        {
          "startDateTime": "2025-02-10T14:30:00Z",
          "endDateTime": "2025-02-10T15:00:00Z",
          "isAvailable": false
        }
      ]
    },
    {
      "date": "2025-02-15",
      "isOpen": false,
      "reason": "Holiday"
    }
  ]
}
Kurallar:
* Slot süresi (ör. 30 dk) SystemSetting’ten okunur.
* isAvailable = false olan slotlara randevu olu?turulamaz.
* Geçmi? tarih/saat için slot üretilmez.
* toDate - fromDate aral??? güvenlik ve performans için s?n?rlanmal?d?r (örn. max 30 gün).

6.10 Uzman Takviminde Randevu Listesi (Admin / Expert)
6.10.1 GET /experts/me/appointments
Amaç:
Uzman?n takviminde kendi randevular?n? görmesi.
Auth: Expert
Query parametreleri:
* from=2025-02-01T00:00:00Z
* to=2025-02-29T23:59:59Z
* status=Scheduled,Completed (opsiyonel)
Response:
{
  "items": [
    {
      "id": 101,
      "clientId": 45,
      "clientName": "Ahmet Y?lmaz",
      "startDateTime": "2025-02-10T14:00:00Z",
      "endDateTime": "2025-02-10T14:30:00Z",
      "status": "Scheduled"
    }
  ]
}

6.10.2 GET /experts/{expertId}/appointments (Admin)
Amaç:
Admin taraf?nda bir uzman?n takvimini incelemek için (read-only).
Auth: Admin
Parametreler ve response format? 6.10.1 ile ayn?d?r.
7. Paket & Ödeme API
Bu bölüm:
* Public / client taraf?nda:
o Paket listesi (Tekli, 4’lü, 10’lu vb.)
o Paket detay
o Paket sat?n alma + indirim kodu
o ClientPackage durumlar?n?n izlenmesi
* Ödeme taraf?nda:
o Ödeme ba?latma (iyzico entegrasyonu)
o Ödeme sonucunun webhook ile i?lenmesi
o Ödeme geçmi?i
ak??lar?n? kapsar.
Veritaban? tabanl? objeler (TDD ile hizal?):
* ServicePackage
* ClientPackage
* Payment
* DiscountCode
* PaymentDiscountUsage

7.1 GET /packages
Amaç:
Public ve login olmu? kullan?c?lar için sat?n al?nabilir paket listesini döner.
Landing page’deki “Paketler” bölümünde ve Dashboard ? “Paket Sat?n Al” ekran?nda kullan?l?r.
Auth:
Public kullan?labilir (login opsiyonel).
Query parametreleri (opsiyonel):
* expertType=Dietitian (ileride Psychologist vb. için filtre)
* isActive=true (default)
Response (200 OK):
{
  "items": [
    {
      "id": 5,
      "name": "Tek Seans",
      "description": "1 adet beslenme dan??manl??? seans?.",
      "expertType": "Dietitian",
      "sessionCount": 1,
      "price": 399.00,
      "currency": "TRY",
      "isActive": true
    },
    {
      "id": 6,
      "name": "4'lü Paket",
      "description": "4 adet online beslenme seans?.",
      "expertType": "Dietitian",
      "sessionCount": 4,
      "price": 1399.00,
      "currency": "TRY",
      "isActive": true
    }
  ]
}

7.2 GET /packages/{id}
Amaç:
Belirli bir paket detay?n? döner. “Paket Detay / Önizleme” ekran? için.
Auth:
Public (sadece bilgi göstermelik).
Response (200 OK):
{
  "id": 5,
  "name": "Tek Seans",
  "description": "1 adet beslenme dan??manl??? seans?.",
  "expertType": "Dietitian",
  "sessionCount": 1,
  "price": 399.00,
  "currency": "TRY",
  "isActive": true
}

7.3 POST /discount-codes/validate
Amaç:
Dan??an?n girdi?i indirim kodunun geçerlili?ini ve indirimli fiyat? hesaplar.
“Paket Önizleme” ekran?ndaki ?ndirim Kodu Uygula ak???.
Auth:
Client (login zorunlu; publicte indirimi hesaplatmayal?m).
Request:
{
  "code": "YENI10",
  "servicePackageId": 5
}
Response (200 OK – geçerli kod):
{
  "code": "YENI10",
  "isValid": true,
  "discountType": "Percentage",
  "value": 10.0,
  "originalPrice": 399.00,
  "discountAmount": 39.90,
  "finalPrice": 359.10,
  "currency": "TRY"
}
Response (200 OK – geçersiz kod):
{
  "code": "YENI10",
  "isValid": false,
  "errorCode": "EXPIRED_OR_INVALID",
  "message": "?ndirim kodu geçersiz veya kullan?m süresi dolmu?."
}
?? kurallar?:
* Kod aktif olmal? (IsActive = 1).
* Tarih aral??? içinde olmal? (ValidFrom <= now <= ValidTo).
* MaxUsageCount dolmam?? olmal?.
* Paket/ExpertType uyumu sa?lanmal? (ilgiliye göre s?n?rlanm??sa).
* ?ndirim sonras? fiyat 0 TL alt?na dü?emez.

7.4 POST /payments/initiate
Amaç:
Seçilen paket + opsiyonel indirim kodu ile ödeme sürecini ba?lat?r.
Ödeme gateway’ine (iyzico) istek at?l?r, Payment kayd? Pending olarak olu?turulur, frontend’e iyzico için ihtiyaç duydu?u bilgiler döner.
Auth:
Client
Request:
{
  "servicePackageId": 5,
  "discountCode": "YENI10"
}
Response (201 Created):
{
  "paymentId": 1001,
  "clientPackageTempId": 2001,
  "amount": 359.10,
  "currency": "TRY",
  "gateway": "iyzico",
  "gatewayInitPayload": {
    "iyzicoCheckoutToken": "abc123...",
    "redirectUrl": "https://sandbox-iyzico-url",
    "otherData": "..."
  }
}
Not:
clientPackageTempId opsiyonel. Baz? projelerde ödeme öncesi “PendingPayment” statüsünde ClientPackage olu?turulup ödeme sonucu gelince güncellenir; baz? projelerde ise paket ancak ödeme onay?ndan sonra yarat?l?r. MVP’de esnek b?rakabiliriz, ama TDD’de Status = PendingPayment mant???na uygunuz.
?? kurallar?:
* ServicePackage aktif olmal?.
* DiscountCode geçerli olmal? (varsa); aksi durumda 400 + aç?klama.
* Payment kayd?:
o Status = Pending
o Amount = indirim sonras? tutar
o ClientId = current client
o Gateway = “iyzico”
* ?leride:
o Tek çekim yerine farkl? ödeme yöntemleri eklenebilir (kart kaydetme vs.).

7.5 POST /payments/iyzico-webhook
Amaç:
iyzico taraf?ndan ça?r?lan webhook endpoint’i.
Ödeme sonucuna göre Payment ve ClientPackage güncellenir.
Auth:
Public endpoint, ancak:
* IP allowlist
* Signature / secret key do?rulama
zorunlu.
Request (örnek – gateway’den gelen payload basitle?tirilmi?):
{
  "paymentId": "PG-123456",
  "conversationId": "1001",
  "status": "success",
  "paidPrice": 359.10,
  "currency": "TRY"
}
conversationId alan? bizim sistemdeki Payment.Id veya ekledi?imiz bir referans ID olabilir.
Response (200 OK):
{
  "success": true
}
?? kurallar? (ba?ar?l? ödeme):
* ?lgili Payment bulunur ? Status = Success, ConfirmedAt doldurulur.
* E?er daha önce ClientPackage olu?turulmad?ysa:
o ClientPackage kayd? yarat?l?r:
* ClientId
* ServicePackageId
* TotalSessions = SessionCount
* UsedSessions = 0
* Status = Active
* PurchaseDate = now
* E?er PendingPayment status’lü ClientPackage vard?ysa:
o Status = Active yap?l?r.
* Discount kullan?ld?ysa:
o PaymentDiscountUsage kayd? olu?turulur.
o DiscountCode.UsedCount + 1.
?? kurallar? (ba?ar?s?z ödeme):
* Payment.Status = Failed yap?l?r.
* ClientPackage olu?turulmaz veya PendingPayment ise iptal edilir.

7.6 GET /client-packages/my-active
Amaç:
Dan??an?n aktif paketlerini listeler.
Dashboard’daki “Aktif Paket Bilgisi” kart? ve randevu olu?tururken seans kontrolü için kullan?l?r.
Auth:
Client
Response (200 OK):
{
  "items": [
    {
      "id": 33,
      "servicePackageId": 5,
      "packageName": "4'lü Paket",
      "totalSessions": 4,
      "usedSessions": 1,
      "remainingSessions": 3,
      "status": "Active",
      "purchaseDate": "2025-01-20T10:00:00Z",
      "expireDate": "2025-07-20T10:00:00Z"
    }
  ]
}
Kurallar:
* Status IN ('Active') olanlar listelenir.
* RemainingSessions = TotalSessions - UsedSessions.
* ?leride birden fazla aktif paket destekleniyorsa hepsi döner; MVP’de tek aktif paket de olabilir, ama API multi’yi desteklesin.

7.7 GET /client-packages/my-history
Amaç:
Dan??an?n geçmi? paketlerini (tamamlanm?? / süresi dolmu?) listeler.
Auth:
Client
Query parametreleri (opsiyonel):
* page=1&pageSize=10
Response:
{
  "items": [
    {
      "id": 21,
      "servicePackageId": 5,
      "packageName": "Tek Seans",
      "totalSessions": 1,
      "usedSessions": 1,
      "remainingSessions": 0,
      "status": "Completed",
      "purchaseDate": "2024-11-01T09:00:00Z",
      "expireDate": "2025-05-01T09:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 3
}
Status örnekleri:
* Completed ? Tüm seanslar kullan?lm??
* Expired ? Süre dolmu?
* Cancelled ? ?ade / admin müdahelesi gibi özel durumlar

7.8 GET /payments/my
Amaç:
Dan??an?n kendi ödeme kay?tlar?n? görmesi (basit ödeme geçmi?i).
Auth:
Client
Query parametreleri:
* page=1&pageSize=10
* status=Success,Failed (opsiyonel)
Response (200 OK):
{
  "items": [
    {
      "id": 1001,
      "clientPackageId": 33,
      "amount": 359.10,
      "currency": "TRY",
      "status": "Success",
      "createdAt": "2025-01-20T10:00:00Z",
      "confirmedAt": "2025-01-20T10:01:30Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 4
}

7.9 Admin Paket Yönetimi
Admin taraf?ndaki paket ve indirim yönetimi için temel endpoint’ler:
7.9.1 GET /admin/packages
Amaç:
Admin’in tüm ServicePackage kay?tlar?n? listelemesi.
Auth:
Admin
Response (örnek):
{
  "items": [
    {
      "id": 5,
      "name": "Tek Seans",
      "sessionCount": 1,
      "price": 399.00,
      "currency": "TRY",
      "expertType": "Dietitian",
      "isActive": true,
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ]
}

7.9.2 POST /admin/packages
Amaç:
Yeni bir ServicePackage olu?turur.
Request:
{
  "name": "10'lu Premium Paket",
  "description": "10 adet online beslenme seans? + ek raporlama",
  "expertType": "Dietitian",
  "sessionCount": 10,
  "price": 2990.00,
  "currency": "TRY",
  "isActive": true
}
Response (201 Created):
Olu?turulan paket modeli.

7.9.3 PUT /admin/packages/{id}
Amaç:
Var olan paketi güncellemek (fiyat, ad, aktiflik).
Not: Canl?da çok dikkatli kullan?lmal?, geçmi? sat??lar etkilenmemeli. Genelde “soft delete + yeni paket” tercih edilir ama MVP’de basit tutabiliriz.

7.9.4 GET /admin/discount-codes
Amaç:
Admin’in tüm indirim kodlar?n? görmesi.

7.9.5 POST /admin/discount-codes
Amaç:
Yeni DiscountCode olu?turmak.
Request:
{
  "code": "YENI10",
  "description": "Yeni üyelere özel %10 indirim",
  "discountType": "Percentage",
  "value": 10,
  "validFrom": "2025-01-01T00:00:00Z",
  "validTo": "2025-03-01T00:00:00Z",
  "maxUsageCount": 100,
  "applicableExpertType": "Dietitian",
  "isActive": true
}
Response (201 Created):
Olu?turulan indirim kodu modeli.

Bu blokla birlikte:
* Paket listesi & detay
* ?ndirim kodu validasyonu
* Ödeme ba?latma + webhook
* ClientPackage yönetimi (aktif & geçmi?)
* Client ödeme geçmi?i
* Admin paket & indirim kodu yönetimi
API seviyesinde tan?mlanm?? oldu.
