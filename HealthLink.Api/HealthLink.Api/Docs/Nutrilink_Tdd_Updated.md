1. Genel Tasarim Prensipleri

Tüm tablolar Id (bigint / long) primary key kullanir.

Enum alanlar:

Database: int

API: string

Tüm tarih alanlari UTC tutulur.

CreatedAt zorunlu, UpdatedAt opsiyoneldir.

Soft delete kullanilmaz, IsActive alani kullanilir.

EF Core + PostgreSQL uyumludur.

Bu doküman entity ve AppDbContext ile birebir uyumludur.

2. User
Alanlar
Alan	Tip	Zorunlu
Id	bigint	?
Email	nvarchar(256)	? (unique)
PasswordHash	nvarchar(max)	?
PasswordSalt	nvarchar(max)	?
Phone	nvarchar(32)	?
IsActive	bool	?
CreatedAt	datetime	?
UpdatedAt	datetime	?
3. Client
Alanlar
Alan	Tip	Zorunlu
Id	bigint	?
UserId	bigint	? (unique, FK ? User.Id)
FirstName	nvarchar(100)	?
LastName	nvarchar(100)	?
BirthDate	date/datetime	?
Gender	enum Gender	?
IsActive	bool	?
CreatedAt	datetime	?
UpdatedAt	datetime	?
Enum – Gender

Male

Female

Other

PreferNotToSay

4. Expert
Alanlar
Alan	Tip	Zorunlu
Id	bigint	?
UserId	bigint	? (unique, FK ? User.Id)
ExpertType	enum ExpertType	?
Status	enum ExpertStatus	?
DisplayName	nvarchar(150)	?
Bio	nvarchar(2000)	?
City	nvarchar(100)	?
WorkType	enum WorkType	?
ExperienceStartDate	date/datetime	?
AverageRating	decimal(3,2)	?
TotalReviewCount	int	?
IsActive	bool	?
CreatedAt	datetime	?
UpdatedAt	datetime	?
Enum – ExpertType

Dietitian

Psychologist

Trainer

Physiotherapist

All

Enum – WorkType

Online

Offline

Hybrid

5. Specialization
Alanlar
Alan	Tip	Zorunlu
Id	bigint	?
Name	nvarchar(256)	? (unique)
ExpertType	enum ExpertType	?
Category	enum SpecializationCategory	?
IsActive	bool	?
CreatedAt	datetime	?
UpdatedAt	datetime	?
Enum – SpecializationCategory

Nutrition

MentalHealth

Sports

Wellness

General

6. ExpertSpecialization
Alanlar
Alan	Tip	Zorunlu
ExpertId	bigint	? (PK, FK)
SpecializationId	bigint	? (PK, FK)

Composite Primary Key: (ExpertId, SpecializationId)

7. ServicePackage
Alanlar
Alan	Tip	Zorunlu
Id	bigint	?
Name	nvarchar(150)	?
Description	nvarchar(max)	?
ExpertType	enum ExpertType	?
SessionCount	int	?
Price	decimal(18,2)	?
Currency	nvarchar(10)	?
IsActive	bool	?
CreatedAt	datetime	?
UpdatedAt	datetime	?
8. ClientPackage
Alanlar
Alan	Tip	Zorunlu
Id	bigint	?
ClientId	bigint	? (FK)
ServicePackageId	bigint	? (FK)
TotalSessions	int	?
UsedSessions	int	?
Status	enum ClientPackageStatus	?
PurchaseDate	datetime	?
ExpireDate	datetime	?
CreatedAt	datetime	?
UpdatedAt	datetime	?
9. Payment
Alanlar
Alan	Tip	Zorunlu
Id	bigint	?
ClientId	bigint	? (FK)
ClientPackageId	bigint	? (unique FK)
Gateway	enum PaymentGateway	?
PaymentMethod	enum PaymentMethod	?
GatewayPaymentId	nvarchar(100)	?
Amount	decimal(18,2)	?
Currency	nvarchar(10)	?
Status	enum PaymentStatus	?
ProviderRawResponse	text	?
ConfirmedAt	datetime	?
CreatedAt	datetime	?
UpdatedAt	datetime	?
10. DiscountCode
Alanlar
Alan	Tip	Zorunlu
Id	bigint	?
Code	nvarchar(50)	? (unique)
Description	nvarchar(255)	?
DiscountType	enum DiscountType	?
DiscountValue	decimal(18,2)	?
ValidFrom	datetime	?
ValidTo	datetime	?
MaxUsageCount	int	?
UsedCount	int	?
ApplicableExpertType	enum ExpertType	?
IsActive	bool	?
CreatedAt	datetime	?
UpdatedAt	datetime	?
11. Appointment
Alanlar
Alan	Tip	Zorunlu
Id	bigint	?
ClientId	bigint	? (FK)
ExpertId	bigint	? (FK)
ClientPackageId	bigint	? (FK)
ServiceType	enum ServiceType	?
StartDateTime	datetime	?
EndDateTime	datetime	?
ZoomLink	nvarchar(500)	?
Status	enum AppointmentStatus	?
CreatedAt	datetime	?
UpdatedAt	datetime	?
12. AppointmentNote
Alanlar

