9. Uzman Modülü – FDD
9.1 Uzman Onboarding (Ba?vuru & Kat?l?m Süreci) – FDD (Revize)
9.1.1 Amaç
Bu modül, yeni bir uzmanin platforma:
* Ba?vuru yapmas?n?,
* Mesleki bilgilerini ve belgelerini girmesini,
* Sözle?me & KVKK onay? vermesini,
* Ba?vuru durumunu takip etmesini
sa?lar.
Amaç, düzenli, denetlenebilir ve ölçeklenebilir bir onboarding süreci olu?turmakt?r.

9.1.2 Roller
* Expert Applicant (Uzman Aday?)
o Ba?vuru formunu doldurur
o Belgeleri yükler
o Ba?vuru durumunu takip eder
* Admin
o Ba?vuru bilgilerini ve belgeleri inceler
o Onaylar / reddeder (detay? Admin modülünde tan?mlanacak)

9.1.3 Hesap ve Rol Mimarisi (User / Client / Expert)
Sistem taraf?nda temel model:
* User ? Sisteme login olan herkes
* Client ? Hizmet alan taraf (eski “dan??an/patient”)
* Expert ? Hizmet veren sa?l?k profesyoneli
Kurallar:
* Her User kayd?n?n tek bir e-postas? vard?r.
* Client ? UserId ile User tablosuna ba?l?d?r.
* Expert ? UserId ile User tablosuna ba?l?d?r.
* Ayn? ki?i hem Client hem Expert olabilir ama ayn? e-posta üzerinden rol kar???kl???na izin vermiyoruz (detay? a?a??da).

9.1.4 Onboarding Ad?mlar? (Wizard)
Uzman ba?vurusu, ad?m ad?m ilerleyen bir wizard ?eklindedir:
1. E-posta kontrolü & Hesap olu?turma
2. Temel ileti?im bilgileri
3. Mesleki bilgiler
4. Belge yükleme
5. Sözle?me & KVKK onay?
6. Özet & Ba?vuru gönderimi
7. Ba?vuru durumu ekran?

9.1.4.1 Ad?m 1 – E-posta Kontrolü & Hesap Olu?turma
Alanlar:
* E-posta
* ?ifre
* ?ifre tekrar
E-posta kontrolü (kritik k?s?m):
Backend ?u senaryolar? kontrol eder:
1. E-posta sistemde hiç yok (User yok)
o Yeni bir User kayd? olu?turulur.
o Expert onboarding bu User üzerinden devam eder.
2. E-posta mevcut ve sadece Client rolü var
o Kullan?c?ya ?u uyar? gösterilir: > “Bu e-posta adresi mevcut bir dan??an hesab?na ba?l?.
> Uzman ba?vurusu için lütfen farkl? bir e-posta adresi kullan?n.”
o Onboarding bu e-posta ile devam etmez.
3. E-posta mevcut ve Expert rolü zaten ba?l?
o E?er Expert.Status = Pending ise: > “Bu e-posta ile zaten aktif bir uzman ba?vurusu bulunuyor.”
o E?er Expert.Status = Approved ise: > “Bu e-posta adresiyle zaten onayl? bir uzman hesab?n?z bulunuyor.”
4. E-posta mevcut ve hem Client hem Expert ba?l?
o Normal ?artlarda bu duruma izin vermemeye çal???yoruz;
* E?er tarihsel bir sebeple olduysa ? sadece bilgilendirme: > “Bu e-posta zaten uzman hesab?n?z için kullan?lmaktad?r.”
?ifre kurallar?:
* Min 8 karakter
* En az 1 büyük harf
* En az 1 rakam
* En az 1 özel karakter
Ba?ar?l?ysa ? 2. ad?ma geçilir.

9.1.4.2 Ad?m 2 – Temel ?leti?im Bilgileri
Alanlar:
* Ad
* Soyad
* Telefon numaras?
* ?ehir / ?lçe
* Çal??ma ?ekli:
o Sadece online
o Online + Yüz yüze (gelecek faz için altyap?)
Kurallar:
* Telefon zorunlu
* ?ehir zorunlu, ilçe opsiyonel (MVP karar?)
* Telefon format? do?rulan?r (örn. +90 … yap?s? veya TR format?)

9.1.4.3 Ad?m 3 – Mesleki Bilgiler
Alanlar:
* Mesleki unvan:
o Uzman
o Uzm. Uzman
* Üniversite
* Mezuniyet y?l?
* Toplam deneyim y?l?
* Uzmanl?k alanlar? (multi-select):
o Kilo verme
o Sporcu beslenmesi
o Gebelik & emzirme
o Çocuk beslenmesi
o Diyabet / kronik hastal?klar
o Bariatrik cerrahi sonras?
o (Liste geni?lemeye aç?k)
Kurallar:
* En az 1 uzmanl?k alan? seçilmelidir
* Mezuniyet y?l? gelecekte olamaz
* Deneyim y?l? negatif olamaz, mant?ks?z de?erler engellenir (örn. 60 y?l vs.)

9.1.4.4 Ad?m 4 – Belge Yükleme
Yüklenecek belgeler:
* Diploma (zorunlu)
* Mesleki oda / ruhsat belgesi (zorunlu veya “Sonradan yükleyece?im” seçene?i ile)
* Sertifikalar (opsiyonel, çoklu dosya)
Dosya kurallar?:
* Uzant?: PDF, JPG, PNG
* Max boyut: 10 MB/dosya
* Sertifika say?s?: örn. max 10
Kurallar:
* Diploma olmadan “Devam Et” butonu aktif olmaz
* Yüklenen dosyalar güvenli storage’a al?n?r
* Admin bu dosyalar? Admin panelinden tek t?kla görüntüleyebilir

