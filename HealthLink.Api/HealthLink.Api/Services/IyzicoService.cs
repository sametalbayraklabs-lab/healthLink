using System.Globalization;
using HealthLink.Api.Services.Interfaces;
using Iyzipay;
using Iyzipay.Model;
using Iyzipay.Request;
using Newtonsoft.Json;

namespace HealthLink.Api.Services;

public class IyzicoService : IIyzicoService
{
    private readonly Options _options;
    private readonly ILogger<IyzicoService> _logger;

    public IyzicoService(IConfiguration configuration, ILogger<IyzicoService> logger)
    {
        _logger = logger;
        _options = new Options
        {
            ApiKey = configuration["Iyzico:ApiKey"]!,
            SecretKey = configuration["Iyzico:SecretKey"]!,
            BaseUrl = configuration["Iyzico:BaseUrl"]!
        };
    }

    public async Task<(string CheckoutFormContent, string Token)> InitializeCheckoutFormAsync(
        long paymentId,
        decimal amount,
        string currency,
        string buyerName,
        string buyerSurname,
        string buyerEmail,
        string? buyerPhone,
        string buyerIp,
        string itemName,
        string callbackUrl)
    {
        var request = new CreateCheckoutFormInitializeRequest
        {
            Locale = Locale.TR.ToString(),
            ConversationId = paymentId.ToString(),
            Price = amount.ToString("F2", CultureInfo.InvariantCulture),
            PaidPrice = amount.ToString("F2", CultureInfo.InvariantCulture),
            Currency = currency == "TRY" ? Currency.TRY.ToString() : Currency.TRY.ToString(),
            BasketId = $"PKG-{paymentId}",
            PaymentGroup = PaymentGroup.PRODUCT.ToString(),
            CallbackUrl = callbackUrl
        };

        // Buyer info
        var buyer = new Buyer
        {
            Id = $"USR-{paymentId}",
            Name = buyerName,
            Surname = buyerSurname,
            GsmNumber = buyerPhone ?? "+905000000000",
            Email = buyerEmail,
            IdentityNumber = "11111111111", // TC kimlik — sandbox için sabit
            RegistrationAddress = "Türkiye",
            Ip = buyerIp,
            City = "Istanbul",
            Country = "Turkey",
            ZipCode = "34000"
        };
        request.Buyer = buyer;

        // Address (required by Iyzico)
        var address = new Address
        {
            ContactName = $"{buyerName} {buyerSurname}",
            City = "Istanbul",
            Country = "Turkey",
            Description = "Türkiye",
            ZipCode = "34000"
        };
        request.ShippingAddress = address;
        request.BillingAddress = address;

        // Basket items (at least one required)
        var basketItems = new List<BasketItem>
        {
            new BasketItem
            {
                Id = $"ITEM-{paymentId}",
                Name = itemName,
                Category1 = "Sağlık Hizmetleri",
                ItemType = BasketItemType.VIRTUAL.ToString(),
                Price = amount.ToString("F2", CultureInfo.InvariantCulture)
            }
        };
        request.BasketItems = basketItems;

        _logger.LogInformation("Initializing Iyzico checkout form for Payment {PaymentId}, Amount: {Amount} {Currency}",
            paymentId, amount, currency);

        // Iyzico SDK is synchronous, run on thread pool
        var result = await Task.Run(() =>
            CheckoutFormInitialize.Create(request, _options));

        if (result.Status == "success")
        {
            _logger.LogInformation("Iyzico checkout form initialized successfully. Token: {Token}", result.Token);
            return (result.CheckoutFormContent, result.Token);
        }

        _logger.LogError("Iyzico checkout form initialization failed: {ErrorCode} - {ErrorMessage}",
            result.ErrorCode, result.ErrorMessage);
        throw new Exception($"Iyzico ödeme başlatılamadı: {result.ErrorMessage}");
    }

    public async Task<IyzicoPaymentResult> RetrieveCheckoutFormResultAsync(string token)
    {
        var request = new RetrieveCheckoutFormRequest
        {
            Token = token
        };

        _logger.LogInformation("Retrieving Iyzico checkout form result for token: {Token}", token);

        var result = await Task.Run(() =>
            CheckoutForm.Retrieve(request, _options));

        var rawResponse = JsonConvert.SerializeObject(result);

        if (result.Status == "success" && result.PaymentStatus == "SUCCESS")
        {
            _logger.LogInformation("Iyzico payment successful. PaymentId: {PaymentId}", result.PaymentId);
            return new IyzicoPaymentResult
            {
                IsSuccess = true,
                PaymentId = result.PaymentId,
                ConversationId = result.ConversationId,
                RawResponse = rawResponse
            };
        }

        _logger.LogWarning("Iyzico payment failed or pending. Status: {Status}, PaymentStatus: {PaymentStatus}, Error: {Error}",
            result.Status, result.PaymentStatus, result.ErrorMessage);
        return new IyzicoPaymentResult
        {
            IsSuccess = false,
            PaymentId = result.PaymentId,
            ConversationId = result.ConversationId,
            ErrorMessage = result.ErrorMessage ?? "Ödeme başarısız.",
            RawResponse = rawResponse
        };
    }
}
