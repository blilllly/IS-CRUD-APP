using backend.Models;

namespace backend.DTOs;

public record MovieDto(int Id, string Name, string Category, string Description, MovieStatus Status, DateTime CreatedAt);

public record CreateMovieDto(string Name, string Category, string Description, MovieStatus Status);

public record UpdateMovieDto(string Name, string Category, string Description, MovieStatus Status);