9.1.4.5 Ad?m 5 – Sözle?me & KVKK Onay?
Gösterilen:
* Hizmet sözle?mesi metni
* KVKK ayd?nlatma metni
Checkbox’lar:
* “Hizmet sözle?mesini okudum ve kabul ediyorum.”
* “KVKK metnini okudum, ki?isel verilerimin i?lenmesini kabul ediyorum.”
Kurallar:
* ?ki onay da zorunlu
* Onay verildi?inde:
o tarih/saat
o IP adresi
o UserId
audit log’a yaz?l?r ve silinemez kay?t olarak saklan?r.

9.1.4.6 Ad?m 6 – Özet & Ba?vuruyu Gönder
Özet ekran?:
* Temel bilgiler
* Mesleki bilgiler
* Uzmanl?klar listesi
* Yüklenen belgeler listesi
* Sözle?me onay durumu
CTA: “Ba?vurumu Gönder”
Bas?l?nca:
* Expert kayd? olu?turulur veya güncellenir:
o Status = Pending
o Linked UserId ile
* Uzmane e-posta: > “Ba?vurunuz al?nm??t?r. ?nceleme tamamland???nda e-posta ile bilgilendirileceksiniz.”
Ekran mesaj?:
“Ba?vurunuz ba?ar?yla al?nd?. En k?sa sürede inceleyip size dönü? yapaca??z.”

9.1.4.7 Ba?vuru Durumum Ekran?
Uzman aday? login oldu?unda, dashboard yerine önce “Ba?vuru Durumum” ekran?n? görür.
Gösterilen:
* Ba?vuru durumu:
o Pending (?ncelemede)
o Approved (Onayland?)
o Rejected (Reddedildi)
* Son güncelleme tarihi
* Admin notu (reddedildiyse)
Duruma göre:
* Pending: > “Ba?vurunuz inceleniyor. Bu süreç genellikle X i? günü sürer.”
* Approved: > “Ba?vurunuz onayland?! Art?k seans alabilir ve profilinizi düzenleyebilirsiniz.”
> CTA: Uzman Dashboard’a Git
* Rejected: > “Ba?vurunuz ?u nedenle reddedildi:” + Admin Notu
> CTA: Bilgilerimi Güncelle ve Yeniden Gönder

9.1.5 Kullan?c? Ak??lar?
9.1.5.1 Yeni Uzman Ba?vurusu
1. Public landing: “Uzman olarak kat?l”
2. E-posta & ?ifre ile User olu?turma (veya e-posta conflict uyar?s?)
3. Temel ileti?im bilgileri
4. Mesleki bilgiler
5. Belgelerin yüklenmesi
6. Sözle?me onaylar?
7. Özet & Ba?vuru gönderimi
8. Ba?vuru durumu ekran?na yönlendirme

9.1.5.2 Reddedilen Ba?vuruyu Yeniden Gönderme
1. Uzman aday? giri? yapar
2. Ba?vuru durumu: Reddedildi
3. Admin taraf?ndan girilen aç?klamay? okur
4. Gerekli ad?mlarda düzeltme yapar (özellikle belge yükleme)
5. “Tekrar ?ncelemeye Gönder” butonuna basar
6. Status tekrar Pending olur

9.1.6 ?? Kurallar?
* Ayn? e-posta ile Client hesab? varken, uzman ba?vurusu yap?lamaz
o “Bu e-posta adresi mevcut bir dan??an hesab?na ba?l?. Uzman ba?vurusu için lütfen farkl? bir e-posta adresi kullan?n.”
* Her UserId için maksimum 1 aktif Expert kayd? olabilir
* Onaylanmam?? uzman, randevu alamaz / seans yönetemez
* Ba?vuru formu tamamlanmad?ysa taslak kay?t (draft) ileride eklenebilir (Faz 2)

9.1.7 Edge Case’ler
* E-posta zaten Client hesab?na ait ? net hata mesaj?, ilerleme durur
* Diploma yüklenmeden devam ? buton pasif kal?r
* Onboarding ortas?nda oturum süresi dolar ? login’e atar, son ad?mdan devam opsiyonu Faz 2
* Admin yanl??l?kla reddeder ? durum “Rejected” ? yeniden ba?vuru imkan? verilir

9.1.8 Non-Fonksiyonel Gereksinimler
* Her ad?m <300 ms yan?t vermeli
* Belgeler güvenli dosya alan?nda saklanmal?
* Log & audit trail KVKK/gizlilik gerekliliklerine uygun tutulmal?
* Mobilde stepper/wizard kullan?m? rahat olmal? (tek kolon, yukar?da ad?m bar?)
9.2 Uzman Dashboard – FDD Tasla??
9.2.1 Amaç
Uzmanin sisteme giri? yapt?ktan sonra:
* Bugünkü seanslar?n? görmesini
* Bekleyen raporlar?n? yönetmesini
* Kazanç özetini takip etmesini
* Takvime ula?mas?n?
* Mesajlara eri?mesini
* H?zl? aksiyonlar almas?n?
sa?layan merkez ekran?d?r.
Uzman taraf?ndaki tüm operasyon buradan ba?lar.
Dashboard = Uzmanin kontrol paneli

9.2.2 Roller
* Uzman (Expert) ? eri?ebilir
* Admin / Client ? eri?emez
* Onaylanmam?? uzman ? dashboard yerine “Ba?vuru Durumu” ekran?na yönlendirilir

9.2.3 Ekran Bile?enleri
Dashboard 6 ana bölümden olu?ur:
1. Bugünkü Seanslar
2. Bekleyen Raporlar
3. Ayl?k Kazanç Özeti
4. H?zl? ??lemler
5. Mini Takvim (Yakla?an Seanslar)
6. Bildirimler

9.2.3.1 Üst Navigasyon (Header)
* Dashboard
* Takvim
* Dan??anlar
* Mesajlar
* Profilim
* Ayarlar
* Ç?k??
Not:
Bu menu uzmanin modülüne özel, dan??an menüsüyle kar??maz.

