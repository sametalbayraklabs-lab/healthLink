10.10 Mesajla?ma Moderasyonu – FDD (Admin)
(Platform içi mesajla?man?n güvenli?ini sa?layan moderasyon modülü)

10.10.1 Amaç
Platform içi mesajla?mada:
* Spam,
* Taciz,
* Uygunsuz davran??,
* Bilgi suistimali,
* Reklam / yönlendirme,
* Kötü niyetli kullan?m
gibi durumlar? tespit edip yönetmek için admin’e kontrol paneli sunar.
?? Not:
Admin mesaj içeriklerini göremez.
Sadece meta veriler ve “flagged / ?ikayet edilmi?” mesajlar için risk sinyalleri gösterilir.
Böylece:
* KVKK korunur
* Gizlilik korunur
* Güvenli kullan?m sa?lan?r

10.10.2 Roller
RolYetkiAdminFlaglenen mesajlar? ve kullan?c? davran???n? inceler, i?lem yaparUzmanGöremezClientGöremez
10.10.3 Moderasyon Kapsam?
Mesajla?ma sistemi a?a??daki durumlarda moderasyon tetikler:
1. Kullan?c? Raporu
* Dan??an ? Uzman
* Uzman ? Dan??an
(MVP’de sadece dan??an raporu var)
2. Otomatik Tespit (AI/Rules Engine – Faz 2)
* Spam davran???
* Çok k?sa sürede 10+ mesaj ? flood detection
* Uygunsuz kelime seti (algoritmik)
* URL payla??m? (engelli olabilir)
3. Sistem Uyar?lar?
* Mesaj gönderilemedi ? API hatalar?
* Çok fazla medya denemesi (MVP’de medya yok)

10.10.4 Ekran Bile?enleri
Modül 3 ana ekrandan olu?ur:
1. Flagged Conversations List (??aretli Konu?malar)
2. Conversation Meta Detail (Detay Ekran?)
3. Moderasyon Aksiyon Ekran?

10.10.4.1 Flagged Conversations List
Tablo sütunlar?:
* Konu?ma ID
* Taraflar:
o Dan??an (maskeli)
o Uzman
* Flag nedeni:
o User Report
o Spam suspicion
o System alert
* Flag tarihi
* Flag say?s? (ayn? konu?mada birden fazla rapor)
* Durum:
o Open
o In Review
o Closed
* “?ncele” butonu
Filtreler
* Flag nedeni
* Tarih aral???
* Kullan?c? tipi (Client / Expert)
* Durum
* Konu?ma ID
* Kullan?c? e-posta
Bo? durum
“?u anda incelenmesi gereken i?aretli mesaj bulunmuyor.”

10.10.4.2 Meta Detail Ekran?
Önemli:
Mesaj içerikleri gösterilmez.
Gösterilen meta bilgiler:
A) Konu?ma Bilgisi
* Konu?ma ID
* Olu?turulma tarihi
* Taraflar
* Toplam mesaj say?s?
* Son mesaj zaman?
B) Mesaj Aktivite Grafi?i
* Zaman bazl? mesaj say?s? grafi?i
(örn. 1 dakikada 12 mesaj ? flood ?üphesi)
C) Kullan?c? Risk Göstergeleri
Client taraf? için:
* Son 7 gün mesaj say?s?
* Kaç uzmanle konu?mu??
* Kaç kez rapor edilmi??
Uzman taraf? için:
* Ayn? anda kaç dan??ana mesaj yazm???
* Son 24 saat mesaj aktivitesi
* Önceki ?ikayetler / uyar?lar
D) Sistem Uyar?lar?
* Flood risk
* Spam risk
* A??r? mesaj
* Çok h?zl? mesaj
* Engelli link denemesi (örn. URL gönderme)
E) Rapor Detay? (Varsa)
* Raporlayan taraf maskeli
* Rapor nedeni
* Rapor aç?klamas? (max 200 karakter)

10.10.4.3 Moderasyon Aksiyonlar?
Admin a?a??daki i?lemleri yapabilir:
?? 1. Konu?may? “Temiz” olarak i?aretle
Durum ? Closed
Flag kalkar ama log saklan?r.
?? 2. Kullan?c?y? Uyar
* Uzman veya kullan?c?ya uyar? notu
Not türleri:
* Mesajla?ma kurallar?n? hat?rlatma
* Spam davran??? uyar?s?
* Uygunsuz davran?? uyar?s?
?? 3. Konu?may? Dondurma
* Her iki taraf da o konu?mada mesaj gönderemez
* Yeni konu?ma açamazlar (opsiyonel)
?? 4. Kullan?c?y? Pasife Alma
(Kritik durumlarda)
* Uzman ? listelerde görünmez, yeni seans alamaz
* Dan??an ? mesajla?amaz, seans olu?turamaz
?? 5. ?ikayeti ?ikayet Yönetimi Modülüne Yönlendirme
(10.4 ile entegre)

10.10.5 Kullan?c? Ak??lar?
10.10.5.1 User Report Ak???
1. Dan??an “Bu mesajla?may? bildir” seçer
2. Flag olu?turulur (konu?ma ID + user ID)
3. Admin panelde görüntülenir
4. Admin inceler ? aksiyon al?r
5. Dan??an bilgilendirilir

10.10.5.2 Flood / Spam Ak???
1. Sistem: 1 dakika içinde 10’dan fazla mesaj ? flag
2. Konu?ma flagged list’de görünür
3. Admin meta veriyi inceler
4. Gerekirse kullan?c? uyar?l?r

10.10.5.3 Moderasyon Karar Ak???
1. Admin ? flagged list
2. Detay
3. Aksiyon seçimi
4. Log kayd?
5. Konu?ma durumu güncellenir

10.10.6 ?? Kurallar?
* Admin hiçbir zaman mesaj içeri?ini göremez
* Flag kalksa bile kay?t 1 y?l tutulur
* Ayn? kullan?c? 3 flag al?rsa otomatik “riskli kullan?c?” i?aretlemesi yap?labilir
* Mesajla?ma tamamen kapat?lamaz (uzman-client ileti?im zorunlu)
* Pasife al?nan kullan?c?, dondurulan konu?mada mesaj atamaz
* Flood tespit kurallar? config ekran?ndan yönetilebilir (10.8)

10.10.7 Edge Case’ler
* Konu?ma bulunamad? ? “Bu konu?ma ID geçersiz”
* Çok eski konu?ma ? “Bu konu?ma ar?ivlenmi?”
* Flag nedeni belirtilmemi? ? “Sistem uyar?s? – detay yok”
* Kullan?c? pasif ? “Bu kullan?c? mesaj gönderemez”
* Ayn? flag birden fazla kez geldi ? sistem birle?tirir

10.10.8 Non-Fonksiyonel Gereksinimler
* Flag listesi < 200 ms’de yüklenmeli
* Meta datalar < 300 ms’de gelmeli
* Grafikler responsive olmal?
* Tüm moderasyon aksiyonlar? audit log’da saklanmal?
* Sistem yüksek trafik alt?nda bile flood detection yapabilmeli
