# Tek Kişilik Git Çalışma Rehberi (Hızlı ve Güvenli)

Bu proje için Git kullanarak çalışırken, karmaşık süreçlere (büyük takımların kullandığı "Git Flow" gibi) ihtiyacınız yoktur. Tek başınıza geliştirme yaparken en önemli iki şey **hız** ve **kod güvenliğidir** (yedekleme ve geçmişe dönebilme).

## Ön Hazırlık

> [!WARNING]
> Şu anki terminalinizde `git` komutu bulunamadı. Lütfen Git'in bilgisayarınızda yüklü olduğundan ve PATH'e eklendiğinden emin olun. [Git İndir](https://git-scm.com/downloads)

## Temel Döngü (Hızlı Çalışma)

Geliştirme yaparken şu döngüyü takip edin:

1. **Kodla**: Kodunuzda değişiklikler yapın.
2. **Kontrol Et**: Hangi dosyaların değiştiğini görün.
   ```bash
   git status
   ```
3. **Sahnele (Staging)**: Tüm değişiklikleri tek seferde ekleyin (Hız için).
   ```bash
   git add .
   ```
4. **Kaydet (Commit)**: Ne yaptığınızı kısaca yazın.
   ```bash
   git commit -m "Login sayfası dizaynı eklendi"
   ```

*Bu döngüyü her mantıksal iş bitiminde (günde 5-10 kez) tekrarlayın. Sık commit atmak, hata yaptığınızda geri dönmeyi kolaylaştırır.*

## Güvenlik (Yedekleme)

Bilgisayarınız bozulursa kodunuzu kaybetmemek için kodunuzu uzak bir sunucuya (GitHub, GitLab, Bitbucket) gönderin.

1. **GitHub'da yeni bir repo oluşturun** (Boş olsun).
2. **Adresi ekleyin** (Sadece bir kez):
   ```bash
   git remote add origin https://github.com/KULLANICI_ADINIZ/PROJE_ADINIZ.git
   ```
3. **Gönder (Push)**: Gün sonunda veya önemli bir iş bitince.
   ```bash
   git push origin main
   ```

## İpuçları

- **.gitignore**: Gereksiz dosyaların (`bin`, `obj`, `node_modules`) takibini engeller. Projenizde zaten doğru yapılandırılmış bir `.gitignore` dosyası var.
- **Yanlışlık Oldu!**: Son değişikliği geri almak isterseniz:
  ```bash
  git checkout .
  ```
  *(Dikkat: Kaydedilmemiş değişiklikleri siler)*

## Deneysel Çalışma (Branch)

Eğer mevcut çalışan kodu bozma riski olan büyük bir değişiklik yapacaksanız, yeni bir dal (branch) açın:

1. **Dal Aç**:
   ```bash
   git checkout -b yeni-ozellik
   ```
2. **Çalış & Commit**
3. **Birleştir**: İşiniz bitince ana koda dönüp birleştirin.
   ```bash
   git checkout main
   git merge yeni-ozellik
   ```
