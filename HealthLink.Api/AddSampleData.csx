using Npgsql;

var connectionString = "Host=localhost;Database=healthlink;Username=postgres;Password=postgres";

using var conn = new NpgsqlConnection(connectionString);
conn.Open();

// Get first expert
long expertId;
using (var cmd = new NpgsqlCommand("SELECT \"Id\" FROM \"Experts\" LIMIT 1", conn))
{
    var result = cmd.ExecuteScalar();
    if (result == null)
    {
        Console.WriteLine("No expert found!");
        return;
    }
    expertId = (long)result;
}

long clientId = 5;

// Create package
using (var cmd = new NpgsqlCommand(@"
    INSERT INTO ""Packages"" (
        ""ExpertId"", ""ClientId"", ""Name"", ""Description"", ""SessionCount"", 
        ""CompletedSessions"", ""Price"", ""Status"", ""StartDate"", ""EndDate"", 
        ""CreatedAt"", ""UpdatedAt""
    ) VALUES (
        @expertId, @clientId, @name, @description, @sessionCount, 
        @completedSessions, @price, @status, @startDate, @endDate, 
        @createdAt, @updatedAt
    ) RETURNING ""Id""", conn))
{
    cmd.Parameters.AddWithValue("expertId", expertId);
    cmd.Parameters.AddWithValue("clientId", clientId);
    cmd.Parameters.AddWithValue("name", "Beslenme Danışmanlığı Paketi");
    cmd.Parameters.AddWithValue("description", "8 haftalık kişiselleştirilmiş beslenme programı. Haftalık takip seansları ve özel diyet planı dahildir.");
    cmd.Parameters.AddWithValue("sessionCount", 8);
    cmd.Parameters.AddWithValue("completedSessions", 2);
    cmd.Parameters.AddWithValue("price", 1500.00m);
    cmd.Parameters.AddWithValue("status", "Active");
    cmd.Parameters.AddWithValue("startDate", DateTime.Now.AddDays(-14));
    cmd.Parameters.AddWithValue("endDate", DateTime.Now.AddDays(42));
    cmd.Parameters.AddWithValue("createdAt", DateTime.Now);
    cmd.Parameters.AddWithValue("updatedAt", DateTime.Now);
    
    var packageId = cmd.ExecuteScalar();
    Console.WriteLine($"Package created with ID: {packageId}");
}

// Create upcoming appointment
using (var cmd = new NpgsqlCommand(@"
    INSERT INTO ""Appointments"" (
        ""ExpertId"", ""ClientId"", ""AppointmentDate"", ""Status"", ""Notes"", 
        ""CreatedAt"", ""UpdatedAt""
    ) VALUES (
        @expertId, @clientId, @appointmentDate, @status, @notes, 
        @createdAt, @updatedAt
    )", conn))
{
    cmd.Parameters.AddWithValue("expertId", expertId);
    cmd.Parameters.AddWithValue("clientId", clientId);
    cmd.Parameters.AddWithValue("appointmentDate", DateTime.Now.AddDays(3).Date.AddHours(14));
    cmd.Parameters.AddWithValue("status", "Scheduled");
    cmd.Parameters.AddWithValue("notes", "Haftalık kontrol randevusu");
    cmd.Parameters.AddWithValue("createdAt", DateTime.Now);
    cmd.Parameters.AddWithValue("updatedAt", DateTime.Now);
    
    cmd.ExecuteNonQuery();
    Console.WriteLine("Upcoming appointment created");
}

// Create past completed appointment
using (var cmd = new NpgsqlCommand(@"
    INSERT INTO ""Appointments"" (
        ""ExpertId"", ""ClientId"", ""AppointmentDate"", ""Status"", ""Notes"", 
        ""CreatedAt"", ""UpdatedAt""
    ) VALUES (
        @expertId, @clientId, @appointmentDate, @status, @notes, 
        @createdAt, @updatedAt
    )", conn))
{
    cmd.Parameters.AddWithValue("expertId", expertId);
    cmd.Parameters.AddWithValue("clientId", clientId);
    cmd.Parameters.AddWithValue("appointmentDate", DateTime.Now.AddDays(-7).Date.AddHours(10));
    cmd.Parameters.AddWithValue("status", "Completed");
    cmd.Parameters.AddWithValue("notes", "İlk değerlendirme seansı tamamlandı");
    cmd.Parameters.AddWithValue("createdAt", DateTime.Now);
    cmd.Parameters.AddWithValue("updatedAt", DateTime.Now);
    
    cmd.ExecuteNonQuery();
    Console.WriteLine("Past appointment created");
}

// Create another upcoming appointment
using (var cmd = new NpgsqlCommand(@"
    INSERT INTO ""Appointments"" (
        ""ExpertId"", ""ClientId"", ""AppointmentDate"", ""Status"", ""Notes"", 
        ""CreatedAt"", ""UpdatedAt""
    ) VALUES (
        @expertId, @clientId, @appointmentDate, @status, @notes, 
        @createdAt, @updatedAt
    )", conn))
{
    cmd.Parameters.AddWithValue("expertId", expertId);
    cmd.Parameters.AddWithValue("clientId", clientId);
    cmd.Parameters.AddWithValue("appointmentDate", DateTime.Now.AddDays(7).Date.AddHours(15).AddMinutes(30));
    cmd.Parameters.AddWithValue("status", "Scheduled");
    cmd.Parameters.AddWithValue("notes", "Diyet planı revizyon görüşmesi");
    cmd.Parameters.AddWithValue("createdAt", DateTime.Now);
    cmd.Parameters.AddWithValue("updatedAt", DateTime.Now);
    
    cmd.ExecuteNonQuery();
    Console.WriteLine("Second upcoming appointment created");
}

Console.WriteLine("Sample data created successfully!");