Id (bigint, PK)

AppointmentId (bigint, FK)

ClientId (bigint, FK)

NoteText (nvarchar(1000))

CreatedAt (datetime)

UpdatedAt (datetime, nullable)

13. AppointmentReport
Alanlar

Id (bigint, PK)

AppointmentId (bigint, FK)

ExpertId (bigint, FK)

ReportText (text)

CreatedAt (datetime)

UpdatedAt (datetime, nullable)

14. ExpertScheduleTemplate
Alanlar

Id (bigint, PK)

ExpertId (bigint, FK)

DayOfWeek (int / enum)

IsOpen (bool)

WorkStartTime (time, nullable)

WorkEndTime (time, nullable)

CreatedAt (datetime)

UpdatedAt (datetime, nullable)

15. ExpertScheduleException
Alanlar

Id (bigint, PK)

ExpertId (bigint, FK)

Date (date)

Type (nvarchar(20))

StartTime (time, nullable)

EndTime (time, nullable)

Reason (nvarchar(250), nullable)

CreatedAt (datetime)

16. Review
Alanlar

Id (bigint, PK)

AppointmentId (bigint, unique FK)

ClientId (bigint, FK)

ExpertId (bigint, FK)

Rating (int)

Comment (nvarchar(500), nullable)

Status (enum ReviewStatus)

AdminNote (nvarchar(500), nullable)

CreatedAt (datetime)

ReviewedAt (datetime, nullable)

17. Complaint
Alanlar

Id (bigint, PK)

ClientId (bigint, FK)

ExpertId (bigint, FK)

AppointmentId (bigint, FK)

Category (enum ComplaintCategory)

Type (enum ComplaintType)

Status (enum ComplaintStatus)

Title (nvarchar(200))

Description (text, nullable)

AdminNote (nvarchar(500), nullable)

CreatedAt (datetime)

UpdatedAt (datetime, nullable)

ClosedAt (datetime, nullable)

18. Conversation
Alanlar

Id (bigint, PK)

ClientId (bigint, FK)

ExpertId (bigint, FK)

IsFrozen (bool)

LastMessageAt (datetime, nullable)

CreatedAt (datetime)

19. Message
Alanlar

Id (bigint, PK)

ConversationId (bigint, FK)

SenderUserId (bigint, FK)

MessageText (nvarchar(1000))

IsRead (bool)

ReadAt (datetime, nullable)

CreatedAt (datetime)

20. ConversationFlag
Alanlar

Id (bigint, PK)

ConversationId (bigint, FK)

ReportedByUserId (bigint, FK)

Reason (nvarchar(250))

Status (enum ConversationFlagStatus)

CreatedAt (datetime)

UpdatedAt (datetime, nullable)

21. ContentItem
Alanlar

Id (bigint, PK)

Title (nvarchar(200))

SubTitle (nvarchar(300), nullable)

Slug (nvarchar(200), unique)

Type (enum ContentType)

Category (nvarchar(100), nullable)

CoverImageUrl (nvarchar(500), nullable)

BodyHtml (text)

SeoTitle (nvarchar(200), nullable)

SeoDescription (nvarchar(300), nullable)

Status (enum ContentStatus)

PublishedAt (datetime, nullable)

AuthorUserId (bigint, FK)

CreatedAt (datetime)

UpdatedAt (datetime, nullable)

22. SystemSetting
Alanlar

Id (bigint, PK)

Key (nvarchar(200), unique)

Value (text)

CreatedAt (datetime)

UpdatedAt (datetime, nullable)

23. AuditLog
Alanlar

Id (bigint, PK)

UserId (bigint, nullable FK)

ActionType (nvarchar(100))

TargetType (nvarchar(100), nullable)

IpAddress (nvarchar(50), nullable)

MetaJson (text, nullable)

CreatedAt (datetime)