using System;
var hash = BCrypt.Net.BCrypt.HashPassword("123", 12);
Console.WriteLine(hash);
