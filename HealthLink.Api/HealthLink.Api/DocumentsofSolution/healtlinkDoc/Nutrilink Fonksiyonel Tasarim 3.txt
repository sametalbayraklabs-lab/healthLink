?? 10.1 Admin Dashboard – FDD Tasla??
10.1.1 Amaç
Admin Dashboard, sistem yöneticisinin:
* Platformdaki genel durumu tek bak??ta görmesini,
* Kritik bekleyen i?leri (uzman onay?, yorum onay?, ?ikayetler, ödemeler) takip etmesini,
* Kullan?c? say?lar?, seans say?lar? gibi temel metrikleri izlemesini
sa?layan merkez kontrol panelidir.
10.1.2 Roller
* Admin ? Tam eri?im
* Di?er roller (Client, Expert) ? bu modüle eri?emez
10.1.3 Ekran Bile?enleri
Dashboard 4 ana bloktan olu?sun:
1. Özet Kartlar (Top Stats)
2. Kritik Bekleyen ??ler (Queues)
3. Son Aktiviteler (Recent Activity)
4. H?zl? Eri?im Butonlar? (Quick Actions)
10.1.3.1 Özet Kartlar
Üstte 4 tane küçük kart:
1. Toplam Dan??an Say?s?
2. Toplam Uzman Say?s? (ve/veya bekleyen uzman say?s?)
3. Bu Ayki Toplam Seans Say?s?
4. Bu Ayki Toplam Ciro (iyzico üzerinden gelen brüt tutar, ileride)
?leride:
* Aktif kullan?c? say?s? (son 30 günde login olanlar) vs. eklenebilir.
10.1.3.2 Kritik Bekleyen ??ler (Queues)
3 ana “queue” alan?:
1. Bekleyen Uzman Onaylar?
o Say?: Örn. “Bekleyen: 7”
o Liste önizlemesi:
* ?sim
* Ba?vuru tarihi
* “?ncele” linki
2. Bekleyen Yorum & De?erlendirme Onaylar?
o Say?: Örn. “Bekleyen: 12”
o Son 3 yorumdan k?sa özet
o “Tümünü Gör” linki
3. Aç?k ?ikayetler
o Say?: Örn. “Aç?k: 3”
o Son 3 ?ikayet
o Öncelik etiketi (Normal / Yüksek)
o “?ikayet Yönetimine Git” linki
10.1.3.3 Son Aktiviteler (Recent Activity)
Basit bir log listesi:
Her sat?rda:
* Zaman
* Kullan?c? (maskeli isim olabilir)
* Olay tipi:
o Yeni kay?t
o Yeni seans
o Uzman onay?
o Ödeme i?aretlendi
o ?ikayet aç?ld? / kapand?
Amaç: Sistemin canl?l???n? görmek.
10.1.3.4 H?zl? Eri?im (Quick Actions)
Butonlar:
* Uzman Onay Paneli (10.3’e gider)
* Yorum Onay Paneli (10.5’e gider)
* ?ikayet Yönetimi (10.6’ya gider)
* Ödemeler & Kazanç Yönetimi (10.8’e gider)
MVP için 3–4 buton yeterli.
10.1.4 Kullan?c? Ak??lar?
10.1.4.1 Dashboard Yükleme
1. Admin giri? yapar.
2. /admin/dashboard endpoint’i ça?r?l?r.
3. Tek response içinde:
o Özet istatistikler
o Bekleyen onay say?lar?
o Son aktiviteler (son 10 kay?t)
o Queue’lar?n say?lar?
gelir.
10.1.4.2 Bekleyen Uzman Onay?’na Gitme
1. Admin dashboard’da “Bekleyen Uzman Onay?” alan?na t?klar.
2. Sistem 10.3 Uzman Onay & Yönetimi ekran?na filtrelenmi? ?ekilde gider (status=pending).
10.1.4.3 Yorum & De?erlendirme Onay?’na Gitme
1. Admin dashboard’da “Bekleyen Yorumlar” alan?na t?klar.
2. Sistem 10.5 Yorum & De?erlendirme Onay? ekran?na gider.
10.1.5 ?? Kurallar?
* Dashboard yaln?zca admin rolü için aç?l?r.
* Tüm istatistikler read-only’dir, buradan direkt veri de?i?mez.
* Özet kartlardaki veriler:
o Gün içinde cache’li (örn. 5 dk) olabilir.
* Son aktiviteler en fazla X kay?t gösterir (örn. 20).
* Kritik bekleyen i?ler, ilgili modüllerle tutarl? olmal?d?r (tek kaynak: backend).
10.1.6 Edge Case’ler
* Hiç bekleyen uzman yok ? “Bekleyen ba?vuru bulunmamaktad?r.”
* Hiç bekleyen yorum yok ? o kutu “0” gösterir ama alan yine de görünür.
* Son aktivite yok ? “Son 24 saatte aktivite kayd? bulunmamaktad?r.”
* Backend k?smi hata verirse:
o Özet kartlar gelmese: “?statistikler ?u anda yüklenemiyor.”
o Queues gelmese: “Bekleyen i? listeleri ?u anda gösterilemiyor.”
10.1.7 Non-Fonksiyonel Gereksinimler
* Dashboard < 300 ms içinde yüklenmeli (mümkünse cache).
* Tek API ça?r?s? ile veriler gelmeli (GET /admin/dashboard).
* Mobilde bloklar alt alta, desktop’ta grid olarak gösterilmeli.
* Tüm görüntülemeler audit log’a “admin viewed dashboard” gibi yaz?labilir (opsiyonel).
10.2 Admin – Kullan?c? Yönetimi (User Management)
10.2.1 Amaç
Admin’in platformdaki tüm kullan?c?lar? (User, Client, Expert) merkezi bir ekrandan yönetmesini sa?lar.
10.2.2 Roller
* Admin ? Tam eri?im
* Uzman ? Eri?emez
* Client ? Eri?emez
10.2.3 Kapsam
Bu modül, üç kullan?c? tipinin ortak yönetimini sa?lar:
1. User ? Sisteme giri? yapan herkes
2. Client ? Hizmet alan kullan?c?
3. Expert ? Hizmet veren uzman
Her User ? 0 veya 1 Client, 0 veya 1 Expert olabilir.
10.2.4 Ekran Bile?enleri
10.2.4.1 Kullan?c? Listesi
Her sat?r:
* Ad Soyad
* E?posta
* Roller (Client / Expert / Admin)
* Hesap Durumu (Active / Passive / Pending)
* Son giri? tarihi
* “Detay” butonu
10.2.4.2 Arama & Filtreleme
Arama:
* ?sim
* E?posta
Filtreler:
* Rol: Client / Expert / Admin
* Durum: Active / Passive / Pending
* Son giri?: Bugün / Bu hafta / Son 30 gün
* Hesap tipi (User / User + Client / User + Expert)
10.2.4.3 Kullan?c? Detay Kart?
Üst bilgiler:
* Ad, soyad
* Rol bilgileri
* E?posta
* Telefon (maskeli)
* Hesap durumu
Alt bilgiler:
1. Hesap Yönetimi: Aktifle?tir / Pasifle?tir / Engelle
2. Güvenlik: ?ifre s?f?rlama linki gönder
3. Aktivite geçmi?i: Son giri?, toplam login
4. Client bilgileri (varsa): paketler, seanslar
5. Expert bilgileri (varsa): onboarding durumu, kazanç özeti, puan
10.2.5 Kullan?c? Ak??lar?
10.2.5.1 Kullan?c? Arama Ak???
1. Admin listeye girer
2. Arama yapar
3. Sonuç listelenir
4. Detay aç?l?r
10.2.5.2 Kullan?c?y? Pasife Alma
1. “Pasifle?tir” butonu
2. Kullan?c? tüm modüllere eri?emez
3. Audit log kayd? olu?ur
10.2.5.3 ?ifre S?f?rlama
1. “?ifre s?f?rlama linki gönder”
2. Kullan?c?ya e?posta gider
10.2.5.4 Expert Yönetimi
Detay kart?nda onboarding durumu ve belgeler gösterilir.
10.2.6 ?? Kurallar?
* Admin kendini pasif yapamaz
* Bir admin di?er admini silemez (sadece super admin)
* Pasif kullan?c? hiçbir modüle giremez
* Expert pasif ? profil listelerde görünmez
* Client pasif ? seans olu?turamaz
* Kullan?c? tamamen silinmez (KVKK), sadece pasif yap?l?r
10.2.7 Edge Case’ler
* E?posta do?rulanmam?? ? “Do?rulanmam?? hesap”
* Pasif kullan?c? + aktif seans? varsa ? pasife al?namaz
* Expert pending ? detaydan onboarding inceleme ekran?na yönlendirme
10.2.8 Non?Fonksiyonel Gereksinimler
* Liste <200ms yüklenmeli
* Büyük dataset için server?side pagination
* Tüm de?i?iklikler audit log’a yaz?lmal?
* Mobil uyumlu detay ekran?
10.3 Uzman Onay & Yönetimi – FDD Tasla??
10.3.1 Amaç
Bu modül, adminin platforma ba?vuran uzmanleri incelemesini, belgeleri do?rulamas?n?, ba?vuruyu onaylamas?n? veya reddetmesini sa?lar. Ayr?ca onayl? uzmanlerin durum yönetimi (aktif/pasif) de bu panelden yap?l?r.
10.3.2 Roller
* Admin ? Tam yetki, onay/ret/inceleme.
* Uzman Aday? ? Kendi ba?vuru durumunu görebilir (bu paneli görmez).
* Client ? Eri?emez.
10.3.3 Ekran Bile?enleri
Modül üç ana ekrandan olu?ur:
1. Ba?vuru Listesi (Pending Experts)
2. Uzman Detay ?nceleme Ekran?
3. Onaylanm?? Uzman Yönetimi
10.3.3.1 Ba?vuru Listesi
Liste format?:
* Ad Soyad
* E?posta
* Ba?vuru tarihi
* Uzmanl?k alanlar?n?n k?sa özeti
* Durum: Pending
* “?ncele” butonu
Filtreler:
* Ba?vuru durumu: Pending / Rejected / Approved
* Tarih aral???
* Uzmanl?k alan?
* Çal??ma ?ekli (Online / Yüzyüze / Her ikisi)
Arama:
* ?sim
* E?posta
* Üniversite ad? (opsiyon)
10.3.3.2 Uzman Detay ?nceleme Ekran?
Admin “?ncele”ye bast???nda aç?l?r.
Üst Bilgi
* Ad Soyad
* Foto?raf (varsa)
* E?posta
* Telefon (maskeli)
* ?ehir / ?lçe
* Ba?vuru tarihi
Mesleki Bilgiler
* Unvan (Uzman / Uzm. Uzman)
* Üniversite
* Mezuniyet y?l?
* Deneyim y?l?
* Uzmanl?k alanlar?
Belgeler
* Diploma (indir butonu)
* Ruhsat / oda belgesi
* Sertifikalar
* Dosya tipleri: PDF/JPG/PNG
* “Görüntüle” butonu ile modal aç?l?r
Sözle?me & KVKK Onaylar?
* Onay tarihi
* IP adresi
* Log ID
Admin Not Alan?
* “Ba?vuruya dair notlar” alan? (internal, uzman görmez)
Aksiyon Butonlar?
* Onayla (Approve)
* Reddet (Reject)
o Reddetme sebebi yaz?lmas? zorunlu
* Ba?vuruyu ?ade Et (Düzeltme ?ste) ? Opsiyon Faz 2
10.3.3.3 Onaylanm?? Uzman Yönetimi
Liste format?:
* Ad Soyad
* E?posta
* Puan ortalamas?
* Toplam seans say?s?
* Durum: Active / Passive
* “Detay” butonu
Aksiyonlar:
* Pasifle?tir ? Uzman platformda görünmez, yeni seans alamaz.
* Aktifle?tir ? Pasif durumu kald?r?l?r.
* Admin notu ekleme (internal)
* Belgeleri yeniden isteme (opsiyon)
10.3.4 Kullan?c? Ak??lar?
10.3.4.1 Ba?vuru ?nceleme Ak???
1. Admin “Uzman Onaylar?” menüsüne girer.
2. Pending listesi görünür.
3. Bir ba?vuru seçilir ? “?ncele”
4. Belgeler görüntülenir.
5. Admin karar verir:
o Onayla: Expert.Status = Approved
o Reddet: Expert.Status = Rejected + admin notu zorunlu
10.3.4.2 Onay Sonras? Ak??
* Uzmane “Onayland?” e?postas? gider.
* Uzman login ? art?k dashboard aç?l?r.
10.3.4.3 Ret Sonras? Ak??
* Uzmane ret nedeni e?postas? gider.
* Uzman login ? Ba?vuru Durumu ekran? “Reddedildi” gösterir.
* Uzman bilgileri güncelleyip tekrar ba?vuru yapabilir.
10.3.4.4 Pasife Alma Ak???
1. Admin onayl? uzman listesine girer.
2. “Pasifle?tir” seçilir.
3. Uzmane e?posta bildirim gider.
4. Uzman arama ve profil listelerinde görünmez.
10.3.5 ?? Kurallar?
* Diploma olmadan onay verilemez.
* Admin bir ba?vuruyu sebep girmeden reddedemez.
* Onaylanm?? uzman pasifle?tirilebilir ama silinemez.
* Pending ba?vurular en fazla 30 gün bekleyebilir (opsiyon).
* Ayn? UserId için ikinci bir uzman kayd? olu?turulamaz.
10.3.6 Edge Case’ler
* Belge aç?lm?yor ? “Belge görüntülenemedi.”
* Eksik belge ? “Bu ba?vuruda zorunlu belgeler eksik.”
* Admin pasifle?tirmek ister ? “Aktif seans? varsa pasife al?namaz.”
* Veri yüklenemedi ? “Ba?vuru bilgileri getirilemedi.”
10.3.7 Non?Fonksiyonel Gereksinimler
* Liste < 200ms yüklenmeli.
* Belgeler CDN üzerinden h?zl? aç?lmal?.
* Admin i?lemleri audit log’a yaz?lmal?.
* Mobil uyumlu olmal?.
? 10.4 ?ikayet Yönetimi – FDD Tasla?? (Admin)
10.4.1 Amaç
Bu modül, adminin:
* Dan??an ? Uzman hakk?nda yapt??? ?ikayetleri,
* Uzman ? Dan??an hakk?nda yapt??? geri bildirimleri (opsiyon),
* Sistem kaynakl? ?ikayetleri
tek panelden görüntülemesini, incelemesini ve sonuçland?rmas?n? sa?lar.
Bu sayede platformda güven, kalite ve standart hizmet sa?lan?r.
10.4.2 Roller
RolYetkiAdminTüm ?ikayetleri görüntüler, inceler, sonuçland?r?rClientYaln?zca kendi olu?turdu?u ?ikayetleri görebilir (ayr? modül, MVP d???)Uzman?ikayetleri göremez (gizlilik ve tarafs?zl?k gere?i)10.4.3 ?ikayet Kaynaklar? (Type
Bir ?ikayet olu?turulma durumu:
1. Dan??an ? Uzman için ?ikayet
o Seans s?ras?nda davran??
o Zaman?nda gelmeme
o ?leti?im problemi
o Rapor problemi
2. Dan??an ? Sistem / teknik ?ikayet
o Zoom link sorunu
o Ödeme / paket sorunu
3. Uzman ? Dan??an ?ikayeti (Opsiyon – Faz 2)
o No-show davran???
o Uygunsuz ileti?im
MVP için yaln?zca dan??an ? uzman / sistem ?ikayeti admin paneline akar.
10.4.4 Ekran Bile?enleri
Modül 3 ana ekrandan olu?ur:
1. ?ikayet Listesi
2. ?ikayet Detay Ekran?
3. ?ikayet Sonuçland?rma Ak???
10.4.4.1 ?ikayet Listesi
Tablo sütunlar?:
* ?ikayet ID
* Olu?turan: Ad Soyad (Client)
* Hedef: Uzman / Sistem
* Tarih
* Kategori
* ?ikayet Tipi
* Durum:
o Open
o In Review
o Resolved
o Rejected
* “Detay” butonu
Filtreler:
* Durum
* Kategori (Uzman / Sistem)
* ?ikayet türü
* Tarih aral???
* Uzman ad?
* Dan??an ad?
Arama:
* Ad Soyad
* ?ikayet ID
Bo? durumu:
“Hiç ?ikayet bulunmamaktad?r.”
10.4.4.2 ?ikayet Detay Ekran?
Detay ekran? üç bölümden olu?ur:
A) ?ikayet Özeti
* ID
* Olu?turan dan??an: Ad + maskeli e-posta
* Hedef uzman: Ad + ID
* ?ikayet tarihi
* Kategori (Uzman / Sistem)
* ?ikayet türü (seçmeli alan)
B) ?ikayet ?çeri?i
* Dan??an?n serbest metin aç?klamas? (max 1000 karakter)
* Varsa ekli dosya / ekran görüntüsü (opsiyon)
(Admin aç butonu ? modal)
C) ?lgili Kay?tlar
Admin’in h?zl?ca durum kontrolü yapabilmesi için:
* ?ikayete konu olan seans: tarih, saat
* Rapor (varsa)
* Mesajla?ma meta bilgileri (?ÇER?K DE??L ? sadece zaman ve mesaj say?s?)
* Uzman bilgileri:
o Ortalama puan
o Toplam seans say?s?
o Son 10 de?erlendirme (özet)
10.4.4.3 Aksiyonlar (Admin)
Bu ekranda admin ?unlar? yapabilir:
* Durumu de?i?tir:
o In Review
o Resolved
o Rejected
* Admin Notu Ekle (zorunlu alan, tüm i?lemlerde)
* Uzmani pasife alma (9.3 ile entegre)
* Dan??ana mesaj (opsiyon – MVP’de yok)
10.4.5 Kullan?c? Ak??lar?
10.4.5.1 ?ikayetin ?ncelenmesi
1. Admin ?ikayet listesine girer.
2. Detay sayfas?n? açar.
3. ?ikayeti de?erlendirir (ilgili seans, rapor, meta veriler).
4. Durum ? In Review yap?l?r.
10.4.5.2 ?ikayet Çözümü / Resolved
1. Admin çözüm notu ekler:
o Örn: “Uzmanle görü?ülerek süreç iyile?tirildi.”
2. Durum ? Resolved
3. Dan??ana otomatik bildirim gider (MVP’de email).
10.4.5.3 ?ikayet Reddetme (Rejected)
Ko?ullar:
* As?ls?z
* Yanl?? kategori
* ?lgili olmayan kay?t
* Temelsiz ?ikayet
Aksiyon:
1. Admin ret notu yazar.
2. Durum ? Rejected.
3. Dan??ana bildirim gider.
10.4.5.4 ?ikayet Yüksek Risk / Acil Durum
Senaryolar:
* Uygunsuz ileti?im
* Zararl? tavsiye
* Taciz / mobbing ?üphesi
Aksiyon:
1. Admin ?ikayeti açar.
2. Uzmani an?nda pasife alabilir
(Sistem: yeni seans olu?turulamaz, profili listelenmez)
3. ?nceleme tamamlan?nca karar verilir.
10.4.6 ?? Kurallar?
* Hiçbir ?ikayet silinemez (sadece statü de?i?ir).
* Admin notu olmadan statü de?i?ikli?i yap?lamaz.
* ?ikayet içerikleri KVKK kapsam?nda gizlidir.
* Uzman ?ikayet içeri?ini göremez.
* Ayn? seans için birden fazla ?ikayet olabilir.
* Ayn? dan??an 24 saat içinde en fazla 1 ?ikayet açabilir.
10.4.7 Edge Case’ler
* ?ikayet bulunamad? ? “Bu ID’ye ait ?ikayet yok.”
* Dosya aç?lam?yor ? “Dosya yüklenemedi.”
* ?ikayet çözülmeden uzman pasife al?nm?? ? admin bilgilendirilir.
* Sistem ?ikayeti ? otomatik olarak teknik log kontrolü önerilir.
10.4.8 Non-Fonksiyonel Gereksinimler
* Liste < 200 ms
* Detay ekran? < 300 ms
* Tüm i?lem ve durum de?i?iklikleri audit log’a yaz?l?r
* Mobil uyum zorunlu
* Dosya yüklemeleri CDN üzerinden h?zl? aç?l?r
10.5 Yorum & De?erlendirme Onay? – FDD (Admin)
10.5.1 Amaç
Bu modül, dan??anlar?n seans sonras? yapt??? de?erlendirmelerin:
* Güvenli,
* Uygun,
* KVKK’ya ayk?r? olmayan,
* Hakaret içermeyen
?ekilde platformda yay?nlanmas?n? sa?lar.
Amaç:
Uzman puanlamas?n?n adil ve güvenilir olmas?, uygunsuz içeriklerin filtrelenmesi ve platform kalitesinin korunmas?d?r.
10.5.2 Roller
RolYetkiAdminTüm yorumlar? görüntüler, onaylar, reddederUzmanKendi yorumlar?n? görebilir (salt okunur)ClientSadece kendi gönderdi?i yorumlar? görebilir10.5.3 Yorum Türleri
Bir yorum iki bile?enden olu?ur:
1. Puan (1–5 y?ld?z)
o Zorunlu
2. Yorum metni (opsiyonel)
o Max 500 karakter
o Admin taraf?ndan moderasyon gerekir
10.5.4 Ekran Bile?enleri
Modül üç ana bölümden olu?ur:
1. Yorum Listesi (Queue)
2. Yorum Detay?
3. Yorum Onay / Ret Ak???
10.5.4.1 Yorum Listesi (Queue)
Tablo sütunlar?:
* Yorum ID
* Uzman ad?
* Dan??an ad? (maskeli)
* Puan
* Tarih
* Durum:
o Pending
o Approved
o Rejected
* “?ncele” butonu
Filtreler
* Durum (Pending / Approved / Rejected)
* Puan (1–5)
* Uzman ad?
* Tarih aral???
* Anahtar kelime (metin içinde arama – opsiyon)
Bo? Durum
“Onay bekleyen yorum bulunmamaktad?r.”
10.5.4.2 Yorum Detay?
Detay ekran?nda gösterilir:
A) Yorum Bilgisi
* Puan
* Yorum metni
* Olu?turan dan??an (maskeli e-posta)
* Yorum tarihi
* Seans tarihi
B) Uzman Bilgisi
* Ad soyad
* Ortalama puan (mevcut)
* Toplam yorum say?s?
C) ?lgili Kay?tlar
* Seans özeti
* Uzmanin raporu (varsa)
* Admin notlar? (geçmi?)
10.5.4.3 Aksiyonlar (Admin)
Admin a?a??daki i?lemleri yapabilir:
1. Onayla (Approve)
o Yorum uzman profilinde görünür
o Ortalama puan hesaplamas?na dahil edilir
2. Reddet (Reject)
Gerekçeler:
o Hakaret / argo içerik
o Ki?isel bilgi payla??m?
o Reklam / spam
o Konu d??? / anlams?z metin
3. Admin Notu Ekle
o Tüm i?lemlerde zorunlu
o KVKK gere?i dan??an ve uzman görmez
10.5.5 Kullan?c? Ak??lar?
10.5.5.1 Yorum ?nceleme Ak???
1. Admin listeye girer
2. Bir yoruma t?klar
3. Detay ekran? aç?l?r
4. Admin onaylar veya reddeder
10.5.5.2 Yorum Onaylama Ak???
1. Admin “Onayla” butonuna basar
2. Sistem yorumun durumunu ? Approved yapar
3. Uzman puan? güncellenir
4. Uzmane bildirim gider (opsiyon)

