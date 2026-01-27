using HealthLink.Api.Data;
using HealthLink.Api.Entities;
using Microsoft.EntityFrameworkCore;

// Simple console app to create missing client
var connectionString = "Host=localhost;Database=healthlink;Username=postgres;Password=postgres";

var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
optionsBuilder.UseNpgsql(connectionString);

using var db = new AppDbContext(optionsBuilder.Options);

var email = "kullanici01@healtlink.com";

var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email);

if (user == null)
{
    Console.WriteLine($"❌ User with email {email} not found");
    return;
}

var existingClient = await db.Clients.FirstOrDefaultAsync(x => x.UserId == user.Id);

if (existingClient != null)
{
    Console.WriteLine($"✅ Client already exists for user {email} (Client ID: {existingClient.Id})");
    return;
}

var client = new Client
{
    UserId = user.Id,
    FirstName = "Kullanıcı",
    LastName = "Test",
    BirthDate = null,
    Gender = Gender.Other,
    IsActive = true,
    CreatedAt = DateTime.UtcNow,
    UpdatedAt = DateTime.UtcNow
};

db.Clients.Add(client);
await db.SaveChangesAsync();

Console.WriteLine($"✅ Client created successfully!");
Console.WriteLine($"   User ID: {user.Id}");
Console.WriteLine($"   Client ID: {client.Id}");
Console.WriteLine($"   Email: {email}");
