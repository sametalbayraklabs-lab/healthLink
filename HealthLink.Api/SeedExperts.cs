using System;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using HealthLink.Api.Data;
using HealthLink.Api.Entities;
using HealthLink.Api.Enums;

var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
optionsBuilder.UseNpgsql("Host=localhost;Database=healthlinkdb;Username=postgres;Password=postgres");

using var context = new AppDbContext(optionsBuilder.Options);

Console.WriteLine("Creating expert accounts...");

// Helper to hash passwords
(string hash, string salt) HashPassword(string password)
{
    using var hmac = new HMACSHA512();
    var salt = Convert.ToBase64String(hmac.Key);
    var hash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));
    return (hash, salt);
}

// Create experts
var experts = new[]
{
    new { Email = "dyt.ayse@healthlink.com", Name = "Ayşe Yılmaz", Type = ExpertType.Dietitian, Experience = "2014-01-01" },
    new { Email = "dyt.mehmet@healthlink.com", Name = "Mehmet Kaya", Type = ExpertType.Dietitian, Experience = "2010-01-01" },
    new { Email = "dyt.zeynep@healthlink.com", Name = "Zeynep Demir", Type = ExpertType.Dietitian, Experience = "2018-01-01" },
    new { Email = "psk.ali@healthlink.com", Name = "Ali Öztürk", Type = ExpertType.Psychologist, Experience = "2012-01-01" },
    new { Email = "psk.elif@healthlink.com", Name = "Elif Şahin", Type = ExpertType.Psychologist, Experience = "2015-01-01" }
};

foreach (var expertData in experts)
{
    // Check if user already exists
    var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Email == expertData.Email);
    if (existingUser != null)
    {
        Console.WriteLine($"User {expertData.Email} already exists, skipping...");
        continue;
    }

    // Create user
    var (hash, salt) = HashPassword("Test123!");
    var user = new User
    {
        Email = expertData.Email,
        PasswordHash = hash,
        PasswordSalt = salt,
        Phone = "555" + new Random().Next(1000000, 9999999).ToString(),
        IsActive = true,
        CreatedAt = DateTime.UtcNow
    };
    context.Users.Add(user);
    await context.SaveChangesAsync();

    // Create expert
    var expert = new Expert
    {
        UserId = user.Id,
        DisplayName = expertData.Name,
        ExpertType = expertData.Type,
        City = "Istanbul",
        WorkType = WorkType.Online,
        IsApproved = false,
        ExperienceStartDate = DateTime.Parse(expertData.Experience),
        CreatedAt = DateTime.UtcNow
    };
    context.Experts.Add(expert);
    await context.SaveChangesAsync();

    Console.WriteLine($"✓ Created: {expertData.Name} ({expertData.Type})");
}

// Create admin if not exists
var adminEmail = "admin@healthlink.com";
var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
if (adminUser == null)
{
    var (hash, salt) = HashPassword("Admin123!");
    adminUser = new User
    {
        Email = adminEmail,
        PasswordHash = hash,
        PasswordSalt = salt,
        Phone = "5559999999",
        IsActive = true,
        CreatedAt = DateTime.UtcNow
    };
    context.Users.Add(adminUser);
    await context.SaveChangesAsync();

    var admin = new Admin
    {
        UserId = adminUser.Id,
        DisplayName = "System Admin",
        IsSystemAdmin = true,
        CreatedAt = DateTime.UtcNow
    };
    context.Admins.Add(admin);
    await context.SaveChangesAsync();

    Console.WriteLine("✓ Created: System Admin");
}
else
{
    Console.WriteLine("Admin already exists");
}

Console.WriteLine("\nAll done! Press any key to exit...");
Console.ReadKey();