10.5.5.3 Yorum Reddetme Ak???
1. Admin “Reddet” butonuna basar
2. Red sebebi girilir
3. Yorum ? Rejected
4. Dan??ana bildirim gider (opsiyon)
10.5.6 ?? Kurallar?
* Yorum admin onay? olmadan asla yay?nlanmaz
* Reddedilen yorumlar tekrar düzenlenemez (MVP)
* Yorum silinemez (KVKK gere?i), sadece statü de?i?ir
* Admin yorumu düzenleyemez (tarafs?zl?k)
* Ayn? seans için yaln?zca bir de?erlendirme yap?labilir
* 1 y?ld?z puan özel bir i?aretleme ile admin için highlight edilir (riskli de?erlendirme)
10.5.7 Edge Case’ler
* Yorum bulunamad? ? “Bu yoruma ula??lam?yor.”
* Yorum metni bo? ama puan var ? yine de onaya tabidir
* Uzman pasif ? yorum yay?nlanmaz, ar?ivde kal?r
* Admin ayn? yorumu iki kez i?leme almaya çal???r ? “Bu yorum zaten i?lenmi?.”
10.5.8 Non-Fonksiyonel Gereksinimler
* Yorum listesi < 200 ms yüklenmeli
* Detay ekran? < 300 ms
* Tüm i?lem hareketleri audit log’a yaz?lmal?
* Mobil uyum zorunlu
* Puan hesaplama servisi h?zl? çal??mal? (cache destekli)
10.6 Ödeme Da??t?m? & Kazanç Yönetimi – FDD (Admin)
10.6.1 Amaç
Bu modülün amac?:
* Uzmanlerin tamamlanan seanslardan kazand?klar? ücretleri hesaplamak,
* Platform komisyonunu kesmek,
* Ödeme dönemleri olu?turmak,
* Uzmanlere yap?lacak ödemeleri takip etmek,
* Tüm finansal süreci ?effaf ve izlenebilir hale getirmektir.
Bu modül yaln?zca Admin taraf?ndan eri?ilir.
10.6.2 Roller
RolYetkiAdminTüm ödeme kay?tlar?n?, kazançlar? ve da??t?mlar? yönetirUzmanKendi kazanç özetini sadece okuyabilir (9.x bölümünde tan?mlanacak)ClientEri?emez10.6.3 Temel Kavramlar
1. Seans Ücreti
Dan??an?n sat?n ald??? paket ücretinin seans ba??na dü?en miktar?.
Örnek:
?1000 ? 4’lü paket ? seans ba?? ?250
2. Platform Komisyonu
%20 (örnek – gerçek oran admin panelinden yönetilebilir gelecekte).
3. Uzman Geliri
Seans ücreti – platform komisyonu.
4. Ödeme Dönemi
Admin’in ödeme da??t?m? yapt??? dönem:
* Haftal?k (MVP önerilen)
* 2 haftal?k (opsiyon)
* Ayl?k (ileride)
5. Ödeme Durumu
* Pending
* Approved
* Paid
* Cancelled
10.6.4 Ekran Bile?enleri
Ödeme modülü 4 temel ekrandan olu?ur:
1. Tamamlanan Seans Kazançlar? (Transactions List)
2. Ödeme Dönemleri (Payout Periods)
3. Uzman Bazl? Kazanç Özeti
4. Payout ??lemi (Onay & Ödeme)
10.6.4.1 Tamamlanan Seans Kazançlar?
Tablo sütunlar?:
* Seans ID
* Dan??an ad? (maskeli)
* Uzman ad?
* Seans tarihi
* Paket ID
* Seans ücreti
* Platform komisyonu
* Uzman kazanc? (net)
* Ödeme durumu (Pending, Included in Payout, Paid)
Filtreler
* Uzman
* Tarih aral???
* Ödeme durumu
* Paket türü
* Tamamlanan seanslar
Bo? durum
“Tamamlanm?? seans bulunmamaktad?r.”
10.6.4.2 Ödeme Dönemleri (Payout Periods)
Admin’in ödeme turu olu?turdu?u ekran.
Liste sütunlar?:
* Dönem ID
* Tarih aral??? (örn. 1–7 May?s)
* Toplam uzman say?s?
* Toplam kazanç
* Durum:
o Pending
o Processing
o Paid
* “Detay” butonu
Aksiyonlar:
* Yeni ödeme dönemi olu?tur
* Dönem detaylar?n? görüntüle
* Ödeme i?lemini ba?lat
* PDF/Excel ç?kt? alma (opsiyon)
10.6.4.3 Uzman Bazl? Kazanç Özeti
Bir dönem seçildi?inde gösterilir.
Sütunlar:
* Uzman ad?
* Tamamlanan seans say?s?
* Brüt kazanç
* Komisyon toplam?
* Net kazanç
* Ödeme durumu: Pending / Paid
* “Ödeme Detay?” modal butonu
10.6.4.4 Payout ??lemi (Ödeme Tamamlama)
Admin, ödeme yapmak istedi?i uzmani seçer veya toplu ödeme ba?lat?r.
Aksiyonlar:
* “Ödeme Yap?ld?” olarak i?aretle
* Toplu ödeme i?aretleme
* Not ekleme (zorunlu)
* ?lgili ödeme belgelerini upload etme (opsiyon – future)
??aretleme sonras?:
* Uzmane bildirim (mail/uygulama)
* Ödeme durumu ? Paid
* Kazanç panelinde güncellenir (uzman taraf?nda)
10.6.5 Kullan?c? Ak??lar?
10.6.5.1 Seans ? Kazanç Üretimi Ak???
1. Seans tamamlan?r
2. Uzman seans raporunu gönderir (tamamland? statüsü)
3. Sistem otomatik olarak:
  seans ücreti = paket ücreti / seans say?s?
