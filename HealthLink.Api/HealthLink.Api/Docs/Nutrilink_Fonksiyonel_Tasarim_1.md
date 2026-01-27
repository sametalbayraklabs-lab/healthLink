NutriLink – Fonksiyonel Tasar?m Doküman? (MVP)
Bu doküman NutriLink platformunun i?levsel gereksinimlerini, kullan?c? ak??lar?n? ve örnek ekran taslaklar?n? (wireframe) içerir. Bu sürüm MVP kapsam?n? tan?mlar.

1. Ürün Tan?m?
NutriLink; dan??an ve uzmanleri tek bir platformda bulu?turan, paket bazl? çal??an, online seans yönetimi, mesajla?ma, de?erlendirme ve ödeme altyap?s?na sahip bir SaaS sistemidir.
Amaç:
* Dan??an?n uzman bulmas?n? ve görü?me sürecini kolayla?t?rmak
* Uzmane düzenli mü?teri ak??? sa?lamak
* Platform üzerinden güvenli ödeme ve yönetim sa?lamak

2. Kullan?c? Tipleri
1. Dan??an (Patient)
2. Uzman (Expert)
3. Admin
4. Üyeliksiz kullan?c? (Public visitor)

3. Ana Kullan?c? Ak??lar? (Özet)
Dan??an Ak???:
1. Kay?t / Giri?
2. Paket sat?n alma
3. Uzman listeleme ? profil görüntüleme
4. Randevu olu?turma
5. Zoom görü?mesi
6. Seans sonras? de?erlendirme
7. Mesajla?ma / rapor takibi
Uzman Ak???:
1. Ba?vuru / belge yükleme
2. Admin onay?
3. Profil düzenleme
4. Takvim yönetimi
5. Seans tamamlama + rapor
6. Kazanç görme
Admin Ak???:
1. Uzman onay?
2. Yorum & de?erlendirme onay?
3. Ödeme da??t?m?
4. ?ikayet yönetimi
5. Kullan?c? yönetimi

4. Ekranlar ve Wireframe Taslaklar?
A?a??daki wireframe’ler örnek niteli?indedir.

4.1 Landing Page (Public)
 ------------------------------------------------------
 | NutriLink Logo         [Giri?] [Kay?t Ol]          |
 ------------------------------------------------------
 |     "Uzmanini Bul, Paketini Kullan"           |
 |  [Uzman Ara]   [Paketleri Gör]                |
 ------------------------------------------------------
 |  Üst Düzey Uzmanler                           |
 |  [Kart] [Kart] [Kart]                              |
 ------------------------------------------------------

4.2 Dan??an Dashboard
 ------------------------------------------------------
 | Kalan Seans: 7 / 10      Yakla?an Seans: Yar?n 20:30|
 ------------------------------------------------------
 | [Uzman Bul] [Randevu Olu?tur] [Mesajlar]       |
 ------------------------------------------------------
 | Son Seans Notlar?                                    |
 | - Tarih: ...                                         |
 | - Uzman: ...                                    |
 ------------------------------------------------------

4.3 Uzman Listeleme
 ------------------------------------------------------
 | Filtreler: Uzmanl?k | Puan | Fiyat | Çal??ma Saatleri |
 ------------------------------------------------------
 | Kart 1: Dyt. Elif K – ?4.9 – 230 seans                |
 | Kart 2: Dyt. Mert A – ?4.8 – 120 seans                |
 | Kart 3: ...                                           |
 ------------------------------------------------------

4.4 Uzman Profil
 ------------------------------------------------------
 | Foto | Ad Soyad | ?4.9   | 200+ Seans               |
 | Uzmanl?klar: Kilo verme, Sporcu bes.                 |
 | Hakk?nda: ...                                        |
 ------------------------------------------------------
 | [Randevu Al]                                         |
 ------------------------------------------------------

4.5 Seans Randevusu Olu?turma
 ------------------------------------------------------
 | Takvim görünümü                                      |
 | [Saat seç] ? 20:30                                   |
 ------------------------------------------------------
 | [Onayla]                                             |
 ------------------------------------------------------

4.6 Seanslar?m (Dan??an)
 ------------------------------------------------------
 | Yakla?an Seans: 20:30                                |
 | Zoom Linki: [Join Meeting]                           |
 ------------------------------------------------------
 | Geçmi? Seanslar                                      |
 | - Tarih, Uzman, Rapor                           |
 ------------------------------------------------------

4.7 Mesajla?ma
 ------------------------------------------------------
 | Uzman: Dyt. Elif K                              |
 ------------------------------------------------------
 | Dan??an: Merhaba hocam...                           |
 | Uzman: Merhaba, bugün...                       |
 ------------------------------------------------------
 | [Mesaj yaz...] [Gönder]                              |
 ------------------------------------------------------

4.8 Uzman Dashboard
 ------------------------------------------------------
 | Bugünkü Seanslar: 3                                  |
 | Bekleyen Rapor: 1                                    |
 | Bu Ay Kazanç: 4,250 TL                               |
 ------------------------------------------------------
 | [Takvim] [Dan??anlar] [Profilim] [Kazanç]            |
 ------------------------------------------------------

4.9 Admin Paneli – Uzman Onay?
 ------------------------------------------------------
 | Ba?vuranlar:                                         |
 | 1) Dyt. Elif – Belgeler: [Görüntüle] [Onayla]        |
 | 2) Dyt. Mert – Belgeler: [Görüntüle] [Reddet]        |
 ------------------------------------------------------

4.10 Admin Paneli – Yorum & De?erlendirme
 ------------------------------------------------------
 | Bekleyen Yorumlar:                                   |
 | "Uzman çok ilgiliydi..." [Onayla] [Sil]        |
 ------------------------------------------------------

5. Fonksiyonel Gereksinimler (Özet)
Dan??an
* Kay?t, giri?, profil yönetimi
* Paket sat?n alma (iyzico)
* Uzman arama & filtreleme
* Seans olu?turma, görüntüleme, iptal
* Zoom linkine eri?im
* Mesajla?ma
* Seans sonras? de?erlendirme
Uzman
* Ba?vuru ve belge yükleme
* Takvim yönetimi
* Seans tamamlama ve raporlama
* Mesajla?ma
* Kazanç görüntüleme
Admin
* Uzman onay?
* Yorum & de?erlendirme yönetimi
* ?ikayet yönetimi
* Ödeme da??t?m?
* Kullan?c? yönetimi
* Audit log yönetimi

