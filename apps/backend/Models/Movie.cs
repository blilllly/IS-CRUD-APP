namespace backend.Models;

public enum MovieStatus
{
    Disponible,
    NoDisponible,
    Proximamente,
    Archivada
}

public class Movie
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MovieStatus Status { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
