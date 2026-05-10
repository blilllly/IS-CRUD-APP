using backend.DTOs;
using backend.Hubs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MoviesController(IMovieService service, IHubContext<MovieHub> hub) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var movie = await service.GetByIdAsync(id);
        return movie is null ? NotFound() : Ok(movie);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMovieDto dto)
    {
        var created = await service.CreateAsync(dto);
        await hub.Clients.All.SendAsync("MovieCreated", created);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMovieDto dto)
    {
        var updated = await service.UpdateAsync(id, dto);
        if (updated is null) return NotFound();
        await hub.Clients.All.SendAsync("MovieUpdated", updated);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await service.DeleteAsync(id);
        if (!deleted) return NotFound();
        await hub.Clients.All.SendAsync("MovieDeleted", id);
        return NoContent();
    }
}
