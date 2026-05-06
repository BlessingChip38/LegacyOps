using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LegacyOps.DTOs;
using LegacyOps.Repositories;

namespace LegacyOps.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuthController : ControllerBase
    {
        private readonly AuthRepository _authRepository;

        public AuthController(AuthRepository authRepository)
        {
            _authRepository = authRepository;
        }


        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Username and password are required.");
            }
            Console.WriteLine($"Info: Login request -- Username: {request.Username} Password: {request.Password}");
            var response = await _authRepository.LoginAsync(request);

            if (response == null)
            {
                Console.WriteLine("Access denied. Invalid username or password.");
                return Unauthorized("Invalid username or password.");
            }
            Console.WriteLine($"Access Granted: Username:{response.FirstName}, Role:{response.Role}");            

            return Ok(response);
        }
        
        [HttpPost("changePassword")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            if  (string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest("Missing required fields.");
            }

            var success = await _authRepository.ChangePasswordAsync(request);

            if (!success)
            {
                return BadRequest("Failed to change password.");
            }

            return Ok("Password changed successfully.");
        }


    }
}