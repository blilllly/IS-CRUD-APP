using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class MovieRepository(AppDbContext context) : IMovieRepository
{
    public async Task<IEnumerable<Movie>> GetAllAsync() =>
        await context.Movies.OrderByDescending(m => m.CreatedAt).ToListAsync();

    public async Task<Movie?> GetByIdAsync(int id) =>
        await context.Movies.FindAsync(id);

    public async Task<Movie> CreateAsync(Movie movie)
    {
        context.Movies.Add(movie);
        await context.SaveChangesAsync();
        return movie;
    }

    public async Task<Movie?> UpdateAsync(int id, Movie updated)
    {
        var movie = await context.Movies.FindAsync(id);
        if (movie is null) return null;

        movie.Name = updated.Name;
        movie.Category = updated.Category;
        movie.Description = updated.Description;
        movie.Status = updated.Status;

        await context.SaveChangesAsync();
        return movie;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var movie = await context.Movies.FindAsync(id);
        if (movie is null) return false;

        context.Movies.Remove(movie);
        await context.SaveChangesAsync();
        return true;
    }
}
