
using LegacyOps.Enum;

namespace LegacyOps.DTOs
{
    public class LoginResponse
    {
        public string? Token { get; set; }
        public EmployeeRole Role { get; set; }
        public int Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public bool MustChangePassword { get; set; }

    }

    public class LoginRequest
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
    }
}