6. MVP Kapsam?
* Tüm dan??an ak??? (kay?t ? seans ? de?erlendirme)
* Uzman ba?vuru & onay ak???
* Ödeme sistemi (iyzico)
* Zoom meeting entegrasyonu
* Mesajla?ma (basit versiyon)
* Admin kontrol paneli (temel modüller)

7. Public Modül – FDD Özeti (Landing & Üyeliksiz Ekranlar)
7.1 Kapsam
Public modül; üye olmadan eri?ilen tan?t?m ve bilgi ekranlar?n? kapsar:
* Landing Page
* Paketler sayfas? (bilgilendirme)
* Public uzman listesi (k?s?tl? görünüm)
* Hakk?m?zda / KVKK / Kullan?m ?artlar?
* ?leti?im
* Giri? / Kay?t sayfas?na yönlendirmeler
7.2 Roller
* Üyeliksiz ziyaretçi (anonymous user)
7.3 Ekranlar
1. Landing Page
o Ürün tan?m?, faydalar
o Beslenme ile ilgili çe?itli yaz?lar (blog format?nda – public eri?ilebilir)
o Fit tarifler (public eri?ilebilir)
o Ça?r? butonlar?: “Dan??an olarak ba?la”, “Uzman olarak kat?l”
o Öne ç?kan uzmanler (sadece isim, uzmanl?k, puan – detay için login yönlendirmesi)
o Footer veya KVKK bölümünde “Uzman olarak kat?l” linki
2. Paketler (Public)
o Tekli / 4’lü / 10’lu paketlerin ad?, seans say?s?, fiyat bilgisi
o “Giri? yap” veya “Kay?t ol” butonlar? (sat?n alma için login zorunlu)
3. Public Uzman Listesi (Özet)
o Sadece s?n?rl? bilgi: isim, uzmanl?k, ?ehir (opsiyonel), ortalama puan
o Detayl? profil ve randevu al butonu t?kland???nda ? login/kay?t ekran?na yönlendirme
4. Hakk?m?zda / KVKK / Kullan?m ?artlar?
o Statik içerik sayfalar?
5. ?leti?im
o Form veya sadece e-posta adresi / sosyal medya linkleri
6. Giri? / Kay?t Yönlendirmeleri
o Header ve CTA butonlar? ile login/register yönlendirmeleri
7.4 Ana ?? Kurallar?
* Paket sat?n alma public ekrandan ba?lat?lsa bile “Öde” ad?m?nda login/kay?t zorunludur.
* Public uzman listesinden randevu al?namaz; sadece bilgi verilir ve login’e yönlendirilir.
* Public modülde hiçbir ki?isel veri i?lenmez (sadece opsiyonel ileti?im formu hariç).
7.5 Non-Fonksiyonel Notlar
* Landing ve public sayfalar SEO dostu olmal?d?r (Next.js SSR/SSG).
* Yüksek h?z ve mobil uyumluluk önceliklidir.
* Public modülde gösterilen istatistikler (toplam seans, toplam uzman vb.) cache üzerinden okunabilir.

8. Dan??an Modülü – Detayl? FDD (Devam?nda Doldurulacak)
A?a??daki ba?l?klar modülün tüm ekranlar?n? temsil eder ve zaman içinde detayland?r?lacakt?r.
8.1 Dashboard
Bu bölümde Dan??an (Patient) taraf?ndaki ekranlar ve i? kurallar? detayland?r?lacakt?r:
* Dashboard
* Paket sat?n alma
* Uzman listeleme & profil
* Randevu olu?turma
* Seanslar?m
* Mesajla?ma
* Seans sonras? de?erlendirme
* Profil & ayarlar
8.1 Dashboard
8.1.1 Amaç**
Dashboard, dan??an?n sisteme giri? yapt?ktan sonra tüm sürecini tek ekranda yönetmesini sa?layan kontrol panelidir.
Bu ekran: paket durumu, seans takvimi, favoriler, geçmi? seanslar, diyet listeleri, bildirimler ve h?zl? i?lem butonlar?n? içerir.

8.1.2 Roller**
* Dan??an (Patient) ? eri?ebilir
* Üyeliksiz kullan?c? ? eri?emez

8.1.3 Ekran Bile?enleri**

8.1.3.$1 Üst Navigasyon**
* Ana Sayfa
* Seanslar
* Ke?fet
* Uzmanler
* Profilim | Ayarlar | Ç?k??
Not: Bu sayfada “Giri? yap / Kaydol” ASLA görünmez.

8.1.3.$1 Aktif Paket Bilgisi (Sol Üst Kart)**
Gösterilen bilgiler:
* Paket ad?
* Toplam / kullan?lan / kalan seans
* Paket türü
* Paket ID
Durumlar:
* Paket varsa ? tüm bilgiler dolu
* Paket yoksa ? “Aktif paketiniz bulunmamaktad?r.” + Paket Sat?n Al
?? kural?:
* Kalan seans 0 ? randevu olu?turma popup ile engellenir

8.1.3.$1 Mini Seans Takvimi (Sa? Üst Kart)**
Gösterilen:
* Ayl?k takvim görünümü
* Seans olan günlerde ?
* Gün seçildi?inde modal:
o Günün seans listesi
o “Seansa git” (15 dk kala aktif)
o “Seans detay?n? görüntüle”
* Alt sat?r: En yak?n seans bilgisi
?? kurallar?:
* Zoom linki yeni sekmede aç?l?r
* Takvim mobilde tek sütuna dü?er
* Bir günde birden çok seans varsa modal’da listelenir

8.1.3.$1 H?zl? ??lemler (Orta Bölüm)**
3 buton:
* Randevu Olu?tur
* Uzman Bul
* Mesajlar
?? kurallar?:
* Randevu olu?tur butonu ? kalan seans 0 ise popup:
“Randevu olu?turmak için aktif seans?n?z bulunmamaktad?r.” + Paket Sat?n Al

8.1.3.$1 Favori Uzmanler (Orta–Alt Sol)**
Gösterilen:
* Foto?raf
* Ad–soyad
* Uzmanl?k
* Puan
* Profil linki
Bo? durum:
* “Henüz favori uzman eklemediniz.” + Uzmanleri ke?fet

8.1.3.$1 Geçmi? Seanslar?m (Orta–Alt Sa?)**
Gösterilen:
* Son 5 seans
* Tarih
* Uzman ad?
* Seans durumu
* “Rapor görüntüle”
Bo? durum:
* “Henüz hiç seans olu?turmad?n?z.” + Hemen randevu olu?tur

