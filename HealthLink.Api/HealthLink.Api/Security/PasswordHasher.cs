using System.Security.Cryptography;
using System.Text;

namespace HealthLink.Api.Security;

public static class PasswordHasher
{
    public static (string hash, string salt) HashPassword(string password)
    {
        using var hmac = new HMACSHA256();
        var saltBytes = hmac.Key;
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

        return (
            Convert.ToBase64String(hashBytes),
            Convert.ToBase64String(saltBytes)
        );
    }

    public static bool VerifyPassword(string password, string storedHash, string storedSalt)
    {
        var saltBytes = Convert.FromBase64String(storedSalt);
        using var hmac = new HMACSHA256(saltBytes);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

        return Convert.ToBase64String(computedHash) == storedHash;
    }
}
