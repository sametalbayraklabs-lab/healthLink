# HealthLink - Teknik Borç Dökümanı

**Oluşturulma Tarihi**: 26 Ocak 2026  
**Son Güncelleme**: 26 Ocak 2026

## Özet

Bu döküman, HealthLink projesinde hızlı geliştirme sürecinde alınan kısa vadeli kararları ve gelecekte düzeltilmesi gereken teknik borçları listeler.

---

## 🔴 Kritik Öncelikli

### 1. Authentication & Authorization Güvenliği

**Durum**: Geliştirme kolaylığı için JWT doğrulama tamamen devre dışı bırakıldı.

**Mevcut Durum**:
```csharp
// Program.cs
options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuer = false,           // ❌ Issuer doğrulanmıyor
    ValidateAudience = false,         // ❌ Audience doğrulanmıyor
    ValidateLifetime = false,         // ❌ Token süresi kontrol edilmiyor
    ValidateIssuerSigningKey = false, // ❌ İmza doğrulanmıyor
    RequireSignedTokens = false,      // ❌ İmzasız token kabul ediliyor
    SignatureValidator = (token, parameters) => new JwtSecurityToken(token) // ❌ İmza bypass
};
```

**Riskler**:
- ⚠️ Herhangi bir kullanıcı başka kullanıcı adına işlem yapabilir
- ⚠️ Token süresi dolmuş olsa bile geçerli sayılır
- ⚠️ Sahte token'lar kabul edilir
- ⚠️ Production'a bu şekilde çıkılamaz

**Yapılması Gerekenler**:
1. JWT secret key oluştur ve güvenli şekilde sakla (appsettings.json veya environment variable)
2. Token validation'ı aktif et:
   ```csharp
   ValidateIssuer = true,
   ValidateAudience = true,
   ValidateLifetime = true,
   ValidateIssuerSigningKey = true,
   RequireSignedTokens = true,
   IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
   ```
3. Tüm korumalı endpoint'lere `[Authorize]` attribute ekle
4. Role-based authorization ekle (`[Authorize(Roles = "Client")]`)

**Tahmini Süre**: 4-6 saat  
**Öncelik**: P0 (Production öncesi mutlaka)

---

### 2. Password Hashing Güvenliği

**Durum**: Şifre hashing algoritması güçlendirilmeli.

**Mevcut Durum**:
- PBKDF2 kullanılıyor (iyi)
- Iteration count ve salt size kontrol edilmeli

**Yapılması Gerekenler**:
1. Iteration count'u en az 100,000'e çıkar (şu anki değeri kontrol et)
2. Salt size minimum 128-bit olmalı
3. Argon2id gibi modern algoritma değerlendirilmeli

**Tahmini Süre**: 2-3 saat  
**Öncelik**: P1

---

## 🟡 Yüksek Öncelikli

### 3. CORS Politikası

**Durum**: Tüm origin'lere izin veriliyor.

**Mevcut Durum**:
```csharp
policy.AllowAnyOrigin()
      .AllowAnyMethod()
      .AllowAnyHeader();
```

**Yapılması Gerekenler**:
1. Sadece frontend URL'ine izin ver:
   ```csharp
   policy.WithOrigins("http://localhost:3000", "https://healthlink.com")
         .AllowAnyMethod()
         .AllowAnyHeader()
         .AllowCredentials();
   ```

**Tahmini Süre**: 1 saat  
**Öncelik**: P1

---

### 4. Database Query Optimizasyonu

**Durum**: Bazı LINQ sorguları verimsiz.

**Örnekler**:
1. **ClientService.GetDashboardAsync**: Unread messages sorgusu birden fazla kez değiştirildi
2. **N+1 Query Problem**: Include() kullanımı eksik olabilir

**Yapılması Gerekenler**:
1. Tüm service metodlarında `.Include()` kullanımını gözden geçir
2. Gereksiz database round-trip'leri tespit et
3. Query performance profiling yap
4. Index'leri gözden geçir (özellikle foreign key'ler)

**Tahmini Süre**: 8-12 saat  
**Öncelik**: P2

---

### 5. Error Handling & Logging

**Durum**: Global exception handler var ama logging eksik.

**Yapılması Gerekenler**:
1. Structured logging ekle (Serilog önerilir)
2. Log levels düzgün kullanılmalı (Debug, Info, Warning, Error, Critical)
3. Sensitive data log'lanmamalı (şifreler, token'lar)
4. Application Insights veya benzeri monitoring tool entegrasyonu

**Tahmini Süre**: 6-8 saat  
**Öncelik**: P2

---

