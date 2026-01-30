using System.IdentityModel.Tokens.Jwt;
using System.Text;

using HealthLink.Api.Data;
using HealthLink.Api.Security;
using HealthLink.Api.Services;
using HealthLink.Api.Services.Interfaces;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

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

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Auth services
builder.Services.AddScoped<IAuthService, AuthService>();
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

// API-3 Services (Review & Complaint)
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IComplaintService, ComplaintService>();

// API-4 Services (Messaging)
builder.Services.AddScoped<IMessagingService, MessagingService>();

// API-5 Services (Content & Admin)
builder.Services.AddScoped<IContentService, ContentService>();

// Existing services
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IExpertAvailabilityService, ExpertAvailabilityService>();

// JWT Authentication - Temporarily disabled
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
            // TODO: TEMPORARY - All validation disabled for debugging
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = false,
            ValidateIssuerSigningKey = false,
            
            RoleClaimType = "role"
        };

        // DEBUG: Log JWT events
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Headers["Authorization"].FirstOrDefault();
                Console.WriteLine($"[JWT] Authorization header: {token}");
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[JWT] Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine($"[JWT] Token validated successfully. Claims count: {context.Principal?.Claims.Count()}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

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

// CORS
app.UseCors();

// Custom JWT Middleware (replaces broken ASP.NET Core JWT Bearer)
app.UseMiddleware<HealthLink.Api.Middleware.SimpleJwtMiddleware>();

// Authorization (authentication is handled by SimpleJwtMiddleware above)
app.UseAuthorization();

app.MapControllers();

app.Run();