8.1.3.$1 Diyet Listelerim (Alt Sol)**
Gösterilen:
* Aktif liste (varsa)
* Geçmi? listeler
* Olu?turulma tarihleri
* “Görüntüle” linki
Bo? durum:
* “Diyet listeniz bulunmamaktad?r.”
Not: Dan??an diyet yükleyemez.

8.1.3.$1 Bildirimler (Alt Sa?)**
Gösterilen:
* Paket sat?n alma bildirimi
* Yakla?an seans hat?rlatmas?
* Yeni mesaj
* Sistem bildirimleri
Bo? durum:
* “Henüz bildiriminiz bulunmamaktad?r.”

8.1.4 Kullan?c? Ak??lar?**

8.1.4.$1 Dashboard Yükleme Ak???**
Backend tek endpoint ile döner:
* Aktif paket
* Ayl?k takvim
* En yak?n seans
* Favoriler
* Geçmi? seanslar
* Diyet listeleri
* Bildirimler
Bu, dashboard’un tek API ça?r?s?yla aç?lmas?n? sa?lar.

8.1.4.$1 Takvim Etkile?imi Ak???**
1. Kullan?c? takvimde bir gün seçer
2. Günün seanslar? modal’da listelenir
3. Seansa git (15 dk kala aktif)
4. Geçmi? seanslarda ? “Rapor görüntüle”

8.1.4.$1 Randevu Olu?turma Ak???**
* Kalan seans > 0 ? randevu planlama ekran?
* Kalan seans = 0 ? popup + Paket sat?n al CTA

8.1.5 Edge Case’ler’ler**

8.1.5.$1 Yeni Kullan?c? Ak???**
* Aktif paket yok ? “Paket sat?n al” CTA
* Favori yok ? “Uzmanleri ke?fet” CTA
* Geçmi? seans yok ? “Hemen randevu olu?tur” CTA
* Diyet listesi yok ? sade mesaj
* Bildirim yok ? sade mesaj

8.1.5.$1 Takvimde Seans Yok**
* Takvim bo? gösterilir
* Aç?klama metni ç?kar

8.1.6 Non-Fonksiyonel Gereksinimler**
* Dashboard 300ms alt?nda yüklenmeli
* Mobil uyum zorunlu
* Grid yap?s? responsive olmal?
* Takvim mobilde tek sütuna inmeli
* Tüm veriler tek API endpoint’inden al?nmal?

8.2 Paket Sat?n Alma**
8.2.1 Amaç
Dan??an?n platform üzerinden güvenli ?ekilde paket sat?n almas?n? sa?lamak. ??lem iyzico ile yap?l?r. Paketler: Tekli, 4’lü, 10’lu (MVP). Sat?n alma sonucu paket otomatik olarak hesaba tan?mlan?r.

8.2.2 Roller
* Dan??an (Patient) ? sat?n alabilir
* Üyeliksiz kullan?c? ? sat?n alma ba?latabilir ancak ödeme ad?m?nda login zorunludur

8.2.3 Ekran Bile?enleri
8.2.3.1 Paket Seçimi Ekran?
Gösterilen paketler:
* Paket ad? (“Tek Seans”, “4’lü Paket”, “10’lu Paket”)
* Fiyat
* Seans say?s?
* Aç?klama
* CTA: Sat?n Al (Call To Action – kullan?c?y? aksiyona yönlendiren buton)
?? kurallar?:
* Paketlere t?klay?nca ? “Önizleme / Ödeme Ad?m?na Geç” ekran? aç?l?r.

8.2.3.2 Paket Detay / Önizleme Ekran?
Gösterilen:
* Paket detaylar?
* Fiyat
* Vergi durumu (varsa)
* Seans geçerlilik süresi (örn. 6 ay – opsiyonel)
* ?ndirim kodu alan? (metin kutusu + “Uygula” butonu)
* Uygulanan indirim sonras? güncel fiyat gösterimi
* “Devam Et” ? ödeme ad?m?na geç

8.2.3.3 Ödeme Ekran? (iyzico iframe / redirect)
Gösterilen:
* Kart bilgileri (iyzico üzerinden)
* Kart kay?t seçene?i (iyzico default)
* “Ödeme Yap” butonu
?? kurallar?:
* Ödeme ba?ar?l? ? paket kullan?c?n?n hesab?na tan?mlan?r
* Ödeme ba?ar?s?z ? uyar? mesaj? + yeniden deneme
* Ödeme s?ras?nda kullan?c? sistemi terk ederse ? paket tan?mlanmaz

8.2.3.4 Sat?n Alma Sonuç Ekran?
Gösterilen:
* “Sat?n alma ba?ar?l?” bildirimi
* Tan?mlanan seans say?s?
* CTA:
o Randevu Olu?tur
o Dashboard’a Dön

8.2.4 Kullan?c? Ak??lar?
8.2.4.1 Paket Sat?n Alma Ak???
1. Dan??an “Paketler” sayfas?na girer
2. Paket seçer ? “Önizleme” ekran?na geçer
3. (Opsiyonel) Kullan?c? indirim kodu girer ? “Uygula” butonuna basar
o Sistem kodu do?rular (geçerlilik tarihi, kullan?m say?s?, ilgili paket vb.)
o Geçerli ise yeni indirimli fiyat gösterilir
o Geçersiz ise hata mesaj? gösterilir, tam fiyat korunur
4. Kullan?c? “Devam Et” ile iyzico ödeme ekran?na geçer
5. Ödeme ba?ar?l? ? backend webhook do?rular
6. Paket ? UserPackage tablosuna tan?mlan?r
7. Dashboard’da otomatik görünür

8.2.4.2 Üyeliksiz Kullan?c? Ak???
1. Paket seçilir
2. “Sat?n al” ? login/register sayfas? aç?l?r
3. Giri? sonras? kullan?c? otomatik olarak kald??? ekrana döner
4. Ödeme ? tamamlan?r

8.2.5 ?? Kurallar?
* Her sat?n alma i?lemi bir paket kayd? olu?turur.
* Her paket ? seans say?s? kadar “kullan?labilir slot” üretir.
* Kullan?c? ayn? anda birden fazla aktif paket alabilir.
* Eski paket tamamen bitmeden yeni paket al?nabilir.
* Ödeme onay? yaln?zca Webhook do?rulamas? sonras? kesinle?ir.
* Ödeme ba?ar?l? fakat webhook gecikti ? Dashboard’da “i?lem beklemede” durumu gösterilir.
* ?ndirim kodu uygulanm??sa;
o Ayn? i?lemde sadece tek indirim kodu kullan?labilir.
o ?ndirim oran? veya tutar? paket fiyat?n? 0 TL’nin alt?na dü?üremez.
o Kod belirli paket türleriyle s?n?rl? olabilir (örn. sadece 10’lu paket).