komisyon = seans ücreti * komisyon oran?
net kazanç = seans ücreti - komisyon
4. Kay?t ? Transactions tablosuna dü?er
5. Ödeme dönemi bekler
10.6.5.2 Ödeme Dönemi Olu?turma Ak???
1. Admin “Yeni Ödeme Dönemi”ne t?klar
2. Tarih aral??? seçer
3. Sistem sadece bu aral?ktaki tamamlanm?? seanslar? toplar
4. Dönem olu?turulur ? Pending durumunda
10.6.5.3 Ödeme Tamamlama Ak???
1. Admin ödeme dönemini açar
2. Uzman seçer
3. “Ödeme Yap?ld?” butonuna basar
4. Not girer
5. Durum ? Paid
6. Uzmane bilgilendirme gider
7. Audit log olu?ur
10.6.6 ?? Kurallar?
* Tamamlanmam?? seans ? kazanç yaratmaz
* ?ptal edilen seans ? kazanç yok
* Bir seans sadece 1 ödeme dönemine dahil olabilir
* Bir dönem kilitlendikten sonra de?i?tirilemez (status: Paid)
* Admin ödeme yapmadan status “Paid” yap?lamaz (manuel kontrol)
* Komisyon oran? sabittir (MVP) ? config tablosundan okunur
10.6.7 Edge Case’ler
* Ayn? seans iki kez ödeme dönemine dahil edilirse ? sistem engeller
* Uzman pasif ? ödeme yine yap?labilir (profil pasif olsa da gelir hak edi?tir)
* Paket fiyat? yanl??sa ? tüm seans ücretleri yanl?? hesaplan?r (admin uyar?s? ç?kar)
* Ödeme belgesi yüklenemedi ? “Dosya yüklenemiyor” hatas?
10.6.8 Non-Fonksiyonel Gereksinimler
* Finans ekranlar? <300 ms yüklenmeli
* Tüm finansal i?lemler audit log’a kaydedilmeli
* ?leride iyzico API entegrasyonuna uygun yap?
* Mobil uyum zorunlu
* Kazanç hesaplama i?lemleri idempotent olmal?
10.7 Audit Log Yönetimi – FDD (Admin)
10.7.1 Amaç
Audit Log modülü, sistemde gerçekle?en tüm kritik i?lemleri kay?t alt?na alarak:
* Güvenlik,
* ?effafl?k,
* ?zlenebilirlik,
* KVKK / mevzuata uygunluk
sa?lar.
Admin bu modülden tüm i?lem geçmi?ini inceleyebilir
10.7.2 Roller
RolYetkiAdminTüm audit log kay?tlar?n? görüntülerUzmanEri?emezClientEri?emez10.7.3 Kapsam
A?a??daki i?lemler zorunlu olarak loglan?r:
1. Kullan?c? Yönetimi
* Hesap pasif/aktif yapma
* ?ifre s?f?rlama linki olu?turma
* Rol de?i?ikli?i
* Kullan?c? bilgisi güncelleme
2. Uzman Onboarding
* Ba?vuru olu?turma
* Admin taraf?ndan onay/reddetme
* Belge güncellemeleri
3. Seans Yönetimi
* Randevu olu?turma
* Randevu iptali (kim iptal etti?)
* Seans raporu yükleme
4. Mesajla?ma
* Konu?ma olu?turma
* Mesaj gönderimi (içerik loglanmaz — sadece meta data)
5. Ödeme / Kazanç Yönetimi
* Ödeme dönemi olu?turma
* Uzman ödemesi i?aretleme (Paid)
6. ?ikayet / De?erlendirme Yönetimi
* ?ikayet açma / kapama
* Yorum onaylama / reddetme
7. Admin Paneli
* Admin giri?/ç?k??
* Dashboard görüntüleme (opsiyonel)
* Kritik ekranlara eri?im
10.7.4 Log Format?
Her kay?t a?a??daki alanlar? içerir:
AlanAç?klamaLog IDTekil IDUser IDi?lemi yapan ki?iRolAdmin / Client / ExpertIP AdresiIP loggingTarih – Saattimestamp (UTC)??lem Tipiörn. “USER_DEACTIVATE”Target IDi?lem yap?lan kay?t (userId / sessionId / payoutId)Aç?klama / MetaJSON format?nda detay (örn: eski de?er - yeni de?er)Meta Örne?i:
{
  "oldStatus": "Active",
  "newStatus": "Passive",
  "reason": "Policy violation"
}
10.7.5 Ekran Bile?enleri
Audit Log ekran? 3 ana bölümden olu?ur:
1. Log Listesi (Tablo)
2. Detay Görünümü (Modal)
3. Filtre / Arama Modülü

