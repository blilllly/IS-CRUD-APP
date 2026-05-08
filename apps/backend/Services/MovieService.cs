using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public class MovieService(IMovieRepository repository) : IMovieService
{
    public async Task<IEnumerable<MovieDto>> GetAllAsync()
    {
        var movies = await repository.GetAllAsync();
        return movies.Select(ToDto);
    }

    public async Task<MovieDto?> GetByIdAsync(int id)
    {
        var movie = await repository.GetByIdAsync(id);
        return movie is null ? null : ToDto(movie);
    }

    public async Task<MovieDto> CreateAsync(CreateMovieDto dto)
    {
        var movie = new Movie
        {
            Name = dto.Name,
            Category = dto.Category,
            Description = dto.Description,
            Status = dto.Status
        };
        var created = await repository.CreateAsync(movie);
        return ToDto(created);
    }

    public async Task<MovieDto?> UpdateAsync(int id, UpdateMovieDto dto)
    {
        var updated = new Movie
        {
            Name = dto.Name,
            Category = dto.Category,
            Description = dto.Description,
            Status = dto.Status
        };
        var result = await repository.UpdateAsync(id, updated);
        return result is null ? null : ToDto(result);
    }

    public async Task<bool> DeleteAsync(int id) =>
        await repository.DeleteAsync(id);

    private static MovieDto ToDto(Movie m) =>
        new(m.Id, m.Name, m.Category, m.Description, m.Status, m.CreatedAt);
}
