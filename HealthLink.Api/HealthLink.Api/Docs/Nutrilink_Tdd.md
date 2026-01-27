1. Genel Notlar
* PK alan?: Her tabloda Id (bigint, identity)
* FK alanlar?: UserId, ClientId, ExpertId, AppointmentId vb.
* Tarih alanlar?: CreatedAt, UpdatedAt (nullable olabilir)
* String alanlar için tip: nvarchar(…) (veya PostgreSQL’de text)

2. Kullan?c? ve Rol Tablolar?
2.1 User
Amaç:
Sisteme giri? yapan herkesin temel kimli?i.
Alanlar:
* Id (bigint, PK)
* Email (nvarchar(256), unique, not null)
* PasswordHash (nvarchar(max), not null)
* PasswordSalt (nvarchar(max), not null)
* Phone (nvarchar(32), nullable)
* IsActive (bit, not null, default = 1)
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)

2.2 Client
Amaç:
Platformdan hizmet alan son kullan?c? (dan??an / üye).
Alanlar:
* Id (bigint, PK)
* UserId (bigint, FK ? User.Id, unique, not null)
* FirstName (nvarchar(100), not null)
* LastName (nvarchar(100), not null)
* BirthYear (int, nullable)
* Gender (nvarchar(20), nullable) // (“Male”, “Female”, “Other”, “PreferNotToSay” vb.)
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)

2.3 Expert
Amaç:
Diyetisyen, psikolog, spor e?itmeni vb. tüm uzmanlar.
Alanlar:
* Id (bigint, PK)
* UserId (bigint, FK ? User.Id, unique, not null)
* ExpertType (nvarchar(50), not null)
// “Dietitian”, “Psychologist”, “Trainer”, “Physiotherapist” vb.
* DisplayName (nvarchar(150), not null) // Profilde görünen ad
* Bio (nvarchar(max), nullable)
* City (nvarchar(100), nullable)
* WorkType (nvarchar(20), not null)
// “Online”, “Offline”, “Hybrid”
* ExperienceYear (int, nullable)
* Status (nvarchar(20), not null)
// “Pending”, “Approved”, “Rejected”, “Passive”
* AverageRating (decimal(3,2), not null, default = 0) // Örn: 4.75
* TotalReviewCount (int, not null, default = 0)
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)

3. Uzmanl?k Tablolar?
3.1 Specialization
Amaç:
Tüm bran?lar için uzmanl?k alanlar?.
Alanlar:
* Id (bigint, PK)
* Name (nvarchar(150), not null) // “Kilo Verme”, “Sporcu Beslenmesi”, “Klinik Psikoloji” vb.
* ExpertType (nvarchar(50), nullable)
// Bu uzmanl?k hangi tür experte ait: “Dietitian”, “Psychologist”, “Trainer” veya null = genel
* Category (nvarchar(50), nullable) // “Nutrition”, “Mental”, “Sport” vb.
* IsActive (bit, not null, default = 1)

3.2 ExpertSpecialization
Amaç:
Expert ? Specialization many-to-many ili?ki tablosu.
Alanlar:
* Id (bigint, PK)
* ExpertId (bigint, FK ? Expert.Id, not null)
* SpecializationId (bigint, FK ? Specialization.Id, not null)
* CreatedAt (datetime, not null)
Benzersizlik kural?:
* (ExpertId, SpecializationId) için unique index.

4. Paket ve Ödeme Tablolar?
4.1 ServicePackage
Amaç:
Sat?labilir paket tan?mlar? (Tek seans, 4’lü, 10’lu vb).
Alanlar:
* Id (bigint, PK)
* Name (nvarchar(150), not null)
* Description (nvarchar(max), nullable)
* ExpertType (nvarchar(50), nullable)
// “Dietitian” ise sadece diyetisyenler için, null = tüm expert’ler
* SessionCount (int, not null)
* Price (decimal(18,2), not null)
* Currency (nvarchar(10), not null, default = “TRY”)
* IsActive (bit, not null, default = 1)
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)

4.2 ClientPackage
Amaç:
Bir dan??ana atanm?? somut paket kayd?.
Alanlar:
* Id (bigint, PK)
* ClientId (bigint, FK ? Client.Id, not null)
* ServicePackageId (bigint, FK ? ServicePackage.Id, not null)
* TotalSessions (int, not null) // Tan?mland??? anda SessionCount’tan gelir
* UsedSessions (int, not null, default = 0)
* Status (nvarchar(20), not null)
// “Active”, “Completed”, “Expired”, “PendingPayment”
* PurchaseDate (datetime, not null)
* ExpireDate (datetime, nullable)
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)

