using System.Security.Cryptography;
using System.Text;

// Hash password "123"
using var hmac = new HMACSHA256();
var saltBytes = hmac.Key;
var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes("123"));

var hash = Convert.ToBase64String(hashBytes);
var salt = Convert.ToBase64String(saltBytes);

Console.WriteLine($"-- Password: 123");
Console.WriteLine($"-- Hash: {hash}");
Console.WriteLine($"-- Salt: {salt}");
Console.WriteLine();
Console.WriteLine($"UPDATE \"Users\" SET \"PasswordHash\" = '{hash}', \"PasswordSalt\" = '{salt}';");
