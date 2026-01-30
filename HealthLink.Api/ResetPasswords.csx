using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using HealthLink.Api.Data;
using HealthLink.Api.Entities;

var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
optionsBuilder.UseNpgsql("Host=localhost;Database=healthlink;Username=postgres;Password=300988temAS");

using var context = new AppDbContext(optionsBuilder.Options);

// Hash password helper
void HashPassword(string password, out string hash, out string salt)
{
    using var hmac = new HMACSHA256();
    salt = Convert.ToBase64String(hmac.Key);
    hash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));
}

// Update all expert passwords to 123
var experts = context.Users.Where(u => context.Experts.Any(e => e.UserId == u.Id)).ToList();
foreach (var user in experts)
{
    HashPassword("123", out string hash, out string salt);
    user.PasswordHash = hash;
    user.PasswordSalt = salt;
    Console.WriteLine($"Updated expert: {user.Email}");
}

// Create or update admin with 123
var adminUser = context.Users.FirstOrDefault(u => u.Email == "admin@healthlink.com");
if (adminUser == null)
{
    HashPassword("123", out string hash, out string salt);
    adminUser = new User
    {
        Email = "admin@healthlink.com",
        PasswordHash = hash,
        PasswordSalt = salt,
        Phone = "5559999999",
        IsActive = true,
        CreatedAt = DateTime.UtcNow
    };
    context.Users.Add(adminUser);
    context.SaveChanges();
    
    var admin = new Admin
    {
        UserId = adminUser.Id,
        DisplayName = "System Admin",
        IsSystemAdmin = true,
        CreatedAt = DateTime.UtcNow
    };
    context.Admins.Add(admin);
    Console.WriteLine("Created admin: admin@healthlink.com");
}
else
{
    HashPassword("123", out string hash, out string salt);
    adminUser.PasswordHash = hash;
    adminUser.PasswordSalt = salt;
    Console.WriteLine("Updated admin: admin@healthlink.com");
}

context.SaveChanges();
Console.WriteLine("All passwords updated successfully!");
