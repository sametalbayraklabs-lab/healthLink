8. Mesajla?ma API
Bu bölüm:
* Dan??an–Uzman aras?nda 1–1 mesajla?ma
* Konu?ma listesi
* Mesaj listesi
* Okunma durumlar?
* ?ikayet / flag mekanizmas?
* Admin moderasyon için gerekli meta endpoint’ler
için kullan?lacak API’leri kapsar.
?lgili tablolar (TDD):
* Conversation
* Message
* ConversationFlag

8.1 GET /conversations/my
Amaç:
Giri? yapm?? kullan?c?n?n (Client veya Expert) taraf oldu?u konu?ma listesini döner.
“Mesajlar” ekran?ndaki sol panel / konu?ma listesi için.
Auth:
Client veya Expert
Query parametreleri (opsiyonel):
* page=1&pageSize=20
Response (200 OK):
{
  "items": [
    {
      "conversationId": 10,
      "otherParty": {
        "type": "Expert",
        "id": 70,
        "displayName": "Dyt. Ay?e Kaya"
      },
      "lastMessagePreview": "Son gönderdi?iniz k?sa mesaj burada...",
      "lastMessageAt": "2025-02-10T18:00:00Z",
      "unreadCount": 2,
      "isFrozen": false
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 5
}
Kurallar:
* Client ise ? ClientId = current olan konu?malar.
* Expert ise ? ExpertId = current olan konu?malar.
* lastMessagePreview backend’de MessageText’in ilk ~50–100 karakteri olabilir.
* Frozen konu?malar (IsFrozen = 1) listelenir ama yeni mesaj gönderimi k?s?tlan?r (a?a??da).

8.2 POST /conversations/start
Amaç:
Dan??an ile uzman aras?nda ilk kez konu?ma ba?latmak.
Seans sonras? otomatik konu?ma açmak veya “Mesaj Gönder” butonundan tetiklenebilir.
Auth:
Client
Request:
{
  "expertId": 70,
  "initialMessage": "Merhaba hocam, seans öncesi baz? bilgiler payla?mak istiyorum."
}
Response (201 Created):
{
  "conversationId": 10
}
?? kurallar?:
* Ayn? (ClientId, ExpertId) çifti için en fazla 1 aktif konu?ma:
o Varsa onu döner, yeni olu?turmaz (idempotent davran??).
* initialMessage opsiyonel olabilir; bo?sa sadece konu?ma ba?lar, mesaj sonradan gönderilir.
* Konu?ma frozen ise (moderasyon nedeniyle) 400 + CONVERSATION_FROZEN dönebilir.

8.3 GET /conversations/{conversationId}
Amaç:
Konu?man?n üst bilgisini ve özetini döner (mesaj listesinden ayr?).
Detayl? chat ekran?n?n header k?sm? için.
Auth:
Conversation taraf? olan Client veya Expert
Response (200 OK):
{
  "conversationId": 10,
  "client": {
    "id": 45,
    "displayName": "Ahmet Y?lmaz"
  },
  "expert": {
    "id": 70,
    "displayName": "Dyt. Ay?e Kaya",
    "expertType": "Dietitian"
  },
  "isFrozen": false,
  "createdAt": "2025-02-01T10:00:00Z",
  "lastMessageAt": "2025-02-10T18:00:00Z"
}

8.4 GET /conversations/{conversationId}/messages
Amaç:
Seçili konu?man?n mesajlar?n? listeler.
“Chat ekran?” için.
Auth:
Conversation taraf? olan Client veya Expert
Query parametreleri:
* page=1&pageSize=50 (örn. sayfal? geriye do?ru liste)
* ?ste?e ba?l?: direction=desc (son mesajdan geriye do?ru)
Response (200 OK):
{
  "items": [
    {
      "id": 1001,
      "senderUserId": 123,
      "isMine": true,
      "messageText": "Merhaba hocam, bugün de?erlerimi payla?aca??m.",
      "isRead": true,
      "createdAt": "2025-02-10T17:55:00Z",
      "readAt": "2025-02-10T18:00:00Z"
    },
    {
      "id": 1002,
      "senderUserId": 200,
      "isMine": false,
      "messageText": "Tamam, bekliyorum ??",
      "isRead": true,
      "createdAt": "2025-02-10T17:56:00Z",
      "readAt": "2025-02-10T18:01:00Z"
    }
  ],
  "page": 1,
  "pageSize": 50,
  "totalCount": 25
}
Kurallar:
* isMine frontend kolayl??? için; backend SenderUserId == currentUserId’den hesaplayabilir.
* Sadece ilgili taraf mesajlar? görebilir; admin buradan asla ça??rmaz.

8.5 POST /conversations/{conversationId}/messages
Amaç:
Konu?maya yeni mesaj göndermek.
Auth:
Conversation taraf? olan Client veya Expert
Request:
{
  "messageText": "Hocam bugün 2 litre su içtim ve 8.000 ad?m att?m."
}
Response (201 Created):
{
  "id": 1003,
  "conversationId": 10,
  "senderUserId": 123,
  "messageText": "Hocam bugün 2 litre su içtim ve 8.000 ad?m att?m.",
  "isRead": false,
  "createdAt": "2025-02-10T18:05:00Z"
}
?? kurallar?:
* Konu?ma IsFrozen = true ise:
o 400 + CONVERSATION_FROZEN
* messageText:
o Bo? olamaz.
o Max 1000 karakter (FDD: 300 de olur, TDD’ye göre ayarlan?r).
* Flood/spam korumas?:
o Örn. 1 saniyede 3’ten fazla mesaj ? 429 + RATE_LIMIT_EXCEEDED
o Bu kural ileride SystemSetting ile konfigüre edilebilir.
* Mesaj gönderildi?inde:
o Conversation.LastMessageAt güncellenir.
o Kar?? kullan?c?ya real-time / push notification tetiklenebilir.

8.6 POST /conversations/{conversationId}/read
Amaç:
Kullan?c?n?n bu konu?madaki kar?? taraftan gelen tüm okunmam?? mesajlar?n? okundu i?aretlemesi.
“Konu?ma aç?ld???nda okundu say” ak???.
Auth:
Conversation taraf? olan Client veya Expert
Request:
{}
Response (200 OK):
{
  "conversationId": 10,
  "markedAsReadCount": 5,
  "updatedAt": "2025-02-10T18:10:00Z"
}
Kurallar:
* Sadece kar?? taraf?n mesajlar? okunmu? i?aretlenir.
* IsRead = 1, ReadAt = now.
* Badge/unreadCount UI taraf?nda bu say?ya göre güncellenebilir.

8.7 POST /conversations/{conversationId}/report
Amaç:
Dan??an?n (ve ileride istersek uzmanlar?n) bir konu?may? ?ikayet etmesi / flaglemesi.
FDD’de:
* “Bu mesajla?may? bildir” ak???
* ConversationFlag kayd? olu?turma.
Auth:
Client (MVP’de tek tarafl?, ileride Expert de olabilir)
Request:
{
  "reason": "Diyetisyen mesajlar?nda sayg?s?z bir dil kullan?yor."
}
Response (201 Created):
{
  "id": 55,
  "conversationId": 10,
  "status": "Open",
  "createdAt": "2025-02-10T18:15:00Z"
}
?? kurallar?:
* Ayn? user ayn? konu?may? çok k?sa sürede tekrar rapor ediyorsa rate limit uygulanabilir.
* ConversationFlag.Status ba?lang?çta Open.
* Bu kay?t Admin moderasyon paneline (10.10) dü?er.

8.8 Admin – Mesajla?ma Moderasyon API (Meta)
?? Önemli:
Bu endpoint’ler mesaj içeriklerini döndürmez, sadece meta veri ve flag bilgisi döner.
KVKK ve gizlilik gere?i admin hiçbir ?ekilde MessageText görmez.
8.8.1 GET /admin/conversations/flagged
Amaç:
Admin’in flag’lenmi? konu?malar? listelemesi.
Auth:
Admin
Query parametreleri:
* status=Open,InReview,Closed
* fromDate, toDate
* userType=Client,Expert (raporu yapan)
* page=1&pageSize=20
Response (200 OK):
{
  "items": [
    {
      "conversationId": 10,
      "client": {
        "id": 45,
        "maskedName": "A*** Y*****"
      },
      "expert": {
        "id": 70,
        "displayName": "Dyt. Ay?e Kaya"
      },
      "lastFlagAt": "2025-02-10T18:15:00Z",
      "flagCount": 2,
      "status": "Open"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 3
}

8.8.2 GET /admin/conversations/{conversationId}/meta
Amaç:
Admin’in tek bir konu?maya ait meta verilerini görüntülemesi.
Moderasyon ekran?ndaki:
* Taraf bilgileri
* Mesaj say?lar?
* Zaman çizgisi
* Risk sinyalleri
gibi özetler için.
Auth:
Admin
Response (200 OK):
{
  "conversationId": 10,
  "client": {
    "id": 45,
    "maskedName": "A*** Y*****",
    "totalFlagsAsClient": 1,
    "totalFlagsAgainstClient": 0
  },
  "expert": {
    "id": 70,
    "displayName": "Dyt. Ay?e Kaya",
    "totalFlagsAsExpert": 0,
    "totalFlagsAgainstExpert": 2
  },
  "stats": {
    "totalMessages": 42,
    "messagesLast24h": 18,
    "firstMessageAt": "2025-02-01T10:00:00Z",
    "lastMessageAt": "2025-02-10T18:00:00Z"
  },
  "riskSignals": {
    "floodSuspected": true,
    "spamSuspected": false,
    "tooManyMessagesInShortTime": true
  },
  "flags": [
    {
      "id": 55,
      "reportedByUserId": 123,
      "reportedAt": "2025-02-10T18:15:00Z",
      "reason": "Diyetisyen mesajlar?nda sayg?s?z bir dil kullan?yor.",
      "status": "Open"
    }
  ],
  "isFrozen": false
}
Not:
reason burada gösterilebilir ama istenirse k?sa kod (örn. “Behaviour”) ?eklinde tutulup, serbest metin admin’e gösterilmeyebilir. FDD’de dan??an?n yazd??? k?sa aç?klamay? admin görüyor; istersen ileride maskeleyebiliriz.

8.8.3 POST /admin/conversations/{conversationId}/actions/mark-clean
Amaç:
Admin’in “Bu konu?mada sorun yok” diye i?aretlemesi.
ConversationFlag.Status = Closed yap?l?r; konu?ma normal devam eder.
Auth:
Admin
Request:
{
  "adminNote": "?ncelendi, uygunsuz içerik tespit edilmedi."
}
Response (200 OK):
{
  "conversationId": 10,
  "newStatus": "Closed"
}

8.8.4 POST /admin/conversations/{conversationId}/actions/warn-user
Amaç:
Admin’in taraflardan birine uyar? göndermesi (sistem içi notification / e-posta).
Örn. diyetisyene “mesajla?ma kurallar?n? hat?rlatan” bir uyar?.
Auth:
Admin
Request:
{
  "target": "Expert",
  "reasonCode": "UNPROFESSIONAL_BEHAVIOUR",
  "adminNote": "Dan??anla konu?urken daha profesyonel bir dil kullan?lmas? rica olunur."
}
Response (200 OK):
{
  "conversationId": 10,
  "target": "Expert",
  "warningSent": true
}

8.8.5 POST /admin/conversations/{conversationId}/actions/freeze
Amaç:
Admin’in bu konu?may? dondurmas?.
Her iki taraf da bu konu?mada yeni mesaj gönderemez.
Auth:
Admin
Request:
{
  "reasonCode": "UNDER_REVIEW",
  "adminNote": "?ikayet incelemesi tamamlanana kadar konu?ma geçici olarak durdurulmu?tur."
}
Response (200 OK):
{
  "conversationId": 10,
  "isFrozen": true
}
?? kurallar?:
* Conversation.IsFrozen = 1
* POST /conversations/{id}/messages ça?r?lar?nda:
o 400 + CONVERSATION_FROZEN döndürülür.

8.8.6 POST /admin/conversations/{conversationId}/actions/unfreeze
Amaç:
Dondurulmu? konu?may? tekrar aktif hale getirmek.
Auth:
Admin
Request:
{
  "adminNote": "?nceleme tamamland?, konu?ma yeniden aç?ld?."
}
Response (200 OK):
{
  "conversationId": 10,
  "isFrozen": false
}

Bu Mesajla?ma API blo?uyla birlikte:
* Dan??an & Uzman taraf?nda:
o Konu?ma listesi
o Mesaj gönderme / okuma
o Okundu i?aretleme
o ?ikayet/flag mekanizmas?
* Admin taraf?nda:
o Flag’lenmi? konu?malar? görme
o Meta analiz (içerik görmeden)
o Uyar? / freeze / unfreeze aksiyonlar?
API seviyesinde netle?mi? oldu.
?? 9. Review & De?erlendirme API
Bu bölüm:
* Seans sonras? puanlama
* Yorum b?rakma
* Admin moderasyonu (onay / reddetme)
* Expert profilindeki puan istatistiklerinin güncellenmesi
ak??lar?n? kapsar.
TDD’deki ili?kili tablolar:
* Review
* Appointment
* Expert
* AuditLog (admin i?lemleri için)

9.1 ``** – Yeni De?erlendirme Olu?tur**
Amaç:
Dan??an?n tamamlanan bir seans için y?ld?z puan? (zorunlu) + yorum (opsiyonel) b?rakmas?.
Auth:
Client
Request:
{
  "appointmentId": 101,
  "rating": 5,
  "comment": "Çok verimli bir görü?meydi, te?ekkür ederim."
}
Response (201 Created):
{
  "id": 501,
  "appointmentId": 101,
  "expertId": 70,
  "clientId": 45,
  "rating": 5,
  "comment": "Çok verimli bir görü?meydi, te?ekkür ederim.",
  "status": "PendingApproval",
  "createdAt": "2025-02-11T10:00:00Z"
}
Kurallar:
* Appointment:
o Status = Completed olmal?,
o Client’a ait olmal?,
o Daha önce review olu?turulmam?? olmal? ? aksi halde 400 REVIEW_ALREADY_EXISTS.
* rating 1–5 aras? zorunlu.
* comment opsiyonel, max 500 karakter.
* Olu?turulan review’?n durumu:
o PendingApproval
* Admin onaylayana kadar Expert profilinde görünmez.

9.2 ``** – Dan??an?n Kendi De?erlendirmeleri**
Amaç:
Dan??an?n geçmi?te yapt??? de?erlendirmeleri listelemek.
Auth: Client
Response (200 OK):
{
  "items": [
    {
      "id": 501,
      "appointmentId": 101,
      "expertId": 70,
      "expertName": "Dyt. Ay?e Kaya",
      "rating": 5,
      "comment": "Çok verimliydi",
      "status": "Approved",
      "createdAt": "2025-02-11T10:00:00Z"
    }
  ]
}

9.3 ``** – Expert Profili ?çin Review Listesi**
Amaç:
Kullan?c?lar?n (client) uzman profilinde review görmesi.
Auth: Public / Client (ikisi de görebilir)
Kurallar:
* Sadece Approved olanlar listelenir.
* PendingApproval ve Rejected görünmez.
Response:
{
  "items": [
    {
      "id": 501,
      "rating": 5,
      "comment": "Çok iyiydi.",
      "createdAt": "2025-02-11T10:00:00Z",
      "clientMask": "A*** Y******"
    }
  ],
  "averageRating": 4.8,
  "totalReviewCount": 120
}

Admin Moderasyon API’leri
Admin tüm de?erlendirmeleri inceleyebilir.

9.4 ``** – Review Listesi (Filtreli)**
Query parametreleri:
* status=PendingApproval,Approved,Rejected
* expertId=70
* clientId=45
* from=2025-01-01
* to=2025-03-01
* Sayfalama: page=1&pageSize=20
Response:
{
  "items": [
    {
      "id": 501,
      "appointmentId": 101,
      "expertId": 70,
      "expertName": "Dyt. Ay?e Kaya",
      "clientId": 45,
      "rating": 5,
      "comment": "Çok iyiydi.",
      "status": "PendingApproval",
      "createdAt": "2025-02-11T10:00:00Z"
    }
  ]
}

9.5 ``** – Onayla**
Amaç:
Review’? onaylar, expert puan ortalamas? güncellenir.
Auth: Admin
Request:
{
  "adminNote": "Uygun yorum, onayland?."
}
Response:
{
  "id": 501,
  "status": "Approved"
}
Ek Kurallar:
* Expert tablosunda:
o AverageRating
o TotalReviewCount
yeniden hesaplan?r.

9.6 ``** – Reddet**
Amaç:
Uygunsuz review’? reddetmek.
Auth: Admin
Request:
{
  "adminNote": "Yorum uygunsuz içerik bar?nd?r?yor."
}
Response:
{
  "id": 501,
  "status": "Rejected"
}

9.7 ``** – Detay Görüntüleme**
Amaç:
Admin inceleme ekran?nda review’?n tüm detaylar?n? görür.
Response:
{
  "id": 501,
  "appointmentId": 101,
  "expertId": 70,
  "expertName": "Dyt. Ay?e Kaya",
  "clientId": 45,
  "clientNameMasked": "A*** Y******",
  "rating": 5,
  "comment": "Çok iyiydi.",
  "status": "PendingApproval",
  "createdAt": "2025-02-11T10:00:00Z"
}
