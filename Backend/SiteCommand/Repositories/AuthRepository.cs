using Dapper;
using Microsoft.IdentityModel.Tokens;
using MySql.Data.MySqlClient;
using LegacyOps.DTOs;
using LegacyOps.Enum;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LegacyOps.Repositories
{
    public class AuthRepository
    {
        private readonly string _connectionString;
        private readonly IConfiguration _configuration;

        public AuthRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!; ;
            _configuration = configuration;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);
            
            if(string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return null;
            }

            var username = request.Username.ToLower();
            
            var employee = await connection.QueryFirstOrDefaultAsync(
                "SELECT * FROM employees WHERE username = @Username and isActive = true",
                new { Username = username }
                );
            

            if (employee != null)
            {
                var id = employee.id;
                var role = System.Enum.Parse<EmployeeRole>(employee.role);
                var mustChange = Convert.ToBoolean(employee.mustResetPassword);
                var hash = employee.passwordHash;

                if (hash == null)
                {
                    return null;
                }
                if (BCrypt.Net.BCrypt.Verify(request.Password, (string)hash))
                {
                    
                    return new LoginResponse
                    {
                        Token = GenerateToken(id, role, mustChange),
                        Role = role,
                        Id = id,
                        FirstName = employee.firstName,
                        LastName = employee.lastName,
                        MustChangePassword = mustChange
                    };

                }
            }
            return null;
        }

        private string GenerateToken(int empId, EmployeeRole role, bool mustChangePassword)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
                );
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, empId.ToString()),
                new Claim(ClaimTypes.Role, role.ToString()),
                new Claim("mustChangePassword", mustChangePassword.ToString().ToLower())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<bool> ChangePasswordAsync(ChangePasswordRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);

            var employee = await connection.QueryFirstOrDefaultAsync(
                "SELECT * FROM employees WHERE id = @Id",
                new { Id = request.EmpId }
            );

            if (employee == null) return false;
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, employee.passwordHash)) return false;

            var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            await connection.ExecuteAsync(
                "UPDATE employees SET passwordHash = @Hash, mustResetPassword = false WHERE id = @Id",
                new { Hash = newHash, Id = request.EmpId }
            );

            return true;
        }
    }
}
