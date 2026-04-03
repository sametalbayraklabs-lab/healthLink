# Multi-stage Dockerfile for .NET 8 Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
# Build context is expected to be c:\Workspaces\Healthlink\healthLink\HealthLink.Api
COPY ["HealthLink.Api/HealthLink.Api.csproj", "HealthLink.Api/"]
COPY ["Common/Common.csproj", "Common/"]
# If you have other project references (like Entities or Dtos), copy them here
# Note: Currently adjusting path strictly per HealthLink.Api.csproj existence
RUN dotnet restore "HealthLink.Api/HealthLink.Api.csproj"

# Copy remaining source code and build
COPY . .
WORKDIR "/src/HealthLink.Api"
RUN dotnet build "HealthLink.Api.csproj" -c Release -o /app/build

# Publish optimized binaries
FROM build AS publish
RUN dotnet publish "HealthLink.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final production runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080

COPY --from=publish /app/publish .

# Run the API
ENTRYPOINT ["dotnet", "HealthLink.Api.dll"]