8.2.6 Edge Case’ler
* Kullan?c? ödeme s?ras?nda sayfay? kapat?r ? ba?ar?s?z i?lem ? paket olu?turulmaz
* Ödeme ba?ar?l?, webhook ba?ar?s?z ? sistem otomatik retry yapar (5 kez)
* Paket sat?n al?nd?ktan sonra iade talebi ? admin ekran?ndan manuel i?lenir (MVP d???)
* Geçersiz veya süresi dolmu? indirim kodu girilirse ? “?ndirim kodu geçersiz veya süresi dolmu?” uyar?s? gösterilir, tam fiyat korunur.
* Kullan?m limiti dolmu? indirim kodu girilirse ? “Bu indirim kodunun kullan?m hakk? dolmu?tur” uyar?s? gösterilir.
8.2.7 Non-Fonksiyonel Gereksinimler
* Ödeme ekran? iyzico güvenlik standartlar?na uygun olmal?
* Paket sat?n alma sayfas? 200ms alt?nda aç?lmal?
* Mobilde kart formu tam ekran aç?labilir
* Webhook endpoint yüksek güvenlikli olmal? (IP allowlist, signature do?rulama)
* ?ndirim kodu do?rulama servisi h?zl? yan?t vermeli (tercihen < 200ms)
8.2.7 Non-Fonksiyonel Gereksinimler
* Ödeme ekran? iyzico güvenlik standartlar?na uygun olmal?
* Paket sat?n alma sayfas? 200ms alt?nda aç?lmal?
* Mobilde kart formu tam ekran aç?labilir
* Webhook endpoint yüksek güvenlikli olmal? (IP allowlist, signature do?rulama)
(Detayland?r?lacak)
8.3 Uzman Listeleme & Filtreleme
8.3.1 Amaç
Bu ekran, dan??an?n sistemde kay?tl? uzmanleri listeleyebilmesini, filtreleyebilmesini, s?ralayabilmesini ve detayl? profil sayfas?na geçebilmesini sa?lar. Amaç, dan??an?n kendine uygun uzmani kolay ve h?zl? ?ekilde bulmas?d?r.
Not: Public (üyeliksiz) uzman listesi 7. Public Modül alt?nda tan?mlanm??t?r. 8.3, giri? yapm?? dan??an için tam fonksiyonel listeleme ekran?d?r.

8.3.2 Roller
* Dan??an (Patient) ? eri?ebilir, filtreleme/s?ralama yapar, favoriye ekler, profil sayfas?na gider.
* Üyeliksiz kullan?c? ? bu ekran?n tam versiyonuna eri?emez (yaln?zca Public listede k?s?tl? görünüm vard?r).

8.3.3 Ekran Bile?enleri
8.3.3.1 Üst Ba?l?k ve Aç?klama
* Ba?l?k: “Uzmanler”
* K?sa aç?klama: “?htiyaçlar?na en uygun uzmani bulmak için filtreleri kullanabilirsin.”

8.3.3.2 Arama Çubu?u
* Metin arama (isim veya uzmanl?k)
* Placeholder: “?sim veya uzmanl?k ara…”
?? kurallar?:
* 3 karakterden az giri?te arama tetiklenmez.
* Enter veya arama ikonuna t?klama ile tetiklenir.
* 300ms debounce önerilir.

8.3.3.3 Filtreler
MVP filtreleri:
* Uzmanl?k Alan? (multi-select)
* Seans Türü: Online / Yüz yüze / Her ikisi
* Fiyat Aral???: Min–Max
* S?ralama:
o En yüksek puan
o En çok seans yapan
o En uygun fiyat
o En yeni eklenen
?leriki Faz Notlar?:
* ?ehir
* Cinsiyet
* Deneyim y?l?

8.3.3.4 Sonuç Listesi (Kartlar)
Her kartta:
* Foto?raf
* ?sim–soyisim
* Unvan
* Uzmanl?k etiketleri
* Ortalama puan
* Toplam seans say?s?
* K?sa aç?klama
* CTA: Profili Görüntüle
* Favorilere ekle/ç?kar (ikon)
Sayfalama:
* Sayfa ba??na 10–20 sonuç
* Üstte toplam sonuç say?s? (“87 uzman bulundu”)

8.3.3.5 Bo? Durum Ekran?
* “Seçti?in kriterlere uygun uzman bulunamad?.”
* CTA: Filtreleri S?f?rla

8.3.4 Kullan?c? Ak??lar?
8.3.4.1 Ekran? Açma Ak???
1. Dan??an menüden “Uzmanler”e girer.
2. Varsay?lan filtrelerle sonuçlar yüklenir.
3. Liste, filtre ve s?ralama bile?enleri gösterilir.

8.3.4.2 Filtreleme Ak???
1. Kullan?c? filtre seçer.
2. “Filtreleri Uygula” veya otomatik tetikleme ile istek backend’e gider.
3. Yeni sonuç listesi gösterilir.
4. “Filtreleri S?f?rla” ile ba?lang?ç durumu döner.

8.3.4.3 S?ralama Ak???
1. Kullan?c? s?ralama kriteri seçer.
2. Liste yeniden yüklenir.
3. Aktif filtreler korunur.

8.3.4.4 Favorilere Ekleme Ak???
1. Favori ikonuna t?klan?r.
2. Favori de?ilse ? eklenir.
3. Favoriyse ? kald?r?l?r.
4. Dashboard’daki Favoriler alan? ile senkron çal???r.

8.3.4.5 Profil Sayfas?na Geçi?
1. Kart üzerindeki “Profili Görüntüle” seçilir.
2. Sistem 8.4 Uzman Profil Sayfas?’na yönlendirir.

8.3.5 ?? Kurallar?
* Yaln?zca aktif ve admin onayl? uzmanler listelenir.
* Pasif kullan?c?lar görünmez.
* Puan ortalamas? sadece onayl? yorumlardan hesaplan?r.
* Favori i?lemi yaln?zca giri? yapm?? dan??ana aç?kt?r.
* Listeleme API’si tüm filtre ve s?ralama parametrelerini desteklemelidir.