9.2.3.2 Bugünkü Seanslar (Ana Kart)
Gösterilir:
* Bugünün tarihi
* Toplam seans say?s?
* Seans listesi:
Her seans kart?nda:
* Saat (örn. 14:30 – 15:00)
* Client ad?
* Profil foto
* Zoom linki (aktif)
* “Seans? Aç” butonu
* Durum (Yakla?an / Devam Ediyor)
?? Kurallar?:
* Geçmi? saatli seanslar listelenmez
* Zoom linki görü?meye 15 dk kala aktif olur
* Client bilgisi minimum düzeyde gösterilir (KVKK)
* T?klan?nca Seans Detay ekran?na gider

9.2.3.3 Bekleyen Raporlar (To-Do List)
Her seans için:
* Seans tarihi
* Client ad?
* “Rapor Yaz” butonu
Kurallar:
* Yaln?zca tamamlanm?? ama raporu yaz?lmam?? seanslar görünür
* T?klay?nca:
? “9.4 Seans Yönetimi & Raporlama” ekran?na gider
* Bildirim balonu header’da görünür (ör. “3 bekleyen rapor”)

9.2.3.4 Ayl?k Kazanç Özeti (Mini Finans Kart?)
Gösterilen:
* Bu ayki toplam kazanç
* Bu haftaki kazanç (opsiyonel)
* Toplam tamamlama say?s?
* Geldi-gidecek ödemeler (MVP’de yok ? ileriki faz)
Kurallar:
* Gerçek zamanl? hesap de?il ? gün sonunda batch ile güncellenebilir
* Admin taraf?ndan belirlenen yüzdelere göre komisyon hesaplan?r

9.2.3.5 H?zl? ??lemler (Action Buttons)
Butonlar:
* Takvimimi Gör
* Rapor Yaz
* Mesajlar
* Profilimi Düzenle
?? kurallar?:
* “Rapor Yaz” sadece bekleyen rapor varsa aktif
* Butonlar sabit 4 adet (MVP için)

9.2.3.6 Mini Takvim (Yakla?an Seanslar)
Gösterilen:
* Önümüzdeki 7 gün
* Her günün seans say?s?
* Gün seçilince alt tarafta mini liste:
Liste elemanlar?:
* Tarih
* Saat
* Client ad?
* “Detay” linki
Kurallar:
* Sadece gelecekteki seanslar gelir
* Bugün ? Bugünkü seans kart? ile senkron
* Yakla?an seans yoksa: > “Önümüzde seans bulunmuyor.”

9.2.3.7 Bildirimler
Gösterilir:
* Yeni mesaj
* Yeni client
* Seans iptali
* Sistem duyurular?
Kurallar:
* Okundu/okunmad? ayr?m? tutulur
* I??k balonu (badge) header’da görünür

9.2.4 Kullan?c? Ak??lar?
9.2.4.1 Dashboard Yükleme Ak???
Backend tek cevapta gönderir:
* Bugünkü seanslar
* Bekleyen raporlar
* Yakla?an seanslar
* Ayl?k kazanç özet
* Bildirimler
Tek endpoint:
GET /expert/dashboard

9.2.4.2 Rapor Yazma Ak???
1. Uzman “Rapor Yaz”a basar
2. ?lgili seans detay ekran? aç?l?r
3. Rapor yaz?l?r ? kaydedilir
4. Dashboard’daki bekleyen rapor say?s? azal?r

9.2.4.3 Seansa Kat?lma Ak???
1. Uzman bugünkü seanslardan birine t?klar
2. Zoom linki (toplant? sahibi olarak) aç?l?r
3. Seans bittikten sonra ? rapor yaz?labilir

9.2.4.4 Mini Takvim Ak???
1. Gün seçilir
2. O günün seanslar? listelenir
3. “Detay” ile seans bilgi ekran?na gidilir

9.2.5 ?? Kurallar?
* Onaylanmam?? uzman dashboard’a giremez ? “Ba?vuru Durumu” ekran? aç?l?r
* Bugünkü seanslar zaman s?ras?na göre s?ralan?r
* Bekleyen rapor listesi maksimum 20 gösterilir (daha fazlas? “Tümünü gör” ile aç?l?r)
* Kazanç verileri admin taraf?ndan do?rulanm?? statüde olmal?d?r
* Pasif client ? seans? gösterilir ama mesaj gönderebilecek durumu k?s?tlanabilir
* Zoom linkleri uzmane özel olu?turulur (host link)

9.2.6 Edge Case’ler
* Henüz seans? olmayan yeni uzman: > “Bugün planlanm?? seans?n?z yok.”
> CTA ? Takvimimi Ayarla
* Hiç rapor yok ? Rapor bölümü gizlenmez, “Bekleyen rapor bulunmuyor.” mesaj? ç?kar
* Kazanç bilgisi gecikmi? batch ? “Güncelleniyor” durumu gösterilir
* Uzman seansa t?klad???nda seans silindiyse ? > “Seans bulunamad?. Lütfen sayfay? yenileyin.”

