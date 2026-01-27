using Microsoft.EntityFrameworkCore;
using HealthLink.Api.Data;
using HealthLink.Api.Entities;
using System.Security.Cryptography;
using System.Text;

var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
optionsBuilder.UseNpgsql("Host=localhost;Database=healthlinkdb;Username=postgres;Password=postgres");

using var context = new AppDbContext(optionsBuilder.Options);

Console.WriteLine("Checking admin account...");

// Find user
var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@healthlink.com");

if (adminUser == null)
{
    Console.WriteLine("❌ Admin user not found! Creating...");
    
    // Hash password
    using var hmac = new HMACSHA512();
    var salt = Convert.ToBase64String(hmac.Key);
    var hash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes("Admin123!")));
    
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
    await context.SaveChangesAsync();
    Console.WriteLine($"✅ Created user: {adminUser.Email} (ID: {adminUser.Id})");
}
else
{
    Console.WriteLine($"✅ User exists: {adminUser.Email} (ID: {adminUser.Id})");
}

// Check admin record
var admin = await context.Admins.FirstOrDefaultAsync(a => a.UserId == adminUser.Id);

if (admin == null)
{
    Console.WriteLine("❌ Admin record not found! Creating...");
    
    admin = new Admin
    {
        UserId = adminUser.Id,
        DisplayName = "System Admin",
        IsSystemAdmin = true,
        CreatedAt = DateTime.UtcNow
    };
    
    context.Admins.Add(admin);
    await context.SaveChangesAsync();
    Console.WriteLine($"✅ Created admin record (ID: {admin.Id})");
}
else
{
    Console.WriteLine($"✅ Admin record exists (ID: {admin.Id})");
}

Console.WriteLine("\n✅ Admin account is ready!");
Console.WriteLine($"Email: admin@healthlink.com");
Console.WriteLine($"Password: Admin123!");
Console.WriteLine($"User ID: {adminUser.Id}");
Console.WriteLine($"Admin ID: {admin.Id}");
