using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

[Authorize]
public class MovieHub : Hub { }
