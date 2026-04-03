namespace HealthLink.Api.Security;

public static class PasswordHasher
{
    private const int WorkFactor = 12;

    public static (string hash, string salt) HashPassword(string password)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
        return (hash, string.Empty);
    }

    public static bool VerifyPassword(string password, string storedHash, string storedSalt)
    {
        return BCrypt.Net.BCrypt.Verify(password, storedHash);
    }
}