## 🟢 Orta Öncelikli

### 6. Frontend TypeScript Lint Hataları

**Durum**: MUI Grid2 compatibility uyarıları.

**Etkilenen Dosyalar**:
- `/client/dashboard/page.tsx`
- `/client/experts/page.tsx`
- `/client/packages/[id]/page.tsx`

**Hata**:
```
Property 'item' does not exist on type 'GridBaseProps'
```

**Yapılması Gerekenler**:
1. MUI Grid2 doğru kullanımını araştır
2. Grid props'ları düzelt veya Grid (v1) kullan
3. TypeScript strict mode'da hata vermeyen kod yaz

**Tahmini Süre**: 2-3 saat  
**Öncelik**: P3

---

### 7. API Response Standardizasyonu

**Durum**: Bazı endpoint'ler farklı response formatları kullanıyor.

**Yapılması Gerekenler**:
1. Tüm API response'ları için standard format:
   ```json
   {
     "success": true,
     "data": {...},
     "message": "Success",
     "errors": []
   }
   ```
2. Error response'ları için standard format
3. Pagination için standard format

**Tahmini Süre**: 4-6 saat  
**Öncelik**: P3

---

### 8. Input Validation

**Durum**: Backend validation eksik veya tutarsız.

**Yapılması Gerekenler**:
1. FluentValidation ekle
2. Tüm DTO'lara validation rules ekle
3. Frontend'de de validation ekle (yup veya zod)
4. Validation error messages Türkçe olmalı

**Tahmini Süre**: 8-10 saat  
**Öncelik**: P3

---

## 🔵 Düşük Öncelikli

### 9. Code Duplication

**Durum**: Bazı kodlar tekrar ediyor.

**Örnekler**:
- Expert type mapping (Dietitian → Diyetisyen) birden fazla yerde
- Gender enum mapping
- Date formatting

**Yapılması Gerekenler**:
1. Shared helper functions oluştur
2. Extension methods kullan
3. Constants dosyası oluştur

**Tahmini Süre**: 4-6 saat  
**Öncelik**: P4

---

### 10. Test Coverage

**Durum**: Unit test ve integration test yok.

**Yapılması Gerekenler**:
1. xUnit test projesi oluştur
2. Service layer için unit testler
3. Controller'lar için integration testler
4. Frontend için Jest/React Testing Library testleri
5. Minimum %70 code coverage hedefle

**Tahmini Süre**: 20-30 saat  
**Öncelik**: P4

---

### 11. Documentation

**Durum**: API documentation eksik.

**Yapılması Gerekenler**:
1. Swagger/OpenAPI documentation'ı iyileştir
2. XML comments ekle
3. README.md dosyalarını güncelle
4. Architecture decision records (ADR) oluştur

**Tahmini Süre**: 6-8 saat  
**Öncelik**: P4

---

## 📊 Öncelik Matrisi

| Kategori | P0 (Kritik) | P1 (Yüksek) | P2 (Orta) | P3 (Düşük) | P4 (İsteğe Bağlı) |
|----------|-------------|-------------|-----------|------------|-------------------|
| **Güvenlik** | #1 Auth | #2 Password, #3 CORS | #5 Logging | #8 Validation | - |
| **Performance** | - | - | #4 Query Optimization | - | - |
| **Code Quality** | - | - | - | #6 TypeScript, #7 API Standard, #9 Duplication | #10 Tests, #11 Docs |

---

## 🎯 Önerilen Roadmap

### Sprint 1 (1-2 hafta) - Production Hazırlık
- [ ] #1 Authentication & Authorization düzelt
- [ ] #2 Password hashing güçlendir
- [ ] #3 CORS politikası düzelt
- [ ] #5 Logging ekle

### Sprint 2 (2-3 hafta) - Optimizasyon
- [ ] #4 Database query optimizasyonu
- [ ] #8 Input validation
- [ ] #7 API standardizasyonu

### Sprint 3 (3-4 hafta) - Code Quality
- [ ] #6 TypeScript lint hataları
- [ ] #9 Code duplication temizliği
- [ ] #10 Test coverage başlat

### Backlog
- [ ] #11 Documentation iyileştirme
- [ ] #10 Test coverage tamamla

---

## 📝 Notlar

- Bu döküman sürekli güncellenmelidir
- Her teknik borç için GitHub issue oluşturulmalı
- Production'a çıkmadan önce en az P0 ve P1 itemler tamamlanmalı
- Her sprint sonunda teknik borç review yapılmalı

---

**Son Güncelleme**: 26 Ocak 2026  
**Güncelleyen**: AI Assistant
