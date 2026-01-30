using System.Security.Cryptography;
using System.Text;
using Npgsql;

// Hash password "123"
(string hash, string salt) HashPassword(string password)
{
    using var hmac = new HMACSHA256();
    var saltBytes = hmac.Key;
    var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

    return (
        Convert.ToBase64String(hashBytes),
        Convert.ToBase64String(saltBytes)
    );
}

var (hash, salt) = HashPassword("123");

Console.WriteLine($"Password: 123");
Console.WriteLine($"Hash: {hash}");
Console.WriteLine($"Salt: {salt}");
Console.WriteLine();

// Update all users
var connectionString = "Host=localhost;Database=healthlink;Username=postgres;Password=300988temAS";

using var connection = new NpgsqlConnection(connectionString);
connection.Open();

using var command = new NpgsqlCommand(
    "UPDATE \"Users\" SET \"PasswordHash\" = @hash, \"PasswordSalt\" = @salt",
    connection
);

command.Parameters.AddWithValue("hash", hash);
command.Parameters.AddWithValue("salt", salt);

var rowsAffected = command.ExecuteNonQuery();

Console.WriteLine($"✅ Updated {rowsAffected} users. All passwords are now: 123");