4.3 Payment
Amaç:
Ödeme i?lemi log’u (iyzico entegrasyonu).
Alanlar:
* Id (bigint, PK)
* ClientId (bigint, FK ? Client.Id, not null)
* ClientPackageId (bigint, FK ? ClientPackage.Id, nullable)
* Gateway (nvarchar(50), not null) // “iyzico”
* GatewayPaymentId (nvarchar(200), nullable)
* Amount (decimal(18,2), not null)
* Currency (nvarchar(10), not null)
* Status (nvarchar(20), not null)
// “Pending”, “Success”, “Failed”
* CreatedAt (datetime, not null)
* ConfirmedAt (datetime, nullable)
* RawResponse (nvarchar(max), nullable) // opsiyonel, gateway JSON

4.4 DiscountCode
Amaç:
?ndirim kodlar?.
Alanlar:
* Id (bigint, PK)
* Code (nvarchar(50), unique, not null)
* Description (nvarchar(250), nullable)
* DiscountType (nvarchar(20), not null) // “Percentage”, “Fixed”
* Value (decimal(18,2), not null)
* ValidFrom (datetime, not null)
* ValidTo (datetime, not null)
* MaxUsageCount (int, nullable)
* UsedCount (int, not null, default = 0)
* ApplicableExpertType (nvarchar(50), nullable)
* IsActive (bit, not null, default = 1)
* CreatedAt (datetime, not null)

4.5 PaymentDiscountUsage
Amaç:
Bir ödeme hangi indirim kodunu kulland?.
Alanlar:
* Id (bigint, PK)
* PaymentId (bigint, FK ? Payment.Id, not null)
* DiscountCodeId (bigint, FK ? DiscountCode.Id, not null)
* AppliedAmount (decimal(18,2), not null)
* CreatedAt (datetime, not null)

5. Randevu / Seans & Takvim Tablolar?
5.1 Appointment
Amaç:
Client ? Expert seans kayd?.
Alanlar:
* Id (bigint, PK)
* ClientId (bigint, FK ? Client.Id, not null)
* ExpertId (bigint, FK ? Expert.Id, not null)
* ClientPackageId (bigint, FK ? ClientPackage.Id, nullable)
* ServiceType (nvarchar(50), not null)
// “NutritionSession”, “TherapySession”, “TrainingSession” vb.
* StartDateTime (datetime, not null)
* EndDateTime (datetime, not null)
* ZoomLink (nvarchar(500), nullable)
* Status (nvarchar(30), not null)
// “Scheduled”, “Completed”, “CancelledByClient”, “CancelledByExpert”, “NoShow”
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)

5.2 AppointmentNote
Amaç:
Dan??an?n kendi seans notlar? (sadece kendisi görür).
Alanlar:
* Id (bigint, PK)
* AppointmentId (bigint, FK ? Appointment.Id, not null)
* ClientId (bigint, FK ? Client.Id, not null)
* NoteText (nvarchar(1000), not null)
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)

5.3 AppointmentReport
Amaç:
Uzman?n seans sonras? raporu.
Alanlar:
* Id (bigint, PK)
* AppointmentId (bigint, FK ? Appointment.Id, not null)
* ExpertId (bigint, FK ? Expert.Id, not null)
* ReportText (nvarchar(max), not null)
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)

5.4 ExpertScheduleTemplate
Amaç:
Uzman?n haftal?k çal??ma ?ablonu.
Alanlar:
* Id (bigint, PK)
* ExpertId (bigint, FK ? Expert.Id, not null)
* DayOfWeek (int, not null) // 0–6
* IsOpen (bit, not null)
* WorkStartTime (time, nullable)
* WorkEndTime (time, nullable)
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)

5.5 ExpertScheduleException
Amaç:
Tatil, özel bloklama gibi istisnalar.
Alanlar:
* Id (bigint, PK)
* ExpertId (bigint, FK ? Expert.Id, not null)
* Date (date, not null)
* Type (nvarchar(20), not null) // “Holiday”, “PartialClose”, “CustomBlock”
* StartTime (time, nullable)
* EndTime (time, nullable)
* Reason (nvarchar(250), nullable)
* CreatedAt (datetime, not null)