10.7.5.1 Log Listesi
Tablo sütunlar?:
* Log ID
* Kullan?c? ad? (maskeli)
* Rol
* ??lem tipi
* Tarih/saat
* IP
* “Detay” butonu
Varsay?lan s?ralama:
* En yeni log ? en üstte
10.7.5.2 Filtreleme
Filtre alanlar?:
* ??lem tipi:
o User operations
o Session operations
o Onboarding operations
o Payment operations
o Review operations
o Complaint operations
* Rol (Admin / Client / Expert)
* Kullan?c? ad? / email
* Tarih aral???
* IP adresi
* Target ID (örn: belirli bir seans veya kullan?c?)
10.7.5.3 Log Detay Modal?
Detayda gösterilir:
* ??lem tipi
* Tarih-saat
* ??lemi yapan kullan?c?
* Kullan?c? rolü
* IP adresi
* Target kay?t bilgisi
* JSON meta detaylar? (pretty printed)
* Trigger kayna?? (UI / API / Webhook)
10.7.6 Kullan?c? Ak??lar?
10.7.6.1 Log Görüntüleme Ak???
1. Admin ? Audit Log ekran?n? açar
2. Varsay?lan son 50 kay?t gösterilir
3. Filtre uygular
4. Detay modal? ile logu inceler
10.7.6.2 Belirli Kullan?c? ?çin Log Arama
1. Admin ? kullan?c? e-posta veya ID girer
2. Liste bu kullan?c?ya ait tüm operasyonlar? gösterir
10.7.6.3 Belirli ??lem Tipine Göre ?nceleme
Ör: Son 30 günde yap?lan “PAS?F ETME” i?lemleri.
10.7.7 ?? Kurallar?
* Log kay?tlar? silinemez (KVKK gere?i soft-delete bile yok)
* Yaln?zca super admin loglara export yapabilir (opsiyon)
* Mesaj içerikleri loglanmaz (sadece metadata)
* IP adresi zorunlu olarak kaydedilir
* Log kayd? gerçek zamanl? olu?mal?d?r
* Log listesi server-side pagination ile getirilir
10.7.8 Edge Case’ler
* Çok büyük dataset ? log yüklenemiyorsa: “Veri yüklenemedi, filtre daralt?n”
* Tarih aral??? çok geni? ? performans uyar?s?
* IP bulunamad? ? “unknown”
* User silinmi? ? ad maskeli “(deleted user)”
10.7.9 Non-Fonksiyonel Gereksinimle
* Listeleme < 300 ms (index’li DB)
* Tüm loglar immutable storage’da saklanmal?
* Export i?lemi async yap?lmal? (büyük dataset için)
* Mobil uyumlu görünüm
* GDPR/KVKK uyumlulu?u
10.8 Sistem Ayarlar? & Config Yönetimi – FDD
10.8.1 Amaç
Bu modül, platformun de?i?ken ve yönetilebilir tüm sistem ayarlar?n?n tek bir merkezden, admin taraf?ndan düzenlenmesini sa?lar.
Bu modül ile yönetilecek ba?l?ca alanlar:
* Platform komisyon oran?
* Seans süresi
* Randevu iptal kurallar?
* Haftal?k iptal limitleri
* Mesajla?ma ayarlar?
* Onboarding zorunlu alanlar?
* Video / dosya yükleme limitleri
* Platform genel metinleri (KVKK linki, destek e-postas?, footer bilgileri vs.)
Amaç:
Sistem davran???n?n kod de?i?ikli?i gerekmeden kontrol edilmesi.
10.8.2 Roller
RolYetkiAdmin (SuperAdmin)Tüm sistem ayarlar?n? görüntüler ve düzenlerAdmin (Standart)Baz? ayarlar? read-only görebilir (opsiyonel)Uzman / ClientEri?emez10.8.3 Kapsam
Sistem ayarlar? 6 ana kategoriye ayr?l?r:
1. Finansal Ayarlar
2. Randevu & Takvim Ayarlar?
3. Mesajla?ma Ayarlar?
4. Dosya & ?çerik Ayarlar?
5. Onboarding Ayarlar?
6. Platform Metinleri & Sabit ?çerikler
10.8.4 Ekran Bile?enleri
Admin panelinde 6 sekme olarak görünür:
10.8.4.1 Finansal Ayarlar
Bu bölüm platformun maliyet yap?s?n? belirler.
Alanlar:
* Platform komisyon oran? (%)
o Varsay?lan: %30
o Aral?k: %0–%50
* Ödeme periyodu
o Haftal?k
o Ayl?k
* Minimum ödeme limiti (Örn: 250 TL)
* Uzman ödeme gecikme süresi (Opsiyonel — örn: 7 gün sonra i?leme)
Kurallar:
* De?i?iklik tüm gelecekteki seanslara uygulan?r
* Geçmi? finansal kay?tlar de?i?mez
* Komisyon de?i?ikli?i audit log’a yaz?l?r
10.8.4.2 Randevu & Takvim Ayarlar?
Alanlar:
* Varsay?lan seans süresi:
o 20 dk / 30 dk / 40 dk / 50 dk
o MVP: 30 dk
* Dan??an iptal limiti:
o Haftal?k max iptal: varsay?lan 2
* Dan??an?n iptal süresi s?n?r?:
o 24 saat (varsay?lan)
* Uzman iptal süresi s?n?r?:
o 3 saat (varsay?lan)
* No-show i?aretleme süresi:
o Seans ba?lang?c?ndan kaç dakika sonra: varsay?lan 10 dk
Kurallar:
* Süre de?i?iklikleri slot üretme mant???n? etkiler
* Takvim ?ablonu otomatik yeniden hesaplanabilir
* Kritik ayarlar de?i?tirildi?inde tüm uzmanlere bildirim gönderilebilir
10.8.4.3 Mesajla?ma Ayarlar?
Alanlar:
* Maksimum mesaj uzunlu?u: Varsay?lan 300 karakter
* Flood limiti: saniyede max mesaj say?s? (varsay?lan 3)
* Görsel/dosya gönderimi: Aç?k / Kapal? (MVP: Kapal?)
* Sohbet geçmi?i saklama süresi:
o 6 ay / 1 y?l / s?n?rs?z (MVP: s?n?rs?z)
Kurallar:
* Admin mesaj içeriklerini göremez ? bu ayar de?i?mez
* Dosya gönderimi sadece Faz 2 için aç?labilir
10.8.4.4 Dosya & ?çerik Ayarlar?
Alanlar:
* Maksimum video boyutu (MB): Varsay?lan 50 MB
* Maksimum video süresi: 60 saniye
* Maksimum belge boyutu: 10 MB
* Desteklenen formatlar (PDF/JPG/PNG/MP4)
* Blog yaz?s? karakter s?n?r? (opsiyonel)
Kurallar:
* Bu ayarlar uzman tan?t?m videolar?n? etkiler
* Limit de?i?tirildi?inde yeni yüklemeler için geçerli olur
10.8.4.5 Onboarding Ayarlar?
Alanlar:
* Diploma zorunlu: Aç?k (kapat?lamaz – sa?l?k sektörü)
* Ruhsat zorunlu: Aç?k / Kapal?
* Zorunlu ki?isel bilgiler:
o Telefon
o ?ehir
o Uzmanl?k alan?
* Admin ba?vuru inceleme süresi notu (görüntü amaçl?)
Kurallar:
* Zorunlu alan kapat?lamayacak ?ekilde i?aretlenebilir (ör: diploma)
10.8.4.6 Platform Metinleri & Sabit ?çerikler
Alanlar:
* KVKK Metni (link veya HTML içerik)
* Kullan?m ?artlar? metni
* Sözle?me metni
* Footer alan? içerikleri:
o ?leti?im maili
o Instagram linki
o Destek politikas?
* Blog kategori ayarlar? (opsiyon)
Bu bölümde admin metinleri düzenler ? frontende an?nda yans?r.
10.8.5 Kullan?c? Ak??lar?
10.8.5.1 Ayar Görüntüleme Ak???
1. Admin ? Sistem Ayarlar?
2. Kategoriler sekme olarak görünür
3. ?lgili sekmeden ayarlar yüklenir
10.8.5.2 Ayar Güncelleme Ak???
1. Admin de?er de?i?tirilir
2. “Kaydet” butonuna bas?l?r
3. De?i?iklik audit log’a kaydedilir
4. Yeni ayarlar sistemde an?nda aktif olur
10.8.5.3 Kritik Ayar De?i?imi Ak??? (Örn: Komisyon)
1. Admin komisyon oran?n? de?i?tirir
2. Sistem popup ile uyar?r: > “Bu de?i?iklik tüm gelecek seanslar?n kazanç hesaplamas?n? etkileyecektir.”
3. Admin onaylar
4. Yeni oran sadece gelecekteki seanslar için uygulan?r
10.8.6 ?? Kurallar?
* Kritik ayarlar de?i?tirilmeden önce double-confirm popup aç?l?r
* De?i?iklikler “rollback” edilemez ? sadece yeni bir ayarla override edilir
* Finansal ayarlar yaln?zca SuperAdmin taraf?ndan de?i?tirilebilir
* Platform metinleri HTML sanitize edilerek kaydedilir
* Bu modülün her hareketi audit log’a gider
10.8.7 Edge Case’ler
* Yanl?? komisyon oran? girildi ? “Geçersiz de?er”
* Süre s?n?r? negatif ? hata bloklan?r
* Zorunlu alan kald?r?lmak istenirse ? izin verilmez
* Metin çok uzun ? “Maksimum karakteri a?t?n?z”
* ?nternet kesilirse ? ayarlar kaydedilmez, eski de?erler korunur
10.8.8 Non-Fonksiyonel Gereksinimler
* Ayarlar < 200 ms’de yüklenmeli
* De?i?iklikler < 150 ms’de kaydedilmeli
* Sadece SuperAdmin kritik ayarlara eri?ebilir
* Tüm ayarlar cache’lenebilir (config service)
* Mobil uyumlu basit UI
10.9 ?çerik Yönetimi – FDD
10.9.1 Amaç
Bu modül, platformun public bölümünde görünen tüm içeriklerin (blog yaz?lar?, beslenme yaz?lar?, fit tarifler) admin taraf?ndan kolayca yönetilmesini sa?lar.
Amaç:
* Landing page’in canl? ve güncel kalmas?
* SEO uyumlu içerik yönetimi
* Uzmanlerin yazd??? içerikleri (opsiyon) yönetmek
* Zararl?/yanl?? sa?l?k içeriklerini filtrelemek
* Public taraf? güçlendirerek kullan?c? edinimini art?rmak
10.9.2 Roller
RolYetkiAdmin?çerik olu?turur, düzenler, yay?nlar, silerUzman (Opsiyon Faz 2)?çerik olu?turur ? admin onaylarClient / Public UserSadece görüntüler10.9.3 ?çerik Türleri
1. Blog Yaz?lar?
o “Beslenme”, “Spor”, “Sa?l?kl? Ya?am” gibi kategoriler
2. Fit Tarifler
o Besin de?erleri alan? opsiyonel
3. Duyurular (Opsiyon)
o Sistem güncellemesi, kampanya, yeni özellikler
Hepsi tek bir “ContentItem” modeli üzerinden yönetilebilir (tür parametresi ile).
10.9.4 Ekran Bile?enleri
Modül 4 ana ekrandan olu?ur:
1. ?çerik Listesi
2. Yeni ?çerik Olu?turma
3. ?çerik Düzenleme
4. ?çerik De?erlendirme (Opsiyon – Uzman içerikleri)