9.2.7 Non-Fonksiyonel Gereksinimler
* Dashboard < 300ms yüklenmeli (Cache kullan?labilir)
* Mobil ve tablet uyumu zorunlu
* API tek request ile çal??mal?
* Bugünkü seanslar real-time güncellenebilir (opsiyonel)
* UI’de kritik veriler skeleton state ile yüklenmeli
9.3 Takvim Yönetimi
9.3.1 Amaç
Takvim Yönetimi, uzmanin çal??ma plan?n? yönetmesini sa?lar. Bu ekran üzerinden uzman:
* Haftal?k çal??ma program?n? tan?mlar
* Müsait oldu?u saat aral?klar?n? belirler
* Mola/kapan?? saatlerini i?aretler
* Tatil günleri ekler
* Seanslar? takvim üzerinde görüntüler
* Manuel olarak seans bloklayabilir veya bo? slot ekleyebilir
Amaç: Dan??anlar?n sadece uygun saatlerde randevu olu?turabilece?i kontrollü bir zaman çizelgesi sa?lamak.
9.3.2 Roller
* Uzman ? Tam eri?im
* Admin ? Görüntüleme (read-only)
* Client ? Eri?emez
9.3.3 Ekran Bile?enleri
Takvim yönetimi 4 ana bile?enden olu?ur:
9.3.3.1 Haftal?k Çal??ma Program? (Weekly Template)
Uzman her gün için çal??ma saatlerini belirler.
Örnek tablo:
Gün         Durum    Ba?lang?ç   Biti?     Ara Saatleri
Pazartesi   Aç?k     10:00       20:00     13:00–14:00 mola
Sal?        Kapal?   —          —         —
Çar?amba    Aç?k     09:00       18:00     —
?? kurallar?:
* Varsay?lan hafta: 5 gün aç?k (09:00–18:00)
* Uzman günün tamam?n? kapatabilir
* Birden fazla mola eklenebilir
* Her gün için minimum 30 dk çal??ma olmal?
* Bu ?ablon gelecekteki tüm haftalara uygulan?r
9.3.3.2 Takvim (Ayl?k Görünüm)
Gösterilir:
* Ay seçimi
* Günler
* Seans olan günlerde i?aret (?)
* Kapal? günlerde gri görünüm
Gün seçildi?inde aç?l?r:
* Seans listesi
* Uygun saat slotlar?
* Slot ekleme/silme
9.3.3.3 Gün ?çindeki Saat Slotlar?
Her slot:
* Saat (örn. 14:00–14:30)
* Durum: Müsait / Dolu / Mola
* “Sil” (bo? slotlarda)
* “Manuel Slot Ekle”
Slot kurallar?:
* Varsay?lan seans süresi: 30 dk (MVP)
* Çal??ma saatine göre slotlar otomatik üretilir
9.3.3.4 Özel Gün / Tatil Tan?mlama
Uzman ?unlar? ekleyebilir:
* Tam gün tatil
* Yar?m gün kapal?
* Özel bloklama (örn. 15:00–17:00 özel program)
Kurallar:
* Tatil eklenirse tüm slotlar silinir
* Dolu slot varsa ? uzman iptal onay? vermelidir
* ?ptal edilen slotlardaki dan??anlara bildirim gider
9.3.4 Kullan?c? Ak??lar?
9.3.4.1 Haftal?k Program Olu?turma Ak???
1. Uzman günleri ve saatleri seçer
2. Mola saatleri ekler
3. “Kaydet” ? gelecekteki haftalara uygulan?r
4. Önceden olu?turulmu? seanslar etkilenmez
9.3.4.2 Günlük Slot Yönetimi Ak???
1. Takvimden gün seçilir
2. Slotlar görüntülenir
3. Bo? slot silinebilir
4. Manuel slot eklenebilir
5. Dolu slot silinemez (iptal ak??? kullan?lmal?)
9.3.4.3 Tatil / Özel Gün Ekleme Ak???
1. “Tatil Ekle” seçilir
2. Tam/yar?m gün seçilir
3. Kay?t sonras? bo? slotlar silinir
4. Dolu slot varsa sistem uyar? verir ve iptal zorunludur
9.3.4.4 Admin Görüntüleme Ak???
* Admin tüm takvimleri read-only modda görüntüler
9.3.5 ?? Kurallar?
* Slot süresi tüm uzmanlerde 30 dk (MVP)
* Çal??ma saatleri d???nda slot olu?turulamaz
* Tatil ekleme tüm slotlar? kapat?r
* Geçmi? tarihlere müdahale edilemez
* Yakla?an dolu slot silinemez
* Haftal?k template de?i?imi sadece gelecekteki bo? slotlar? etkiler
* Uzman çal??ma saatlerini haftada en fazla 3 kez de?i?tirebilir (opsiyonel)
9.3.6 Edge Case’ler
* Tatil eklenirken dolu seans var ? uyar? + iptal zorunlulu?u
* Slot çak??mas? ? “Bu saat aral??? zaten dolu”
* Admin görüntüleme hatas? ? “Takvim verileri al?namad?”
* Gün kapal? ? “Bugün çal??ma saatleriniz kapal?d?r”
9.3.7 Non-Fonksiyonel Gereksinimler
* Takvim <300ms yüklenmeli
* Slot i?lemleri real-time güncellenmeli
* Mobil uyum zorunlu
* Takvim verisi cache kullan?labilir
* Tüm i?lemler audit log’a yaz?lmal? (?çerik: çal??ma saatleri, tatil günleri, slot yönetimi, tekrar eden program, kurallar, edge case’ler)
? 9.4 Seans Yönetimi & Raporlama – FDD Tasla??
Bu modül, uzmanin planlanm?? seanslar?n? yönetmesini, görü?meye kat?lmas?n?, görü?me sonras? rapor yazmas?n? ve seans durumlar?n? güncellemesini sa?layan ana operasyondur.

9.4.1 Amaç
Bu ekran?n amac?:
* Uzmanin yakla?an seanslar?n? yönetmesi
* Seans detaylar?n? h?zl?ca görmesi
* Zoom görü?mesini ba?latmas?
* Seans sonras? dan??ana özel rapor yazmas?
* Seans?n durumunu “Tamamland? / ?ptal / No-Show” olarak güncellemesi
Platformdaki her seans?n kayda de?er, düzenli ve standart ilerlemesini sa?lar.

9.4.2 Roller
* Uzman ? tüm seans yönetimi ve raporlama yetkisi
* Admin ? seans bilgilerini görüntüleyebilir (read-only), raporlar? görebilir
* Dan??an ? sadece kendi seans sonucunu ve raporu görebilir

9.4.3 Ekran Bile?enleri
Seans Yönetimi 3 ana bölümden olu?ur:
1. Seans Listesi (Yakla?an / Geçmi?)
2. Seans Detay?
3. Rapor Yazma / Güncelleme

9.4.3.1 Seans Listesi
Sekmeler:
* Yakla?an Seanslar
* Geçmi? Seanslar
Her Seans Kart?nda:
* Tarih & saat
* Dan??an ad? + küçük profil foto
* Paket ad? (opsiyonel)
* Durum:
o Bekliyor
o Devam ediyor
o Tamamland?
o ?ptal edildi
o No-show
* Zoom linki ? “Görü?meyi Ba?lat”
* “Detay” butonu
* “Rapor Yaz” (yaln?zca tamamlanan seanslarda)

