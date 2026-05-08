using backend.Models;

namespace backend.DTOs;

public record MovieDto(int Id, string Name, string Category, string Description, MovieStatus Status, DateTime CreatedAt, DateTime? ReleaseDate, decimal? Revenue);

public record CreateMovieDto(string Name, string Category, string Description, MovieStatus Status, DateTime? ReleaseDate, decimal? Revenue);

public record UpdateMovieDto(string Name, string Category, string Description, MovieStatus Status, DateTime? ReleaseDate, decimal? Revenue);