10.9.4.1 ?çerik Listesi
Tablo sütunlar?:
* Ba?l?k
* Tür (Blog / Tarif / Duyuru)
* Kategori
* Yazar (Admin / Uzman ad? – opsiyon)
* Yay?n durumu:
o Draft (Taslak)
o Pending Approval (Uzman içerikleri için)
o Published
o Archived
* Yay?n tarihi
* Son güncelleme tarihi
* “Düzenle” butonu
* “Sil/Ar?ivle” butonu
Filtreler:
* ?çerik türü
* Yay?n durumu
* Kategori
* Yazar
* Tarih aral???
* Anahtar kelime arama
Bo? durum:
“Henüz içerik bulunmuyor. Yeni içerik olu?turabilirsiniz.”

10.9.4.2 Yeni ?çerik Olu?turma Ekran?
Alanlar:
A) Temel Bilgiler
* Ba?l?k (zorunlu)
* Alt ba?l?k (opsiyon)
* ?çerik Türü: Blog / Tarif / Duyuru
* Kategori seçimi (multi-select de?il ? single)
* ?çerik kapak görseli (image upload)
o Max 5 MB
o JPG/PNG
o Crop özelli?i opsiyon
B) ?çerik Gövdesi
Zengin metin editörü (Rich Text Editor):
* Kal?n / italik / alt? çizili
* Bullet list / numbered list
* Görsel ekleme
* Link ekleme
* HTML moduna geçi? (opsiyon)
* Mobil uyumlu düzenleme
C) Tariflere Özel Alanlar
(E?er içerik türü = Tarif ise)
* Porsiyon say?s?
* Haz?rlama süresi
* Kalori bilgisi (opsiyon)
* Malzemeler listesi
* Ad?m ad?m tarif metni
D) SEO Ayarlar?
* SEO title
* Meta description
* URL slug (otomatik olu?turulur, düzenlenebilir)
* Etiketler (tags)
E) Yay?nlama Ayarlar?
* Yay?n durumu:
o Taslak
o Hemen yay?nla
o Zamanlanm?? yay?n (opsiyon – Faz 2)
CTA Butonlar?:
* Taslak olarak kaydet
* Yay?nla
* Önizleme (preview)
10.9.4.3 ?çerik Düzenleme Ekran?
Tüm alanlar düzenlenebilir (kapak görseli dahil).
Aksiyonlar:
* Güncelle ve Yay?nla
* Tasla?a Çevir
* Ar?ivle (Silme yerine)
* Public Önizleme Aç
Ar?ivlenen içerikler:
* Public’te görünmez
* DB’den silinmez
* Admin taraf?ndan geri al?nabilir
10.9.4.4 ?çerik Onay Ak??? (Opsiyon – Faz 2)
E?er uzmanlerin içerik üretmesine izin verilirse:
1. Uzman içerik olu?turur ? Durum: Pending Approval
2. Admin liste ekran?nda “Onay Bekleyen ?çerikler” sekmesini görür
3. Her içerik için:
o Onayla (Publish)
o Reddet (Reason required)
4. Ret durumunda uzmane bildirim gider
MVP için aktif de?il, fakat altyap? tasar?m?na eklenmi?tir.