8.3.6 Edge Case’ler
* Hiç kay?t yoksa: “?u anda sistemde aktif uzman bulunmamaktad?r.”
* Dar filtre ? “Sonuç bulunamad?” + “Filtreleri s?f?rla” butonu.
* Backend hatas? ? “Uzmanler yüklenemedi, tekrar deneyin.”

8.3.7 Non-Fonksiyonel Gereksinimler
* ?lk sayfa < 300ms yüklenmeli.
* Mobilde tek sütun, masaüstünde 2–3 sütun.
* Aramada debounce (300ms) kullan?lmal?.
* URL parametre deste?i gelecekte eklenebilir (payla??labilir link).

(Detayland?r?lacak)
8.4 Uzman Profil Sayfas?
8.4.1 Amaç
Bu ekran, dan??an?n bir uzmani detayl? ?ekilde inceleyebilmesini sa?lar. Profil; uzmanl?k bilgileri, seans istatistikleri, de?erlendirmeler, k?sa tan?t?m videosu ve randevu alma butonlar?n? içerir. Amaç, dan??an?n do?ru uzman? seçmesini kolayla?t?rmakt?r.

8.4.2 Roller
* Dan??an (Patient) ? tam detayl? profil görüntüleyebilir.
* Üyeliksiz kullan?c? ? s?n?rl? görünüm (public versiyon).
* Uzman ? kendi profilini düzenleyebilir (görüntüleme dan??anla ayn?d?r).

8.4.3 Ekran Bile?enleri
8.4.3.1 Profil Üst Kart? (Header)
* Profil foto?raf?
* Ad Soyad
* Unvan
* Ortalama puan
* Toplam seans say?s?
* Uzmanl?k etiketleri
* Favorilere ekle/ç?kar

8.4.3.2 Tan?t?m Videosu
* Uzmanin yükledi?i k?sa video (30–60 saniye)
* Video yoksa: “Uzman henüz tan?t?m videosu eklemedi.”
Kurallar:
* Yaln?zca uzman yükleyebilir
* Max 50 MB, max 60 saniye
* mp4 (MVP)
* CDN üzerinden sunulur
* Autoplay yok, kullan?c? ba?lat?r

8.4.3.3 Hakk?nda (Bio)
* Uzmanin kendini tan?tt??? metin alan?
* E?itim bilgileri
* Uzmanl?k detaylar?
* Çal??ma biçimi
K?s?t: Max 1000 karakter (MVP)

8.4.3.4 Uzmanl?k ve Yetenek Alanlar?
* Kilo verme, sporcu beslenmesi, diyabet vb.
* Etiket format?nda gösterilir
* Onboarding ile uyumludur

8.4.3.5 Seans Bilgileri
* Seans süresi (örn. 30 dk)
* Görü?me türü (Zoom)
* Paketlerle uyumluluk

8.4.3.6 Randevu Olu?tur (Primary CTA)
* “Randevu Al” butonu
* Paket yoksa ? paket sat?n alma ekran?na yönlendirir
* Paket varsa ? 8.5 Randevu Olu?turma ekran?na gider

8.4.3.7 De?erlendirmeler (Reviews)
* Ortalama puan + yorum say?s?
* Son 3 yorum
* Her yorumda: puan, tarih, dan??an ad? (anonim olabilir), yorum metni
* “Tüm de?erlendirmeleri gör” (opsiyonel)
Kural: Yaln?zca admin onayl? yorumlar görüntülenir.

8.4.4 Kullan?c? Ak??lar?
8.4.4.1 Profil Görüntüleme Ak???
1. Dan??an liste ekran?ndan uzmane t?klar
2. Profil sayfas? aç?l?r
3. Backend’den tüm bilgiler yüklenir

8.4.4.2 Randevu Olu?turma Ak???
1. “Randevu Al” seçilir
2. Paket kontrolü yap?l?r
3. Paket varsa ? randevu ekran?
4. Paket yoksa ? paket sat?n alma

8.4.4.3 Favori Ak???
1. Favori ikonuna bas?l?r
2. Favoriye ekle/ç?kar
3. Dashboard favorileri ile senkronize

8.4.5 ?? Kurallar?
* Yaln?zca aktif/onayl? uzmanler görüntülenir
* Yorumlar admin onay?ndan geçmeden görünmez
* Video sadece uzman taraf?ndan yüklenebilir
* Video yoksa bölüm gizlenmez, placeholder mesaj görünür

8.4.6 Edge Case’ler
* Video yok ? “Uzman henüz tan?t?m videosu eklemedi.”
* Video yüklenemedi ? fallback görsel + hata mesaj?
* Hiç de?erlendirme yok ? “Bu uzman için henüz de?erlendirme yok.”
* Uzman pasif ? kullan?c? liste ekran?na yönlendirilir

8.4.7 Non-Fonksiyonel Gereksinimler
* Profil ekran? < 300ms yüklenmeli
* Video CDN üzerinden sunulmal?
* Mobile-first tasar?m
* Görsel ve video optimizasyonu kullan?lmal?
* API yan?tlar? cache-friendly olmal?

8.5 Randevu Olu?turma
8.5.1 Amaç
Bu ekran, dan??an?n seçti?i uzman ile uygun bir zaman diliminde randevu olu?turmas?n? sa?lar. Randevu olu?turma ak???:
* Uzman profilinden
* Dan??an Dashboard’daki “Randevu Olu?tur” butonundan ba?lat?labilir.
Amaç, dan??an?n h?zl? ve do?ru ?ekilde seans planlayabilmesidir.

8.5.2 Roller
* Dan??an (Patient) ? randevu olu?turabilir
* Üyeliksiz kullan?c? ? yönlendirilir (login gereklidir)
* Uzman / Admin ? bu ekran? kullanmaz

8.5.3 Ön Ko?ullar
* Dan??an?n aktif paketi olmal?
* Kullan?c?da en az 1 seans hakk? olmal?
* Uzmanin takviminde uygun slot bulunmal?
Ko?ullar sa?lanmazsa kullan?c? paket sat?n alma ekran?na yönlendirilir.

8.5.4 Ekran Bile?enleri
8.5.4.1 Uzman Bilgi Kart? (Üst K?s?m)
* Foto?raf
* Ad Soyad
* Uzmanl?k alanlar?
* Ortalama puan
* K?sa aç?klama
* “Profil Sayfas?na Git” linki

