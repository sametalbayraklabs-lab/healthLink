using HealthLink.Api.Dtos.Content;

namespace HealthLink.Api.Services.Interfaces;

public interface IContentService
{
    Task<List<ContentItemDto>> GetPublishedContentAsync(string? type = null);
    Task<ContentItemDto> GetContentBySlugAsync(string slug);
    Task<ContentItemDto> CreateContentAsync(CreateContentRequest request);
    Task<ContentItemDto> PublishContentAsync(long id);
}
