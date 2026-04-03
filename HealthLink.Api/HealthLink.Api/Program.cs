using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Threading.RateLimiting;

using HealthLink.Api.Data;
using HealthLink.Api.Hubs;
using HealthLink.Api.Security;
using HealthLink.Api.Services;
using HealthLink.Api.Services.Interfaces;

using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.RateLimiting;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Controllers with JSON options for enum handling
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new HealthLink.Api.Common.TimeOnlyJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new HealthLink.Api.Common.NullableTimeOnlyJsonConverter());
    });

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "HealthLink API",
        Version = "v1",
        Description = "RESTful API for HealthLink - Online Health Consultation Platform",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "HealthLink Support",
            Email = "support@healthlink.com"
        }
    });

    // JWT Authentication
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS — must use WithOrigins + AllowCredentials for SignalR WebSocket
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Auth services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<JwtTokenGenerator>();

// API-1 Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IExpertService, ExpertService>();
builder.Services.AddScoped<ISpecializationService, SpecializationService>();

// API-2 Services (Package & Payment)
builder.Services.AddScoped<IServicePackageService, ServicePackageService>();
builder.Services.AddScoped<IClientPackageService, ClientPackageService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IDiscountCodeService, DiscountCodeService>();
builder.Services.AddScoped<IIyzicoService, IyzicoService>();

// API-3 Services (Review)
builder.Services.AddScoped<IReviewService, ReviewService>();

// API-4 Services (Messaging)
builder.Services.AddScoped<IMessagingService, MessagingService>();

// API-5 Services (Content & Admin)
builder.Services.AddScoped<IContentService, ContentService>();

// API-6 Services (Client Notes)
builder.Services.AddScoped<IClientNoteService, ClientNoteService>();

// API-7 Services (Client Measurements)
builder.Services.AddScoped<IMeasurementService, MeasurementService>();

// Existing services
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IExpertAvailabilityService, ExpertAvailabilityService>();

// Daily.co video service (uses HttpClient)
builder.Services.AddHttpClient<IDailyService, DailyService>();

// Background services
builder.Services.AddHostedService<AppointmentAutoCompleteService>();

// SignalR
builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtKey = builder.Configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey))
        {
            throw new InvalidOperationException("JWT Key is not configured in appsettings.json");
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            ),
            ClockSkew = TimeSpan.Zero
        };

        // JWT Events for SignalR WebSocket support
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // SignalR WebSocket support: read token from query string
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chathub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Login: IP başına son 1 dakikada 5 istek (Sliding Window — brute-force koruması)
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6, // 10 saniyelik dilimler
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    // Register: IP başına 1 dakikada 3 istek (Fixed Window — email verification zaten var)
    options.AddPolicy("register", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    // Email işlemleri: IP başına son 5 dakikada 3 istek (Sliding Window — email spam koruması)
    options.AddPolicy("email", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromMinutes(5),
                SegmentsPerWindow = 5, // 1 dakikalık dilimler
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    // Global: IP başına son 1 dakikada 100 istek (Sliding Window)
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));
});

var app = builder.Build();

// Global exception handler
app.UseMiddleware<HealthLink.Api.Middleware.GlobalExceptionHandlerMiddleware>();

// Swagger only in Dev
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Static files (profile photos etc.)
app.UseStaticFiles();

// CORS
app.UseCors();

// Rate Limiting
app.UseRateLimiter();

// JWT Middleware removed - using built-in ASP.NET Core authentication

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chathub");

// Seed database with test data
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            await SeedData.Initialize(services);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error seeding database: {ex.Message}");
            Console.WriteLine($"❌ Inner Exception: {ex.InnerException?.Message}");
            Console.WriteLine($"❌ Stack Trace: {ex.StackTrace}");
        }
    }
}

app.Run();