8.5.4.2 Takvim (Gün Seçimi)
* Ayl?k görünüm
* Uzmanin uygun günleri i?aretli
* Müsait olmayan günler t?klanamaz
* Mobilde tek sütun görünüm
?? kurallar?:
* Geçmi? tarihler seçilemez
* Bugün için randevu al?nacaksa sadece kalan saatler seçilebilir
* Uzman haftal?k program belirlemi? olabilir (örn. sadece Pazartesi–Sal?)

8.5.4.3 Saat Slotlar? (Saat Seçimi)
Gün seçildi?inde görünür.
Her slot kart?nda:
* Saat bilgisi (örn. 11:30)
* Müsait / dolu durumu
* Seçildi?inde highlight olur
?? kurallar?:
* Tüm slotlar uzman çal??ma saatinden gelir
* Dolular t?klanamaz
* Seçim tek slot ile s?n?rl?d?r

8.5.4.4 Onay Kart? (Özet Bilgi)
Gösterilir:
* Seçilen tarih
* Seçilen saat
* Uzman ad?
* Seans süresi
* Kullan?lacak paket ve kalan seans say?s?

8.5.4.5 CTA – Randevuyu Onayla
* “Randevuyu Onayla” butonu
* Onay sonras? i? ak???:
o Randevu backend’e iletilir
o Paket seans hakk? 1 dü?er
o Zoom linki atan?r
o Dan??an “Seanslar?m” ekran?na yönlendirilir

8.5.5 Kullan?c? Ak??lar?
8.5.5.1 Standart Ak??
1. Dan??an randevu ekran?na ula??r
2. Gün seçer
3. Saat seçer
4. “Randevuyu Onayla”ya basar
5. ??lem tamamlan?r ? Seanslar?m ekran?na yönlendirilir

8.5.5.2 Paket Yoksa
1. Dan??an randevu olu?turmak ister
2. Sistem seans hakk?n? kontrol eder
3. Seans = 0 ise popup: > “Randevu olu?turmak için aktif seans hakk?n?z bulunmamaktad?r.”
4. CTA ? Paket Sat?n Al

8.5.5.3 Ayn? Saat K?s?tlama
* Ayn? dan??an?n ayn? saatte ayn? uzman için ikinci randevu olu?turmas? engellenir

8.5.6 ?? Kurallar?
* Pasif uzman ? randevu olu?turulamaz
* Ayn? slot iki ki?i taraf?ndan ayn? anda seçilirse, ilk onaylayan kazan?r
* Seansa 15 dakikadan az kala iptal edilmesi MVP’de engellenebilir
* Randevu olu?turuldu?unda dan??ana bildirim gider
* Zoom linki randevuyla ili?kilendirilir

8.5.7 Edge Case’ler
* Backend hatas?: “Randevu olu?turulamad?, tekrar deneyin.” + “Tekrar Dene”
* Seçilen gün dolu: “Bu tarihte müsait saat bulunmamaktad?r.”
* Uzman günü sonradan kapatt?ysa: takvim otomatik yenilenir
* ?nternet kesilirse:
o Randevu backend’de olu?tuysa dashboard’da görünür
o Olu?mad?ysa i?lem iptal kabul edilir

8.5.8 Non-Fonksiyonel Gereksinimler
* Takvim yüklemesi < 300ms
* Saat slotlar? h?zl? seçilebilir olmal?
* Mobil uyum zorunlu
* Randevu API’si race condition’lara kar?? kilitleme mekanizmas?na sahip olmal?

8.6 Seanslar?m
8.6.1 Amaç
Dan??an?n tüm seanslar?n? yönetebildi?i ekrand?r. Yakla?an seanslara eri?im, geçmi? seanslar?n görüntülenmesi, Zoom linki, rapor görüntüleme, seans iptali ve ki?isel seans notlar? özelliklerini içerir.

8.6.2 Roller
* Dan??an (Patient) ? eri?ir, seansa kat?l?r, not ekler, iptal eder.
* Üyeliksiz kullan?c? ? eri?emez.
* Uzman ? bu ekran? kullanmaz.

8.6.3 Ekran Bile?enleri
8.6.3.1 Üst Sekme: Yakla?an | Geçmi?
* Varsay?lan sekme: Yakla?an Seanslar
* ?kinci sekme: Geçmi? Seanslar

8.6.3.2 Yakla?an Seanslar Listesi
Her kartta:
* Uzman foto?raf?
* Uzman ad?
* Tarih & saat
* “Görü?meye Kat?l” (Zoom linki – 15 dk kala aktif)
* “Seans Detay?” butonu
* Seans ?ptali butonu (24 saatten fazla süre varsa)
Zoom Kurallar?:
* 15 dakikadan önce aktif olmaz
* Erken t?klan?rsa uyar?: “Görü?me linki henüz aktif de?il.”

8.6.3.3 Geçmi? Seanslar Listesi
Her kartta:
* Tarih & saat
* Uzman ad?
* “Tamamland?” durumu
* “Raporu Görüntüle” (varsa)
* De?erlendirme durumu ? “De?erlendirme Yap” veya puan gösterimi
* “Seans Detay?” butonu

8.6.3.4 Seans Detay? Modal
Gösterilir:
* Tarih & saat
* Uzman ad? + profil linki
* Paket ad?
* Seans tipi
* Zoom linki (yaln?zca yakla?an için aktif)
* Seans raporu (geçmi? için)
* Dan??an?n seans notu (görüntüleme + düzenleme)

8.6.3.5 Bo? Durumlar
Yakla?an seans yoksa:
“Yakla?an seans?n?z bulunmamaktad?r.” CTA ? Randevu Olu?tur
Geçmi? seans yoksa:
“Henüz hiç seans tamamlamad?n?z.” CTA ? Randevu Olu?tur

8.6.4 Kullan?c? Ak??lar?
8.6.4.1 Seansa Kat?lma Ak???
1. Dan??an “Görü?meye Kat?l”a t?klar.
2. Sistem kontrol eder ? 15 dk kural?.
3. Link yeni sekmede aç?l?r.

8.6.4.2 Rapor Görüntüleme Ak???
1. Dan??an geçmi? seanslardan birine t?klar.
2. “Raporu Görüntüle” aç?l?r.

8.6.4.3 De?erlendirme Ak???
1. Geçmi? seans kart?ndan “De?erlendirme Yap” seçilir.
2. 8.7 De?erlendirme ekran?na yönlendirilir.