9.4.3.2 Seans Detay? Ekran?
Aç?ld???nda gösterilir:
Üst Bilgi:
* Dan??an ad?
* Uzman ad?
* Tarih & saat
* Seans türü (Zoom üzerinden)
* Paket bilgisi
* ID ve referans kodu (gizli olabilir)
Orta Bilgi:
* Zoom linki (host link)
* Seans?n zaman çizelgesi (planlanan ? tamamlanan)
* Geçmi? raporlar (varsa)
Alt Bilgi:
Butonlar:
* Görü?meyi Ba?lat
* Rapor Yaz
* Seans? Tamamla
* No-Show ??aretle
* Seans? ?ptal Et

9.4.3.3 Rapor Yazma Ekran?
Rapor, uzmanin dan??ana seans sonras? yazd??? yönlendirici notlard?r.
Alanlar:
1. Genel Görü?me Özeti (zorunlu)
* Max 1.000 karakter
* Dan??ana görünür
2. Haftal?k Hedefler (opsiyonel)
Örn:
* Su tüketimini art?r
* 3 gün yürüyü?
* Ara ö?ünleri düzenle
3. Diyet Listesi (opsiyonel fakat önerilir)
* Serbest metin alan? veya yap?land?r?lm?? alan (MVP: serbest metin)
4. Ek Notlar (opsiyonel)
Uzmane özel notlar (dan??ana görünmez) ? opsiyonel.
Kural:
Uzman görünmez not alan?na hassas veri, sa?l?k geçmi?i, üçüncü ki?i bilgisi yazamaz.

9.4.4 Kullan?c? Ak??lar?
9.4.4.1 Görü?meye Kat?lma Ak???
1. Uzman “Görü?meyi Ba?lat”a basar
2. Zoom host linki aç?l?r
3. Uzman toplant? sahibi olur
4. Seans bitince ? “Rapor Yaz” yönlendirmesi görsel olarak belirir

9.4.4.2 Seans? Tamamlama Ak???
Seans bittikten sonra:
1. Uzman “Seans? Tamamla”ya basar
2. Sistem:
o Seans durumunu Completed olarak i?aretler
o Dan??ana “Seans tamamland?” bildirimi gönderir
o “De?erlendirme Yap” butonu dan??an taraf?nda görünür
3. Uzman isterse hemen rapor yazabilir, isterse sonra döner

9.4.4.3 Rapor Yazma Ak???
1. Uzman seans detay?ndan “Rapor Yaz” seçer
2. Rapor formu aç?l?r
3. Metin alanlar? doldurulur
4. “Kaydet” butonu ile rapor dan??ana görünür hale gelir
5. Dan??an taraf?nda:
o Seanslar?m ? “Rapor Görüntüle” aktif olur
o Push/email bildirimi gider

9.4.4.4 Seans? ?ptal Etme Ak??? (Uzman Taraf?)
Kullan?m ?artlar?:
* Seans ba?lamadan en az 3 saat önce iptal edilebilir
* Dan??an?n paket hakk? otomatik iade edilir
Ak??:
1. Uzman “?ptal Et” seçer
2. Sebep giri?i yap?l?r (zorunlu)
3. Dan??ana bildirim gider
4. Slot tekrar müsait hale gelir

9.4.4.5 No-Show (Dan??an Gelmedi) Ak???
Ko?ullar:
* Seans saatinden 10 dakika sonra hâlâ giri? yap?lmad?ysa
* Uzman manuel i?aretleyebilir
Ak??:
1. “No-Show ??aretle” butonu
2. Uzman k?saca not ekler
3. Dan??ana “no-show” bildirimi gider
4. Paket hakk? tüketilmi? say?l?r
5. Uzman ücreti normal ?ekilde hesaba i?lenir

9.4.5 ?? Kurallar?
* Rapor yaz?lmadan seans “tamamland?” olabilir (rapor sonradan eklenebilir)
* Dan??an raporlar? sadece kendi seanslar?nda görür
* Admin tüm seans ve raporlar? görüntüleyebilir
* Seans iptali:
o Uzman ? 3 saat kural?
o Dan??an ? 24 saat kural?
* Rapor kaydedildi?inde düzenleme:
o ?lk 24 saat içinde ? düzenlenebilir
o 24 saatten sonra ? sadece admin düzenleyebilir
* No-show ? dan??an?n hak kayb?
* Tüm seans i?lemleri audit log’a i?lenir

9.4.6 Edge Case’ler
* Görü?me aç?lm?yor ? “Zoom ba?lant?s? yap?lamad?”
* Ayn? anda iki cihazdan giri? ? son giri? aktif kabul edilir
* Rapor kaydedilemedi ? tekrar deneme opsiyonu
* No-show yanl??l?kla i?aretlenmi? ? admin revert edebilir
* Dan??an ve uzman farkl? zaman dilimlerindeyse ? saatler kullan?c?ya göre gösterilir

9.4.7 Non-Fonksiyonel Gereksinimler
* Seans detay sayfas? < 200ms yüklenmeli
* Rapor editörü mobil uyumlu olmal?
* Metin alanlar?nda autosave olabilir (opsiyonel)
* Zoom entegrasyonu h?zl? ve kesintisiz olmal?
* Seans i?lemleri için optimistik UI önerilmeli
? 9.5 Uzman Mesajla?ma – FDD Tasla??
Mesajla?ma, uzman ile dan??an?n seans öncesi/sonras? ileti?im kurdu?u ikinci en kritik modüldür.
Zoom görü?mesi d???nda tüm bilgi al??veri?i buradan akar.