6. De?erlendirme & ?ikayet Tablolar?
6.1 Review
Amaç:
Seans sonras? puanlama ve yorum.
Alanlar:
* Id (bigint, PK)
* AppointmentId (bigint, FK ? Appointment.Id, not null)
* ClientId (bigint, FK ? Client.Id, not null)
* ExpertId (bigint, FK ? Expert.Id, not null)
* Rating (int, not null) // 1–5
* Comment (nvarchar(500), nullable)
* Status (nvarchar(20), not null) // “PendingApproval”, “Approved”, “Rejected”
* AdminNote (nvarchar(500), nullable)
* CreatedAt (datetime, not null)
* ReviewedAt (datetime, nullable)
* ReviewedByAdminId (bigint, FK ? User.Id, nullable)

6.2 Complaint
Amaç:
?ikayet ve destek kay?tlar?.
Alanlar:
* Id (bigint, PK)
* ClientId (bigint, FK ? Client.Id, nullable)
* ExpertId (bigint, FK ? Expert.Id, nullable)
* AppointmentId (bigint, FK ? Appointment.Id, nullable)
* Category (nvarchar(30), not null) // “Expert”, “System”, “Payment”
* Type (nvarchar(50), not null) // “Behaviour”, “NoShow”, “Technical”, “Other”
* Title (nvarchar(200), not null)
* Description (nvarchar(max), nullable)
* Status (nvarchar(20), not null) // “Open”, “InReview”, “Resolved”, “Rejected”
* AdminNote (nvarchar(500), nullable)
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)
* ClosedAt (datetime, nullable)

7. Mesajla?ma & Moderasyon
7.1 Conversation
Amaç:
Client ? Expert konu?ma ba?l???.
Alanlar:
* Id (bigint, PK)
* ClientId (bigint, FK ? Client.Id, not null)
* ExpertId (bigint, FK ? Expert.Id, not null)
* CreatedAt (datetime, not null)
* LastMessageAt (datetime, nullable)
* IsFrozen (bit, not null, default = 0)

7.2 Message
Amaç:
Konu?ma içindeki mesajlar.
Alanlar:
* Id (bigint, PK)
* ConversationId (bigint, FK ? Conversation.Id, not null)
* SenderUserId (bigint, FK ? User.Id, not null)
* MessageText (nvarchar(1000), not null)
* IsRead (bit, not null, default = 0)
* ReadAt (datetime, nullable)
* CreatedAt (datetime, not null)

7.3 ConversationFlag
Amaç:
Mesajla?ma ile ilgili ?ikayet / flag kay?tlar?.
Alanlar:
* Id (bigint, PK)
* ConversationId (bigint, FK ? Conversation.Id, not null)
* ReportedByUserId (bigint, FK ? User.Id, not null)
* Reason (nvarchar(250), not null)
* Status (nvarchar(20), not null) // “Open”, “InReview”, “Closed”
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)

8. ?çerik Tablolar? (Blog, Fit Tarifler)
8.1 ContentItem
Amaç:
Blog yaz?lar?, fit tarifler, duyurular.
Alanlar:
* Id (bigint, PK)
* Title (nvarchar(200), not null)
* SubTitle (nvarchar(300), nullable)
* Slug (nvarchar(200), unique, not null)
* Type (nvarchar(30), not null) // “Blog”, “Recipe”, “Announcement”
* Category (nvarchar(100), nullable)
* CoverImageUrl (nvarchar(500), nullable)
* BodyHtml (nvarchar(max), not null)
* SeoTitle (nvarchar(200), nullable)
* SeoDescription (nvarchar(300), nullable)
* Status (nvarchar(20), not null) // “Draft”, “PendingApproval”, “Published”, “Archived”
* AuthorUserId (bigint, FK ? User.Id, not null)
* PublishedAt (datetime, nullable)
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)

9. Sistem Ayarlar? ve Log
9.1 SystemSetting
Amaç:
Config de?erleri (komisyon oran?, seans süresi vb.).
Alanlar:
* Id (bigint, PK)
* Key (nvarchar(200), unique, not null)
* Value (nvarchar(max), not null)
* CreatedAt (datetime, not null)
* UpdatedAt (datetime, nullable)

9.2 AuditLog
Amaç:
Admin ve kritik kullan?c? aksiyonlar?n? loglamak.
Alanlar:
* Id (bigint, PK)
* UserId (bigint, FK ? User.Id, nullable)
* ActionType (nvarchar(100), not null) // “UpdateSystemSetting”, “ChangeStatus”, vs.
* TargetType (nvarchar(100), nullable) // “User”, “Appointment”, “Expert”, “Payment”
* TargetId (bigint, nullable)
* IpAddress (nvarchar(50), nullable)
* MetaJson (nvarchar(max), nullable)
* CreatedAt (datetime, not null)