8.6.4.4 Seans ?ptali Ak???
Dan??an seans? belirli kurallar çerçevesinde iptal edebilir.
Kurallar:
* Seans?n ba?lamas?na 24 saatten fazla süre varsa iptal edilebilir.
* 24 saatten az süre varsa iptal butonu görünmez.
* Dan??an haftada en fazla 2 seans iptal edebilir.
* Haftal?k limit dolmu?sa uyar?: > “Bu hafta maksimum iptal hakk?n?z dolmu?tur.”
* ?ptal edilen seans ? paket seans hakk? iade edilir.
* Slot tekrar müsait hale gelir.
* Uzmane iptal bildirimi gönderilir.

8.6.4.5 Seans Notlar? Ekleme Ak???
Dan??an seans için ki?isel not ekleyebilir.
Özellikler:
* Sadece dan??ana görünür.
* Not ekleme alan? max 500 karakter.
* Kullan?m örnekleri:
o “Bu seans için sorular?m:”
o “Bir dahaki görü?meye kadar hedeflerim:”
* Not seans detay modal’?nda görüntülenir, düzenlenebilir veya silinebilir.

8.6.5 ?? Kurallar?
* Yaln?zca dan??an?n kendi seanslar? gösterilir.
* Rapor sadece geçmi? seanslarda aktif olur.
* Yakla?an seanslar tarih s?ras?na göre listelenir.
* Zoom linkleri benzersizdir.
* De?erlendirme sadece tamamlanm?? seanslarda yap?labilir.
* Haftal?k iptal sayac? haftal?k cron job ile resetlenir.

8.6.6 Edge Case’ler
* Zoom linki olu?turulamaz ? “Link ?u anda olu?turulam?yor.”
* Uzman seans? iptal ederse ? dan??anda “?ptal edildi” görünür.
* Slot dolarsa ? “Bu saat art?k müsait de?il.”
* Rapor yoksa ? “Uzman henüz rapor eklemedi.”

8.6.7 Non-Fonksiyonel Gereksinimler
* Yakla?an seans listesi <200ms yüklenmeli.
* Mobil uyumu zorunlu.
* Seans geçmi?i paginated olmal?.
* Zoom linki güvenli ?ekilde maskelenmeli.

8.7 Mesajla?ma
8.7.1 Amaç
Dan??an?n, seans öncesi veya sonras? uzmaniyle yaz?l? ileti?im kurmas?n? sa?lar. Mesajla?ma; süreç takibi, soru-cevap, diyet güncellemeleri gibi ileti?im ihtiyaçlar?n? kar??lar.

8.7.2 Roller
* Dan??an (Patient) ? mesaj gönderir/al?r.
* Uzman ? mesaj gönderir/al?r.
* Admin ? yaln?zca moderasyon yapabilir (mesaj içeri?ini görmez, meta veriyi görür).

8.7.3 Ekran Bile?enleri
8.7.3.1 Konu?ma Listesi (Sol Panel / Mobilde Üstte)
Her konu?mada gösterilir:
* Uzman ad?
* Son mesajdan k?sa metin
* Son mesaj saati
* Okunmam?? mesaj say?s? (badge)
Bo? Durum:
“Henüz bir konu?ma ba?lat?lmam??.” CTA: Uzman Bul veya Seans Olu?tur

8.7.3.2 Mesaj Alan? (Chat Ekran?)
Gösterilenler:
* Uzman ad? + profil linki
* Mesaj balonlar? (sohbet arayüzü)
* Mesaj tarihi/saat bilgisi
* Okunma durumu (? veya çift ? opsiyonel)
Mesaj Balonlar?:
* Dan??an mesaj? sa?da
* Uzman mesaj? solda
* 300 karakter s?n?r?

8.7.3.3 Mesaj Yazma Alan?
* Text input (300 karakter max)
* Emoji deste?i (opsiyonel)
* Dosya gönderme (MVP’de yok)
* CTA: Gönder
Gönderim Kurallar?:
* Enter ? gönder
* Bo? mesaj gönderilemez
* 1 saniyede 3’ten fazla mesaj gönderilemez (spam engeli)

8.7.4 Kullan?c? Ak??lar?
8.7.4.1 Mesaj Gönderme Ak???
1. Dan??an yaz? alan?na mesaj? girer.
2. Gönder’e basar veya Enter’a basar.
3. Mesaj backend’e kay?t edilir.
4. Uzmane anl?k bildirim gider.
5. Mesaj ekranda görünür (optimistic update).

8.7.4.2 Mesaj Alma Ak???
1. Uzman mesaj gönderir.
2. Dan??an ekran?nda mesaj gerçek zamanl? belirir.
3. Okunma bilgisi güncellenir.

8.7.4.3 Konu?ma Ba?latma Ak???
1. Dan??an bir uzman ile ilk kez seans olu?turur ? konu?ma otomatik aç?l?r.
2. Dan??an uzman profilinden “Mesaj Gönder”e t?klayarak da ba?latabilir (MVP opsiyonel).
3. Sistem konu?ma ID’sini üretir.

8.7.4.4 Okunmam?? Mesajlar
* Konu?ma aç?ld???nda tüm mesajlar okunmu? olarak i?aretlenir.
* Bildirim balonu kaybolur.

8.7.5 ?? Kurallar?
* Her dan??an–uzman çifti için tek konu?ma thread’i bulunur.
* Konu?ma geçmi?i silinemez (MVP).
* Dan??an ve uzman yaln?zca birbirlerinin mesajlar?n? görebilir.
* Admin yaln?zca mesaj meta verilerini görebilir:
o Tarih
o Boyut
o Gönderen kim (Mesaj içeri?i gizlidir, KVKK gere?i.)
* Hakaret, spam veya ?iddet içeren mesajlar flag mekanizmas? ile admin’e dü?er.

8.7.6 Edge Case’ler
* ?nternet koparsa mesaj “gönderiliyor…” durumunda kal?r ? ba?lant? gelince gönderilir.
* Uzman hesab? pasifse:
o Yeni mesaj gönderilemez
o Eski mesajlar görüntülenir
* Mesaj çok uzun ? hata: “Mesaj en fazla 300 karakter olabilir.”

8.7.7 Non-Fonksiyonel Gereksinimler
* Mesaj gönderme <150ms yan?t süresi
* WebSocket / real-time altyap?
* Mobilde tam uyumlu chat arayüzü
* Yüksek veri güvenli?i (mesaj içerikleri encryption-at-rest)
* Spam ve flood korumas?