9.5.1 Amaç
Bu modül, uzmanin dan??anlar?yla:
* Yaz?l? ileti?im kurabilmesini
* Seans öncesi sorular? alabilmesini
* Seans sonras? yönlendirme yapabilmesini
* Raporlara ek aç?klamalar gönderebilmesini
* Bildirimlerle an?nda haberdar olmas?n?
sa?lar.
Mesajla?ma, dan??an deneyimini ki?iselle?tiren ana unsurlardan biridir.

9.5.2 Roller
* Uzman ? tam yetki (mesaj gönderir, al?r)
* Dan??an ? mesaj gönderir, al?r
* Admin ? sadece moderasyon amaçl? meta veriyi görebilir (içerik gizlidir)

9.5.3 Ekran Bile?enleri
Mesajla?ma 2 ana ekrandan olu?ur:
1. Konu?malar Listesi
2. Mesajla?ma Ekran? (Chat)

9.5.3.1 Konu?malar Listesi
Sol panelde (mobilde üst k?s?mda) dan??an listesi:
Her sat?rda:
* Dan??an ad?
* Profil foto?raf?
* Son mesajdan k?sa özet
* Son mesaj zaman?
* Okunmam?? mesaj say?s? (badge ? k?rm?z?)
S?ralama:
* En son mesaj atan en üstte
* Okunmam?? mesaj? olanlar öncelikli (pin etkisi olmadan)
Bo? Durum:
“Henüz konu?ma ba?lat?lmam??.”
CTA ? Dan??anlar?m sayfas?na yönlendirilebilir (opsiyonel)

9.5.3.2 Mesajla?ma Ekran? (Chat Window)
Üst ba?l?k:
* Dan??an ad?
* Profil foto
* K?sa bilgi (“Son seans: 2 gün önce”, “Birlikte 4 seans tamamland?”) ? opsiyonel bilgi

Mesaj balonlar?:
* Uzman mesaj? ? sa?da
* Dan??an mesaj? ? solda
* Tarih damgas?
* Okundu bilgisi (?? opsiyonel)
Maksimum mesaj uzunlu?u: 300 karakter (MVP)
Uzman, dan??ana görünmeyen mesaj gönderemez (gizli not yoktur).

Mesaj Yazma Alan?:
* Metin kutusu
* “Gönder” butonu
* Enter ? gönder
* Bo? mesaj engellenir
* Flood kontrol: saniyede max 3 mesaj
Dosya / görsel gönderimi MVP’de yok
(Not: Faz 2 için ay?r?yoruz.)

9.5.4 Kullan?c? Ak??lar?

9.5.4.1 Konu?ma Açma / Seçme Ak???
1. Uzman konu?ma listesinden bir dan??an? seçer
2. Chat ekran? aç?l?r
3. Otomatik olarak okunmam?? mesajlar okunmu? olarak i?aretlenir
4. Bildirim balonu kaybolur

9.5.4.2 Mesaj Gönderme Ak???
1. Uzman mesaj? yazar
2. Gönder’e basar
3. Mesaj backend’e iletilir
4. Ekranda optimistic UI ile hemen görünür
5. Dan??ana anl?k bildirim gider

9.5.4.3 Mesaj Alma Ak???
1. Dan??an mesaj gönderir
2. Uzman ekran?nda anl?k görünür
3. Bildirim balonu konu?ma listesinde görünür
4. Chat aç?ksa ? mesaj an?nda okunmu? olur

9.5.4.4 Konu?ma Ba?latma (Sistem Taraf?ndan)
Bir dan??an ile konu?ma otomatik aç?l?r:
* ?lk seans olu?turuldu?unda
* ?lk rapor gönderildi?inde
* ?lk mesaj geldi?inde
Uzmanin konu?ma ba?latmas?na gerek yoktur.

9.5.5 ?? Kurallar?
* Her uzman–dan??an çifti için tek bir konu?ma thread’i bulunur
* Mesajlar silinemez (MVP)
* Mesaj içeri?i admin taraf?ndan görülemez
o Admin sadece: timestamp, senderType, messageLength görür
* Hakaret/istenmeyen içerik için otomatik flag sistemi
* Flood/spam korumas? her kullan?c?ya uygulan?r
* Okunmam?? mesaj say?s? gerçek zamanl? güncellenir
* Mesajlar encryption-at-rest ve TLS ile korunur

9.5.6 Edge Case’ler
* Ba?lant? yok ? “Mesaj gönderilemedi, yeniden dene”
* Uzman hesab? pasif ? mesaj gönderilemez
* Dan??an hesab? silinmi? ? konu?ma sadece geçmi? olarak görünür, kilitlenir
* Çok uzun mesaj ? “Mesaj en fazla 300 karakter olabilir.”

9.5.7 Non-Fonksiyonel Gereksinimler
* Mesaj gönderim gecikmesi < 150 ms
* WebSocket/SignalR altyap?s? zorunlu
* Chat mobilde tam ekran kullan?ma uygun olmal?
* Yüksek mesaj hacmine dayan?kl? altyap?
* Flood/spam korumal? rate limiting sistemi
? 9.6 Kazanç & Ödeme Yönetimi – FDD Tasla??
Bu modül, uzmanin platform üzerinden kazand??? ücretleri, ödeme durumlar?n? ve gelir geçmi?ini takip etmesini sa?lar.
Platform bir pazar yeri oldu?undan, tüm para ak??? platform ? uzman mant??? ile ilerler.

9.6.1 Amaç
Uzmane:
* Seans bazl? kazançlar?n?
* Günlük / haftal?k / ayl?k gelir özetini
* Bekleyen ödemelerini
* Tamamlanm?? ödeme geçmi?ini
* Komisyon bilgilerinin nas?l uyguland???n?
?effaf ve anla??l?r ?ekilde gösterme amac? ta??r.
Bu modül, platform güveni aç?s?ndan son derece kritiktir.

9.6.2 Roller
* Uzman ? Tüm kazanç bilgilerini görüntüler
* Admin ? Tüm kazançlar? tam yetkiyle görüntüler, ödemeleri i?aretler
* Dan??an ? eri?emez

