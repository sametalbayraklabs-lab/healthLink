using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;

using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Client> Clients => Set<Client>();
        public DbSet<Expert> Experts => Set<Expert>();
        public DbSet<Admin> Admins => Set<Admin>();
        public DbSet<Specialization> Specializations => Set<Specialization>();
        public DbSet<ExpertSpecialization> ExpertSpecializations => Set<ExpertSpecialization>();
        public DbSet<ExpertCertificate> ExpertCertificates => Set<ExpertCertificate>();
        public DbSet<ServicePackage> ServicePackages => Set<ServicePackage>();
        public DbSet<ClientPackage> ClientPackages => Set<ClientPackage>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<DiscountCode> DiscountCodes => Set<DiscountCode>();
        public DbSet<PaymentDiscountUsage> PaymentDiscountUsages => Set<PaymentDiscountUsage>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
        public DbSet<AppointmentNote> AppointmentNotes => Set<AppointmentNote>();
        public DbSet<AppointmentReport> AppointmentReports => Set<AppointmentReport>();
        public DbSet<ExpertScheduleTemplate> ExpertScheduleTemplates => Set<ExpertScheduleTemplate>();
        public DbSet<ExpertScheduleException> ExpertScheduleExceptions => Set<ExpertScheduleException>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<Complaint> Complaints => Set<Complaint>();
        public DbSet<Conversation> Conversations => Set<Conversation>();
        public DbSet<Message> Messages => Set<Message>();
        public DbSet<ConversationFlag> ConversationFlags => Set<ConversationFlag>();
        public DbSet<ContentItem> ContentItems => Set<ContentItem>();
        public DbSet<ContentItemReaction> ContentItemReactions => Set<ContentItemReaction>();
        public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Email)
                      .IsRequired()
                      .HasMaxLength(256);

                entity.HasIndex(x => x.Email)
                      .IsUnique();

                entity.Property(x => x.PasswordHash)
                      .IsRequired();

                entity.Property(x => x.PasswordSalt)
                      .IsRequired();

                entity.Property(x => x.Phone)
                      .HasMaxLength(32);

                entity.Property(x => x.IsActive)
                      .IsRequired()
                      .HasDefaultValue(true);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);
            });

            modelBuilder.Entity<Client>(entity =>
            {
                entity.ToTable("Clients");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.FirstName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(x => x.LastName)
                      .IsRequired()
                      .HasMaxLength(100);

                // BREAKING CHANGE: Gender changed from string to enum (stored as int)
                entity.Property(x => x.Gender)
                      .IsRequired(false);

                entity.Property(x => x.BirthDate)
                      .IsRequired(false);

                entity.Property(x => x.IsActive)
                      .IsRequired()
                      .HasDefaultValue(true);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.User)
                      .WithOne()
                      .HasForeignKey<Client>(x => x.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => x.UserId)
                      .IsUnique();
            });

            modelBuilder.Entity<Admin>(entity =>
            {
                entity.ToTable("Admins");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.FirstName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(x => x.LastName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(x => x.IsSystemAdmin)
                      .IsRequired()
                      .HasDefaultValue(false);

                entity.Property(x => x.IsActive)
                      .IsRequired()
                      .HasDefaultValue(true);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.User)
                      .WithOne()
                      .HasForeignKey<Admin>(x => x.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => x.UserId)
                      .IsUnique();
            });

            modelBuilder.Entity<Expert>(entity =>
            {
                entity.ToTable("Experts");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.ExpertType)
                      .IsRequired();

                entity.Property(x => x.Status)
                      .IsRequired();

                entity.Property(x => x.DisplayName)
                      .HasMaxLength(150)
                      .IsRequired(false);

                entity.Property(x => x.Bio)
                      .HasMaxLength(2000)
                      .IsRequired(false);

                entity.Property(x => x.City)
                      .HasMaxLength(100)
                      .IsRequired(false);

                entity.Property(x => x.WorkType)
                      .IsRequired(false);

                entity.Property(x => x.ExperienceStartDate)
                      .IsRequired(false);

                entity.Property(x => x.AverageRating)
                      .HasPrecision(3, 2)
                      .IsRequired(false);

                entity.Property(x => x.TotalReviewCount)
                      .IsRequired()
                      .HasDefaultValue(0);

                entity.Property(x => x.IsActive)
                      .IsRequired()
                      .HasDefaultValue(true);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.User)
                      .WithOne()
                      .HasForeignKey<Expert>(x => x.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => x.UserId)
                      .IsUnique();
            });

            modelBuilder.Entity<Specialization>(entity =>
            {
                entity.ToTable("Specializations");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Name)
                      .IsRequired()
                      .HasMaxLength(256);

                entity.HasIndex(x => x.Name)
                      .IsUnique();

                entity.Property(x => x.ExpertType)
                      .IsRequired();

                entity.Property(x => x.Category)
                      .IsRequired();

                entity.Property(x => x.IsActive)
                      .IsRequired()
                      .HasDefaultValue(true);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);
            });

            modelBuilder.Entity<ExpertSpecialization>(entity =>
            {
                entity.ToTable("ExpertSpecializations");

                entity.HasKey(x => new { x.ExpertId, x.SpecializationId });

                entity.HasOne(x => x.Expert)
                      .WithMany(x => x.ExpertSpecializations)
                      .HasForeignKey(x => x.ExpertId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.Specialization)
                      .WithMany(x => x.ExpertSpecializations)
                      .HasForeignKey(x => x.SpecializationId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<ServicePackage>(entity =>
            {
                entity.ToTable("ServicePackages");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Name)
                      .IsRequired()
                      .HasMaxLength(150);

                entity.Property(x => x.Description)
                      .IsRequired(false);

                entity.Property(x => x.ExpertType)
                      .IsRequired();

                entity.Property(x => x.SessionCount)
                      .IsRequired();

                entity.Property(x => x.Price)
                      .HasPrecision(18, 2)
                      .IsRequired();

                entity.Property(x => x.Currency)
                      .HasMaxLength(10)
                      .IsRequired()
                      .HasDefaultValue("TRY");

                entity.Property(x => x.IsActive)
                      .IsRequired()
                      .HasDefaultValue(true);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);
            });

            modelBuilder.Entity<ClientPackage>(entity =>
            {
                entity.ToTable("ClientPackages");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.TotalSessions)
                      .IsRequired();

                entity.Property(x => x.UsedSessions)
                      .IsRequired()
                      .HasDefaultValue(0);

                entity.Property(x => x.Status)
                      .IsRequired();

                entity.Property(x => x.PurchaseDate)
                      .IsRequired();

                entity.Property(x => x.ExpireDate)
                      .IsRequired(false);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.Client)
                      .WithMany()
                      .HasForeignKey(x => x.ClientId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.ServicePackage)
                      .WithMany(x => x.ClientPackages)
                      .HasForeignKey(x => x.ServicePackageId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.ToTable("Payments");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Amount)
                      .HasPrecision(18, 2)
                      .IsRequired();

                entity.Property(x => x.Currency)
                      .HasMaxLength(10)
                      .IsRequired()
                      .HasDefaultValue("TRY");

                entity.Property(x => x.PaymentMethod)
                      .HasMaxLength(50)
                      .IsRequired();

                entity.Property(x => x.Status)
                      .IsRequired();

                entity.Property(x => x.Gateway)
                      .IsRequired();

                entity.Property(x => x.GatewayPaymentId)
                      .HasMaxLength(100)
                      .IsRequired(false);

                // BREAKING CHANGE: ProviderPaymentId removed
                entity.Property(x => x.ProviderRawResponse)
                      .IsRequired(false);

                entity.Property(x => x.ConfirmedAt)
                      .IsRequired(false);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.Client)
                      .WithMany()
                      .HasForeignKey(x => x.ClientId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.ClientPackage)
                      .WithOne()
                      .HasForeignKey<Payment>(x => x.ClientPackageId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<DiscountCode>(entity =>
            {
                entity.ToTable("DiscountCodes");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Code)
                      .HasMaxLength(50)
                      .IsRequired();

                entity.HasIndex(x => x.Code)
                      .IsUnique();

                entity.Property(x => x.Description)
                      .HasMaxLength(255)
                      .IsRequired(false);

                entity.Property(x => x.DiscountType)
                      .IsRequired();

                entity.Property(x => x.DiscountValue)
                      .HasPrecision(18, 2)
                      .IsRequired();

                entity.Property(x => x.MaxUsageCount)
                      .IsRequired(false);

                entity.Property(x => x.UsedCount)
                      .IsRequired()
                      .HasDefaultValue(0);

                entity.Property(x => x.ValidFrom)
                      .IsRequired();

                entity.Property(x => x.ValidTo)
                      .IsRequired(false);

                entity.Property(x => x.ApplicableExpertType)
                      .IsRequired();

                entity.Property(x => x.IsActive)
                      .IsRequired()
                      .HasDefaultValue(true);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);
            });

            modelBuilder.Entity<PaymentDiscountUsage>(entity =>
            {
                entity.ToTable("PaymentDiscountUsages");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.AppliedAmount)
                      .HasPrecision(18, 2)
                      .IsRequired();

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.HasOne(x => x.Payment)
                      .WithMany()
                      .HasForeignKey(x => x.PaymentId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.DiscountCode)
                      .WithMany()
                      .HasForeignKey(x => x.DiscountCodeId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.ToTable("Appointments");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.ServiceType)
                      .IsRequired();  // ServiceType is enum (stored as int)

                entity.Property(x => x.StartDateTime)
                      .IsRequired();

                entity.Property(x => x.EndDateTime)
                      .IsRequired();

                entity.Property(x => x.ZoomLink)
                      .HasMaxLength(500)
                      .IsRequired(false);

                entity.Property(x => x.Status)
                      .HasMaxLength(30)
                      .IsRequired();  // Status is string (NOT enum)

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.Client)
                      .WithMany()
                      .HasForeignKey(x => x.ClientId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Expert)
                      .WithMany()
                      .HasForeignKey(x => x.ExpertId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.ClientPackage)
                      .WithMany()
                      .HasForeignKey(x => x.ClientPackageId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<AppointmentNote>(entity =>
            {
                entity.ToTable("AppointmentNotes");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.NoteText)
                      .HasMaxLength(1000)
                      .IsRequired();

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.Appointment)
                      .WithMany()
                      .HasForeignKey(x => x.AppointmentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.Client)
                      .WithMany()
                      .HasForeignKey(x => x.ClientId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<AppointmentReport>(entity =>
            {
                entity.ToTable("AppointmentReports");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.ReportText)
                      .IsRequired();

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.Appointment)
                      .WithMany()
                      .HasForeignKey(x => x.AppointmentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.Expert)
                      .WithMany()
                      .HasForeignKey(x => x.ExpertId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ExpertScheduleTemplate>(entity =>
            {
                entity.ToTable("ExpertScheduleTemplates");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.DayOfWeek)
                      .IsRequired();

                entity.Property(x => x.IsOpen)
                      .IsRequired();

                entity.Property(x => x.WorkStartTime)
                      .IsRequired(false);

                entity.Property(x => x.WorkEndTime)
                      .IsRequired(false);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.Expert)
                      .WithMany()
                      .HasForeignKey(x => x.ExpertId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Aynı gün için tek şablon
                entity.HasIndex(x => new { x.ExpertId, x.DayOfWeek })
                      .IsUnique();
            });

            modelBuilder.Entity<ExpertScheduleException>(entity =>
            {
                entity.ToTable("ExpertScheduleExceptions");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Date)
                      .IsRequired();

                entity.Property(x => x.Type)
                      .HasMaxLength(20)
                      .IsRequired();

                entity.Property(x => x.StartTime)
                      .IsRequired(false);

                entity.Property(x => x.EndTime)
                      .IsRequired(false);

                entity.Property(x => x.Reason)
                      .HasMaxLength(250)
                      .IsRequired(false);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.HasOne(x => x.Expert)
                      .WithMany()
                      .HasForeignKey(x => x.ExpertId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("Reviews");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Rating)
                      .IsRequired();

                entity.Property(x => x.Comment)
                      .HasMaxLength(500)
                      .IsRequired(false);

                entity.Property(x => x.Status)
                      .IsRequired();

                entity.Property(x => x.AdminNote)
                      .HasMaxLength(500)
                      .IsRequired(false);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.ReviewedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.Appointment)
                      .WithOne()
                      .HasForeignKey<Review>(x => x.AppointmentId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Client)
                      .WithMany()
                      .HasForeignKey(x => x.ClientId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Expert)
                      .WithMany()
                      .HasForeignKey(x => x.ExpertId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.ReviewedByAdmin)
                      .WithMany()
                      .HasForeignKey(x => x.ReviewedByAdminId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => x.AppointmentId)
                      .IsUnique();
            });

            modelBuilder.Entity<Complaint>(entity =>
            {
                entity.ToTable("Complaints");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Category)
                      .IsRequired();

                entity.Property(x => x.Type)
                      .IsRequired();

                entity.Property(x => x.Title)
                      .HasMaxLength(200)
                      .IsRequired();

                entity.Property(x => x.Description)
                      .IsRequired(false);

                entity.Property(x => x.Status)
                      .IsRequired();

                entity.Property(x => x.AdminNote)
                      .HasMaxLength(500)
                      .IsRequired(false);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);

                entity.Property(x => x.ClosedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.Client)
                      .WithMany()
                      .HasForeignKey(x => x.ClientId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Expert)
                      .WithMany()
                      .HasForeignKey(x => x.ExpertId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Appointment)
                      .WithMany()
                      .HasForeignKey(x => x.AppointmentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Conversation>(entity =>
            {
                entity.ToTable("Conversations");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.LastMessageAt)
                      .IsRequired(false);

                entity.Property(x => x.IsFrozen)
                      .IsRequired()
                      .HasDefaultValue(false);

                entity.HasOne(x => x.Client)
                      .WithMany()
                      .HasForeignKey(x => x.ClientId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Expert)
                      .WithMany()
                      .HasForeignKey(x => x.ExpertId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Client ↔ Expert için tek conversation
                entity.HasIndex(x => new { x.ClientId, x.ExpertId })
                      .IsUnique();
            });

            modelBuilder.Entity<Message>(entity =>
            {
                entity.ToTable("Messages");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.MessageText)
                      .HasMaxLength(1000)
                      .IsRequired();

                entity.Property(x => x.IsRead)
                      .IsRequired()
                      .HasDefaultValue(false);

                entity.Property(x => x.ReadAt)
                      .IsRequired(false);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.HasOne(x => x.Conversation)
                      .WithMany()
                      .HasForeignKey(x => x.ConversationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.SenderUser)
                      .WithMany()
                      .HasForeignKey(x => x.SenderUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ConversationFlag>(entity =>
            {
                entity.ToTable("ConversationFlags");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Reason)
                      .HasMaxLength(250)
                      .IsRequired();

                entity.Property(x => x.Status)
                      .IsRequired();

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.Conversation)
                      .WithMany()
                      .HasForeignKey(x => x.ConversationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.ReportedByUser)
                      .WithMany()
                      .HasForeignKey(x => x.ReportedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ContentItem>(entity =>
            {
                entity.ToTable("ContentItems");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Title)
                      .HasMaxLength(200)
                      .IsRequired();

                entity.Property(x => x.SubTitle)
                      .HasMaxLength(300)
                      .IsRequired(false);

                entity.Property(x => x.Slug)
                      .HasMaxLength(200)
                      .IsRequired();

                entity.HasIndex(x => x.Slug)
                      .IsUnique();

                entity.Property(x => x.Type)
                      .IsRequired();

                entity.Property(x => x.Category)
                      .HasMaxLength(100)
                      .IsRequired(false);

                entity.Property(x => x.CoverImageUrl)
                      .HasMaxLength(500)
                      .IsRequired(false);

                entity.Property(x => x.BodyHtml)
                      .IsRequired();

                entity.Property(x => x.SeoTitle)
                      .HasMaxLength(200)
                      .IsRequired(false);

                entity.Property(x => x.SeoDescription)
                      .HasMaxLength(300)
                      .IsRequired(false);

                entity.Property(x => x.Status)
                      .IsRequired();

                entity.Property(x => x.PublishedAt)
                      .IsRequired(false);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);

                entity.HasOne(x => x.AuthorUser)
                      .WithMany()
                      .HasForeignKey(x => x.AuthorUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<SystemSetting>(entity =>
            {
                entity.ToTable("SystemSettings");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Key)
                      .HasMaxLength(200)
                      .IsRequired();

                entity.HasIndex(x => x.Key)
                      .IsUnique();

                entity.Property(x => x.Value)
                      .IsRequired();

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.Property(x => x.UpdatedAt)
                      .IsRequired(false);
            });

            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.ActionType)
                      .HasMaxLength(100)
                      .IsRequired();

                entity.Property(x => x.TargetType)
                      .HasMaxLength(100)
                      .IsRequired(false);

                entity.Property(x => x.IpAddress)
                      .HasMaxLength(50)
                      .IsRequired(false);

                entity.Property(x => x.MetaJson)
                      .IsRequired(false);

                entity.Property(x => x.CreatedAt)
                      .IsRequired();

                entity.HasOne(x => x.User)
                      .WithMany()
                      .HasForeignKey(x => x.UserId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<SystemSetting>().HasData(
            new SystemSetting
            {
                Id = 1,
                Key = "Platform.CommissionRate",
                Value = "0.15",
                CreatedAt = DateTime.UtcNow
            },
            new SystemSetting
            {
                Id = 2,
                Key = "Session.DefaultDurationMinutes",
                Value = "30",
                CreatedAt = DateTime.UtcNow
            },
            new SystemSetting
            {
                Id = 3,
                Key = "Session.CancelLimitHours",
                Value = "24",
                CreatedAt = DateTime.UtcNow
            }
        );
            modelBuilder.Entity<Specialization>().HasData(
    new Specialization
    {
        Id = 1,
        Name = "Clinical Nutrition",
        IsActive = true,
        CreatedAt = DateTime.UtcNow
    },
    new Specialization
    {
        Id = 2,
        Name = "Sports Nutrition",
        IsActive = true,
        CreatedAt = DateTime.UtcNow
    },
    new Specialization
    {
        Id = 3,
        Name = "Weight Management",
        IsActive = true,
        CreatedAt = DateTime.UtcNow
    }
);

            modelBuilder.Entity<ServicePackage>().HasData(
        new ServicePackage
        {
            Id = 1,
            Name = "Single Session",
            Description = "One online consultation session",
            ExpertType = ExpertType.All,   // 0
            SessionCount = 1,
            Price = 750,
            Currency = "TRY",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        },
        new ServicePackage
        {
            Id = 2,
            Name = "4 Session Package",
            Description = "Four online consultation sessions",
            ExpertType = ExpertType.All,   // 0
            SessionCount = 4,
            Price = 2600,
            Currency = "TRY",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        }
    );
    


        }
        public override async Task<int> SaveChangesAsync(
                        CancellationToken cancellationToken = default)
        {
            ApplyUpdatedAt();
            return await base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            ApplyUpdatedAt();
            return base.SaveChanges();
        }

        private void ApplyUpdatedAt()
        {
            var utcNow = DateTime.UtcNow;

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State == EntityState.Modified &&
                    entry.Metadata.FindProperty("UpdatedAt") != null)
                {
                    entry.Property("UpdatedAt").CurrentValue = utcNow;
                }
            }
        }


    }
}