10.9.5 Kullan?c? Ak??lar?
10.9.5.1 Yeni ?çerik Olu?turma Ak???
1. Admin ? ?çerik Yönetimi ? “Yeni ?çerik”
2. Ba?l?k + içerik türü + kategori girilir
3. ?çerik yaz?l?r / resimler yüklenir
4. Kaydet:
o Taslak olarak
o Direkt yay?na alarak
10.9.5.2 ?çeri?i Yay?nlama Ak???
1. Admin taslak içeri?i açar
2. “Yay?nla” butonuna t?klar
3. ?çerik public modünde görünür
4. Landing page’de otomatik listelenir

10.9.5.3 ?çeri?i Düzenleme Ak???
1. Admin içerik listesine girer
2. “Düzenle” seçer
3. Metin, kategori, kapak görseli, SEO bilgileri güncellenir
4. “Güncelle” ? içerik hemen güncellenir

10.9.5.4 ?çeri?i Ar?ivleme Ak???
1. “Ar?ivle” butonu seçilir
2. Public’ten kald?r?l?r
3. ?çerik silinmez ? geri al?nabilir
10.9.6 ?? Kurallar?
* Ba?l?k benzersiz olmal?d?r (slug çak??mas? olmamas? için)
* Kapak görseli yüklenmeden içerik yay?nlanamaz
* Zorunlu alanlar:
o Ba?l?k
o ?çerik türü
o ?çerik gövdesi
* Tariflerde “malzemeler” ve “haz?rlan??” doldurulmal?
* Yay?nlanan içerik public API’den görünür olmal?d?r
* SEO slug otomatik güncellenmez (yay?ndan sonra sabit kal?r)
* Admin olmayan kimse içerik düzenleyemez (Faz 2 hariç)
10.9.7 Edge Case’ler
* Resim yüklenmedi ? “Kapak görseli zorunludur”
* Çok uzun ba?l?k ? “Maksimum karakter limitini a?t?n?z”
* HTML modunda hatal? tag ? sanitize edilir
* Yay?nlanm?? içerik silinmeye çal???l?r ? “Silme yerine ar?ivleme önerilir”
* Slug çak??mas? ? sistem otomatik -2 ekler
10.9.8 Non-Fonksiyonel Gereksinimler
* Rich text editor h?zl? çal??mal? (<150 ms render)
* ?çerik sayfas? 1 MB alt?nda olmal?
* Resimler otomatik optimize edilmeli (CDN + webp)
* Public API cache kullan?lmal? (SEO için h?zl? yüklenme)
* Mobil uyumlu admin paneli
