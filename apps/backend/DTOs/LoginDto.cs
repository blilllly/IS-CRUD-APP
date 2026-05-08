namespace backend.DTOs;

public record LoginRequestDto(string Username, string Password);

public record LoginResponseDto(string Token);
