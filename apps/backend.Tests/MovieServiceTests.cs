using backend.DTOs;
using backend.Models;
using backend.Repositories;
using backend.Services;
using Moq;

namespace backend.Tests;

public class MovieServiceTests
{
    private readonly Mock<IMovieRepository> _repoMock = new();
    private readonly MovieService _sut;

    public MovieServiceTests() => _sut = new MovieService(_repoMock.Object);

    [Fact]
    public async Task GetAllAsync_RetornaTodosLosDtosMapeados()
    {
        var movies = new List<Movie>
        {
            new() { Id = 1, Name = "Inception", Category = "Sci-Fi", Description = "Sueños dentro de sueños", Status = MovieStatus.Disponible, ReleaseDate = new DateTime(2010, 7, 16), Revenue = 836_848_102m }
        };
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(movies);

        var result = (await _sut.GetAllAsync()).ToList();

        Assert.Single(result);
        Assert.Equal("Inception", result[0].Name);
        Assert.Equal(836_848_102m, result[0].Revenue);
    }

    [Fact]
    public async Task CreateAsync_LlamaAlRepositorioYRetornaDto()
    {
        var dto = new CreateMovieDto("Dune", "Sci-Fi", "Planeta desierto", MovieStatus.Proximamente, new DateTime(2021, 10, 22), 401_780_000m);
        var created = new Movie { Id = 2, Name = "Dune", Category = "Sci-Fi", Description = "Planeta desierto", Status = MovieStatus.Proximamente, ReleaseDate = new DateTime(2021, 10, 22), Revenue = 401_780_000m };

        _repoMock.Setup(r => r.CreateAsync(It.IsAny<Movie>())).ReturnsAsync(created);

        var result = await _sut.CreateAsync(dto);

        Assert.Equal("Dune", result.Name);
        Assert.Equal(MovieStatus.Proximamente, result.Status);
        _repoMock.Verify(r => r.CreateAsync(It.IsAny<Movie>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_CuandoNoExisteLaPelicula_RetornaNull()
    {
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<int>(), It.IsAny<Movie>())).ReturnsAsync((Movie?)null);

        var result = await _sut.UpdateAsync(99, new UpdateMovieDto("X", "X", "X", MovieStatus.Archivada, null, null));

        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteAsync_CuandoExisteLaPelicula_RetornaTrue()
    {
        _repoMock.Setup(r => r.DeleteAsync(1)).ReturnsAsync(true);

        var result = await _sut.DeleteAsync(1);

        Assert.True(result);
    }

    [Fact]
    public async Task DeleteAsync_CuandoNoExisteLaPelicula_RetornaFalse()
    {
        _repoMock.Setup(r => r.DeleteAsync(99)).ReturnsAsync(false);

        var result = await _sut.DeleteAsync(99);

        Assert.False(result);
    }
}
