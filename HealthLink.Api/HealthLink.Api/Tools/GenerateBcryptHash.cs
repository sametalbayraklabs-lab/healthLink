// Temporary tool - run with: dotnet run -- --generate-hash
// This generates a bcrypt hash for password "123" and outputs the SQL UPDATE

namespace HealthLink.Api.Tools;

public static class BcryptHashGenerator
{
    public static void GenerateAndPrintSql()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("123", 12);
        Console.WriteLine("=== BCRYPT HASH FOR '123' ===");
        Console.WriteLine($"Hash: {hash}");
        Console.WriteLine();
        Console.WriteLine("=== SQL UPDATE COMMAND ===");
        Console.WriteLine($"UPDATE \"Users\" SET \"PasswordHash\" = '{hash}', \"PasswordSalt\" = '' WHERE 1=1;");
        Console.WriteLine();
        Console.WriteLine("Run this SQL in your PostgreSQL database.");
    }
}