8.8 Seans Sonras? De?erlendirme
8.8.1 Amaç
Bu özellik, dan??an?n tamamlanan bir seans sonras? uzmani objektif ?ekilde de?erlendirmesini sa?lar. De?erlendirmeler platform kalitesini art?r?r, uzman puan ortalamas?na etki eder ve di?er dan??anlara seçim kolayl??? sa?lar.

8.8.2 Roller
* Dan??an (Patient) ? de?erlendirme yapabilir.
* Admin ? de?erlendirmeyi onaylar veya reddeder.
* Uzman ? kendi de?erlendirmelerini görüntüler.

8.8.3 Ön Ko?ullar
* Seans tamamlanm?? olmal?d?r.
* Dan??an ayn? seans için henüz de?erlendirme yapmam?? olmal?d?r.
* Seans dan??ana ait olmal?d?r.

8.8.4 Ekran Bile?enleri
8.8.4.1 Üst Bilgi
Gösterilir:
* Uzman foto?raf?
* Ad Soyad
* Seans tarihi & saati
* “Profil Sayfas?” linki

8.8.4.2 Puanlama Alan?
? 1–5 y?ld?z puanlama.
Kurallar:
* Minimum puan = 1 y?ld?z.
* Dokunmatik uyumlu.
* Ortalama puan? admin onay? sonras? etkiler.

8.8.4.3 Yorum Alan?
* Maksimum 500 karakter.
* Opsiyonel.
* Placeholder: “Uzman deneyiminizi k?saca anlatabilirsiniz…”
Kurallar:
* Hakaret, ki?isel veri, spam içerik admin taraf?ndan reddedilir.
* Bo? b?rak?l?rsa sadece y?ld?z puan? i?lenir.

8.8.4.4 CTA – De?erlendirmeyi Gönder
Bas?l?nca:
1. De?erlendirme pending olarak kaydedilir.
2. Admin onay kuyru?una dü?er.
3. Dan??ana ba?ar? mesaj? gösterilir.
4. CTA: “Dashboard’a Dön” veya “Seanslar?m”.

8.8.5 Kullan?c? Ak??lar?
8.8.5.1 De?erlendirme Ba?latma
Kullan?c? üç farkl? yerden de?erlendirme ekran?na gelir:
1. Geçmi? seans kart? ? “De?erlendirme Yap”
2. Seans Detay? modal? ? “De?erlendirme Yap”
3. Seans tamamland? bildirimi ? “De?erlendirme Yap”

8.8.5.2 De?erlendirme Gönderme Ak???
1. Dan??an y?ld?z seçer.
2. Opsiyonel yorum yazar.
3. Gönder’e basar.
4. Sistem de?erlendirmeyi kaydeder (pending).
5. Admin onay? sonras?:
o Uzman puan? güncellenir.
o De?erlendirme profil sayfas?nda görünür.

8.8.6 ?? Kurallar?
* Her seans için tek de?erlendirme yap?labilir.
* Admin onay? olmadan de?erlendirme görünmez.
* Ortalama puan yaln?zca onayl? de?erlendirmeler ile hesaplan?r.
* Dan??an de?erlendirmeyi düzenleyemez.
* Silme iste?i admin üzerinden yap?labilir.
* Y?ld?z puan? zorunlu, yorum opsiyoneldir.
* Pasif uzman yorumlar? yeni dan??anlara gösterilmez.

8.8.7 Edge Case’ler
* Ayn? seans için tekrar de?erlendirme: “Bu seans için de?erlendirme yapt?n?z.”
* Admin reddederse dan??ana bildirim gider.
* Uzman pasif ise de?erlendirme ar?ivde kal?r, profilde gösterilmez.

8.8.8 Non-Fonksiyonel Gereksinimler
* Form <150 ms içinde aç?lmal?d?r.
* Puanlama animasyonlar? mobil uyumlu olmal?d?r.
* Admin paneli h?zl? moderasyon için optimize edilmelidir.

8.9 Profil & Ayarlar
8.9.1 Amaç
Bu ekran, dan??an?n kendi hesap bilgilerini yönetmesini, güvenlik ayarlar?n? düzenlemesini, bildirim tercihlerini belirlemesini ve temel profil bilgilerini güncellemesini sa?lar.

8.9.2 Roller
* Dan??an (Patient) ? tüm ayarlara eri?ir.
* Admin ? yaln?zca meta veri görebilir.

8.9.3 Ekran Bile?enleri
Profil & Ayarlar 4 ana sekmeden olu?ur:
1. Profil Bilgilerim
2. Güvenlik (?ifre De?i?tirme)
3. Bildirim Ayarlar?
4. Hesap ??lemleri

8.9.3.1 Profil Bilgilerim
* Ad, soyad
* Profil foto?raf?
* Telefon
* E?posta (do?rulama ile de?i?ir)
* Do?um y?l? (opsiyonel)
* Cinsiyet (opsiyonel)
Kurallar:
* E?posta benzersizdir.
* Foto?raf max 5MB.

8.9.3.2 Güvenlik (?ifre De?i?tirme)
* Mevcut ?ifre
* Yeni ?ifre + tekrar
?ifre kurallar?:
* 8+ karakter
* Büyük harf, rakam, özel karakter

8.9.3.3 Bildirim Ayarlar?
Aç/kapa ayarlar?:
* Seans hat?rlatma
* Yeni mesaj
* Paket biti?i uyar?s?
* De?erlendirme hat?rlatma
* E?posta bildirimleri

8.9.3.4 Hesap ??lemleri
Geçici olarak devre d??? b?rak:
* Hesap gizlenir.
Kal?c? silme:
* 7 günlük bekleme süreci.
* E?posta do?rulama gerekir.
* Aç?k seans varsa engellenir.

8.9.4 Kullan?c? Ak??lar?
* Profil düzenleme
* ?ifre de?i?tirme
* Bildirimleri yönetme
* Hesap silme ak???

8.9.5 ?? Kurallar?
* Tüm de?i?iklikler audit log’a kaydedilir.
* Hesap silme geri al?namaz (7 gün sonra).

8.9.6 Edge Case’ler
* Foto?raf yüklenmedi ? hata
* E?posta do?rulanmazsa de?i?mez
* Hesap silme s?ras?nda giri? yap?lamaz

8.9.7 Non-Fonksiyonel Gereksinimler
* Ekran <200ms yüklenmeli
* ?ifre brute?force korumas?
* Mobil uyum zorunlu
* Görsel optimizasyon


