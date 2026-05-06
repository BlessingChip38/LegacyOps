using LegacyOps.Enum;

namespace LegacyOps.DTOs
{
    public class EmployeeResponse
    {
        public int Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public EmployeeRole Role { get; set; }
        public string? Avatar { get; set; }
        public string? Username { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateEmployeeResponse
    {
        public int Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        public EmployeeRole Role { get; set; }
        public string? TempPassword { get; set; }
    }

    public class CreateEmployeeRequest
    {
        public int Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public EmployeeRole Role { get; set; }
    }

    public class UpdateEmployeeRoleRequest
    {
        public EmployeeRole Role { get; set; }
    }

    public class EmployeePasswordResetResponse
    {
        public string? Username { get; set; }
        public string? TempPassword { get; set; }
    }

}