9.6.3 Ekran Bile?enleri
Kazanç ekran? üç ana bölüm içerir:
1. Kazanç Özeti (Summary Cards)
2. Bekleyen Ödemeler (Payouts Pending)
3. Ödeme Geçmi?i (Completed Payouts)
4. Seans Bazl? Kazanç Detay? (Earnings per Session)

9.6.3.1 Kazanç Özeti
Dashboard tarz?nda kartlar:
Kart 1 — Bu Ayki Kazanç
* Ay boyunca tamamlanan seanslardan kazan?lan toplam tutar
* Komisyon dü?ülmü? net kazanç gösterilir
* Alt sat?r: “Toplam X seans”
Kart 2 — Bekleyen Ödemeler
* Henüz uzmane aktar?lmam?? toplam tutar
* Ödemelerin tarihlerine göre özet gösterim
* Alt sat?r: “Son ödeme tarihi: DD/MM/YYYY”
Kart 3 — Toplam Kazanç (Tüm Zamanlar)
* Platforma kat?ld???ndan beri kazan?lan toplam tutar
* Grafik için k?sa metrik: Ay/Ay % de?i?im (opsiyonel)

9.6.3.2 Bekleyen Ödemeler (Payouts Pending)
Bu bölümde:
* Ödeme bekleyen tüm kazanç kalemleri listelenir
* Admin henüz “ödeme yap?ld?” olarak i?aretlememi?tir
* Her sat?r bir ödeme havuzudur (haftal?k/ayl?k batch verilebilir)
Her sat?rda gösterilir:
* Ödeme dönemi (örn. 01–15 Aral?k)
* Tutar (komisyon sonras? net kazanç)
* Durum: Beklemede / ?ncelemede
* Tahmini ödeme tarihi (örn. “Ay?n 15’i”)
Admin taraf?nda:
* “Ödeme yap?ld?” butonu
* Ödeme dekontu ekleme alan? (ileriki faz)
Not: Uzman taraf?nda hiçbir düzenleme izin verilmez.

9.6.3.3 Ödeme Geçmi?i (Completed Payouts)
Uzmanin bugüne kadar ald??? tüm ödemeler:
Her sat?rda:
* Ödenen tutar
* Ödemenin yap?ld??? tarih
* Dönem (örn. Aral?k 1–15)
* Referans kodu / i?lem ID (opsiyonel)
Filtreler:
* Tarih aral???
* Dönem
* Tutar aral???

9.6.3.4 Seans Bazl? Kazanç Detay?
Uzmane ?effafl?k sa?lamak için:
Liste format?:
TarihDan??anPaketSeans Tutar?Platform Pay?Net KazançKurallar:
* Tüm seanslar listelenir (tamamlanm?? olanlar)
* Platform pay? (%) admin panelinden yönetilir
* Net kazanç = Tutar – Komisyon
* No-show durumunda:
o Paket hakk? dü?er
o Kazanç normal ?ekilde yans?r
Bu tablo özellikle “hesaplama nas?l yap?l?yor?” sorular?n? önler.

9.6.4 Kullan?c? Ak??lar?

9.6.4.1 Ödeme Takip Ak??? (Uzman)
1. Uzman kazanç paneline girer
2. Bekleyen tutarlar görülür
3. Tahmini ödeme tarihini kontrol eder
4. Ödeme yap?ld???nda statü “Ödendi” olur
5. Ödeme geçmi?inden tüm ödemeleri görebilir

9.6.4.2 Ödeme Onay Ak??? (Admin)
1. Admin bekleyen ödemeler listesine girer
2. Dönemi ve tutarlar? kontrol eder
3. Ödemeyi sistem d???nda (örn. banka transferi) gerçekle?tirir
4. Panelde “Ödeme Yap?ld?” butonuna basar
5. Ödeme geçmi?i tablosuna kay?t dü?ülür

9.6.4.3 Seans Kazanç Detay? ?nceleme Ak???
1. Uzman seans bazl? kazanç tablosunu açar
2. Her seans?n brüt ve net kazanc?n? görebilir
3. Gerekti?inde filtre kullan?r

9.6.5 ?? Kurallar?
* Platform komisyonu varsay?lan olarak %30’dur (de?i?tirilebilir).
* Ödemeler haftal?k veya ayl?k periyotta gerçekle?ebilir (yap? esnek b?rak?lmal?d?r).
* Ödemeler manuel yap?l?r ? panel yaln?zca “i?lendi” statüsü verir.
* Admin her ödeme sat?r?n? tek tek onaylar.
* Uzman ödemeleri düzenleyemez, sadece görüntüler.
* Tutarlar daima net olarak gösterilir (brüt ? platform pay? ? net).
* No-show ? uzman kazanc? normal ?ekilde yaz?l?r.
* ?ptal edilen seans ? kazanç yaz?lmaz.

9.6.6 Edge Case’ler
* Ödeme dönemi bo? ? “Henüz ödeme bekleyen kazanc?n?z bulunmamaktad?r.”
* Admin yanl?? ödeme i?aretledi ? admin taraf?ndan geri al?nabilir
* Kazanç tablosu yüklenemedi ? “Kazanç bilgileriniz ?u anda görüntülenemiyor.”
* Zaman dilimi fark? ? ödeme zamanlar? her kullan?c? bölgesine göre gösterilir (opsiyonel)

9.6.7 Non-Fonksiyonel Gereksinimler
* Kazanç ekran? < 200 ms yüklenmeli
* Büyük listeler için server-side pagination zorunlu
* Finansal veriler encryption-at-rest ile saklanmal?
* Tüm ödeme hareketleri audit log’da tutulmal?
* Mobilde özet kartlar stacked formatta görünmeli
? 9.7 Dan??an Yönetimi – FDD Tasla?? (Eklenecek Metin)
Bu modül, uzmanin hizmet verdi?i dan??anlar? sistem üzerinden düzenli biçimde görüntülemesini, geçmi? ve yakla?an seans bilgilerine ula?mas?n?, dan??an hakk?nda temel verilere eri?mesini ve h?zl? aksiyonlar almas?n? sa?lar.

