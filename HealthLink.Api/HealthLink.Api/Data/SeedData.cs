using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Security;

namespace HealthLink.Api.Data;

public static class SeedData
{
    private static User CreateUser(string email, string password, DateTime now)
    {
        var (hash, salt) = PasswordHasher.HashPassword(password);
        return new User
        {
            Email = email,
            PasswordHash = hash,
            PasswordSalt = salt,
            IsActive = true,
            CreatedAt = now
        };
    }

    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.GetRequiredService<AppDbContext>();

        // Check if data already exists
        if (context.Users.Any())
        {
            return; // Database already seeded
        }

        var now = DateTime.UtcNow;
        var password = "123";

        // 1. Create Users
        var adminUser = CreateUser("admin@healthlink.com", password, now);
        context.Users.Add(adminUser);

        var expertUsers = new List<User>
        {
            CreateUser("diyetisyen1@healthlink.com", password, now),
            CreateUser("diyetisyen2@healthlink.com", password, now),
            CreateUser("psikolog1@healthlink.com", password, now),
            CreateUser("psikolog2@healthlink.com", password, now),
            CreateUser("sporkocu1@healthlink.com", password, now),
            CreateUser("sporkocu2@healthlink.com", password, now)
        };
        context.Users.AddRange(expertUsers);

        var clientUsers = new List<User>
        {
            CreateUser("client1@healthlink.com", password, now),
            CreateUser("client2@healthlink.com", password, now)
        };
        context.Users.AddRange(clientUsers);

        try
        {
            await context.SaveChangesAsync(); // Save users first to get IDs
            Console.WriteLine("✅ Users saved successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error saving Users: {ex.Message}");
            Console.WriteLine($"❌ Inner Exception: {ex.InnerException?.Message}");
            throw;
        }

        // 2. Create Admin
        var admin = new Admin
        {
            UserId = adminUser.Id,
            FirstName = "Admin",
            LastName = "User",
            IsSystemAdmin = true,
            CreatedAt = now
        };
        context.Admins.Add(admin);

        // 3. Create Experts
        var expertData = new[]
        {
            new { User = expertUsers[0], FirstName = "Ayşe", LastName = "Yılmaz", Bio = "10 yıllık deneyimli diyetisyen. Kilo yönetimi ve sağlıklı beslenme konusunda uzman." },
            new { User = expertUsers[1], FirstName = "Mehmet", LastName = "Kaya", Bio = "Spor beslenmesi ve metabolizma uzmanı. 8 yıllık tecrübe." },
            new { User = expertUsers[2], FirstName = "Zeynep", LastName = "Demir", Bio = "Klinik psikolog. Anksiyete, depresyon ve stres yönetimi konusunda uzman." },
            new { User = expertUsers[3], FirstName = "Can", LastName = "Özkan", Bio = "Aile ve çift terapisi uzmanı. 12 yıllık deneyim." },
            new { User = expertUsers[4], FirstName = "Emre", LastName = "Şahin", Bio = "Fitness ve kuvvet antrenmanı koçu. Kişisel antrenman programları." },
            new { User = expertUsers[5], FirstName = "Selin", LastName = "Arslan", Bio = "Yoga ve pilates eğitmeni. Rehabilitasyon ve esneklik çalışmaları." }
        };

        foreach (var data in expertData)
        {
            context.Experts.Add(new Expert
            {
                UserId = data.User.Id,
                ExpertType = ExpertType.All,
                Status = ExpertStatus.Approved,
                DisplayName = $"{data.FirstName} {data.LastName}",
                Bio = data.Bio,
                IsActive = true,
                CreatedAt = now
            });
        }

        // 4. Create Clients
        var clientData = new[]
        {
            new { User = clientUsers[0], FirstName = "Ali", LastName = "Yıldız", BirthDate = DateTime.SpecifyKind(new DateTime(1990, 5, 15), DateTimeKind.Utc), Gender = Gender.Male },
            new { User = clientUsers[1], FirstName = "Elif", LastName = "Çelik", BirthDate = DateTime.SpecifyKind(new DateTime(1995, 8, 22), DateTimeKind.Utc), Gender = Gender.Female }
        };

        foreach (var data in clientData)
        {
            context.Clients.Add(new Client
            {
                UserId = data.User.Id,
                FirstName = data.FirstName,
                LastName = data.LastName,
                BirthDate = data.BirthDate,
                Gender = data.Gender,
                CreatedAt = now
            });
        }

        try
        {
            await context.SaveChangesAsync();
            Console.WriteLine("✅ Admins, Experts, and Clients saved successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error saving Admins/Experts/Clients: {ex.Message}");
            Console.WriteLine($"❌ Inner Exception: {ex.InnerException?.Message}");
            throw;
        }

        Console.WriteLine("✅ Seed data created successfully!");
        Console.WriteLine("📧 Admin: admin@healthlink.com / 123");
        Console.WriteLine("📧 Experts: diyetisyen1@healthlink.com, diyetisyen2@healthlink.com, psikolog1@healthlink.com, psikolog2@healthlink.com, sporkocu1@healthlink.com, sporkocu2@healthlink.com / 123");
        Console.WriteLine("📧 Clients: client1@healthlink.com, client2@healthlink.com / 123");
    }
}