9.7.1 Amaç
Uzmane:
* Kendi dan??anlar?n? listeleme
* Dan??an geçmi?ini inceleme
* Dan??an hakk?nda h?zl? bilgilere eri?me
* H?zl? mesaj gönderme
* Geçmi? seans raporlar?na ula?ma
* Yeni seans olu?turma (opsiyon / Faz 2)
yetkilerini sunar.
Bu modül, uzmanin operasyonel verimlili?ini art?r?r.

9.7.2 Roller
RolYetkiUzmanTüm dan??an listesine eri?ir, dan??an detay?n? görüntüler, mesaj gönderebilir.AdminTüm dan??an listelerini read-only görüntüleyebilir.Client (Dan??an)Bu ekrana eri?emez.
9.7.3 Ekran Bile?enleri
Modül 3 ana ekrandan olu?ur:
1. Dan??an Listesi
2. Dan??an Arama & Filtreleme
3. Dan??an Detay Kart?

9.7.3.1 Dan??an Listesi
Liste görünümünde her sat?r/kart ?u bilgileri içerir:
* Profil foto?raf?
* Ad Soyad
* Toplam seans say?s?
* Son yap?lan seans tarihi
* Ortalama de?erlendirme puan? (opsiyon)
* H?zl? aksiyon ikonlar?:
o Mesaj gönder (chat aç?l?r)
o Detay (detay kart? aç?l?r)
Liste ?? Kurallar?
* Yaln?zca bu uzmanin seans yapt??? dan??anlar görünür.
* ?lk seans sonucu otomatik dan??an listesini olu?turur.
* Liste varsay?lan olarak son seansa göre s?ralan?r.
* Admin tüm dan??an listelerini görünür ancak hiçbir i?lem yapamaz (read-only).

9.7.3.2 Arama & Filtreleme
Arama
* Dan??an ad? ile arama
* Minimum 2 karakter
* 300ms debounce
Filtreler (MVP)
* Son seansa göre filtre (Bu hafta / Bu ay / Tümü)
* Seans durumu (Aktif dan??anlar, yaln?zca 1 kez görü?ülenler vb.)
Gelecek Faz
* Dan??an hedefleri / etiket bazl? filtre
* Seans say?s?na göre filtre
* Yeni eklenenler

9.7.3.3 Dan??an Detay Kart?
Uzman bir dan??ana t?klad???nda aç?lan detay paneli / sayfas? a?a??dakileri içerir:
Üst Bilgi (Header)
* Profil foto?raf?
* Ad Soyad
* Telefon / e-posta (masked)
* Toplam seans say?s?
* Ortalama puan (opsiyon)
Seans Özeti
* Son seans tarihi
* Bir sonraki seans (varsa)
* Durum: aktif / pasif
H?zl? Aksiyonlar
* Mesaj Gönder
* Seans Detaylar?n? Gör
* Yeni Seans Slotu Öner (Faz 2)
* Seans Raporlar?n? Aç
Geçmi? Seanslar Listesi
Her seans için:
* Tarih & saat
* Durum (Tamamland? / No-show / ?ptal)
* “Raporu Görüntüle”
* “Mesajla?may? Aç”
Not Alan? (Faz 2)
* Uzmane özel, dan??ana görünmeyen k?sa not alan?
? Bu MVP’de yer almayacak, S2 için uygun.

9.7.4 Kullan?c? Ak??lar?
9.7.4.1 Dan??an Görüntüleme Ak???
1. Uzman “Dan??anlar” menüsüne t?klar.
2. Varsay?lan liste yüklenir.
3. Uzman dan??an? seçer ? detay aç?l?r.

9.7.4.2 H?zl? Mesaj Gönderme Ak???
1. Uzman listeden dan??an? seçer.
2. “Mesaj Gönder” ikonuna basar.
3. Chat ekran? ilgili thread ile otomatik aç?l?r.

9.7.4.3 Seans Raporu ?nceleme Ak???
1. Dan??an detay ekran? aç?l?r.
2. Geçmi? seanslardan biri seçilir.
3. “Raporu Görüntüle” modal? aç?l?r.

9.7.4.4 Admin Read-Only Ak???
1. Admin tüm uzmanlerin dan??an listelerini görebilir.
2. Detay ekran?n? açabilir ancak:
o Mesaj gönderemez
o Not ekleyemez
o Seans öneremez
o Rapor düzenleyemez
Sadece görüntüleyebilir.

9.7.5 ?? Kurallar?
* Uzman yaln?zca kendi dan??anlar?n? görüntüleyebilir.
* Client bilgileri KVKK gere?i maskeli olabilir (örn. e-posta yar?m gösterim).
* Pasif dan??anlar listede ayr? kategori olarak gösterilebilir.
* Dan??an, uzmanin listesinden silinemez (geçmi? sa?l?k verisi nedeniyle).
* Dan??an sadece platform taraf?ndan aktif/pasif statüye al?nabilir.
* Yeni dan??an, ilk seans olu?turuldu?unda otomatik eklenir.

9.7.6 Edge Case’ler
* Dan??an?n hesab? silinmi? ? “Bu dan??an art?k aktif de?ildir” notu gösterilir.
* Hiç dan??an? olmayan uzman ? > “Henüz bir dan??an?n?z bulunmamaktad?r.”
> CTA ? Takvim Aç / Profilini Düzenle
* Geçmi? seans yoksa ? seans listesi bo? görünür.
* Mesajla?ma kapal?ysa (uzman pasif) ? mesaj gönderilemez.

9.7.7 Non-Fonksiyonel Gereksinimler
* Dan??an listesi < 200 ms’de yüklenmeli.
* Filtreleme server-side yap?lmal?.
* Arama yüksek performansl? olmal? (indexlenmi? alanlar).
* Mobil uyumluluk zorunlu.
* Tüm i?lemler audit log’a yaz?lmal? (liste eri?imleri dahil).


