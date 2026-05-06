using Dapper;
using Microsoft.AspNetCore.WebUtilities;
using MySql.Data.MySqlClient;
using LegacyOps.DTOs;
using LegacyOps.Enum;


namespace LegacyOps.Repositories
{
    public class EmployeeRepository
    {
        private readonly string _connectionString;

        public EmployeeRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<IEnumerable<EmployeeResponse>> GetAllEmpoyeesAsync()
        {
            using var connection = new MySqlConnection(_connectionString);
            var employees = await connection.QueryAsync<EmployeeResponse>(
                "SELECT * FROM employees WHERE isActive = true"
            );
            return employees;
        }

        public async Task<EmployeeResponse?> GetEmployeeByIdAsync(int id)
        {
            using var connection = new MySqlConnection(_connectionString);
            var employee = await connection.QueryFirstOrDefaultAsync<EmployeeResponse>(
                "SELECT * FROM employees WHERE id = @Id",
                new{ Id = id });
            return employee;
        }

        public async Task<CreateEmployeeResponse?> CreateEmployeeAsync(CreateEmployeeRequest request)
        {
            if (string.IsNullOrEmpty(request.FirstName) || string.IsNullOrEmpty(request.LastName))
            {
                return null;
            }
            using var connection = new MySqlConnection(_connectionString);
            var username = await GenerateUserNameAsync(connection, request.FirstName, request.LastName);
            var tempPassword = GenerateTempPassword();
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword);
            var avatar = $"{request.FirstName[0]}{request.LastName[0]}";

            await connection.ExecuteAsync(
                "INSERT INTO employees (firstName, lastName, role, avatar, username, passwordHash, mustResetPassword, isActive) " +
                "VALUES (@FirstName, @LastName, @Role, @Avatar, @Username, @PasswordHash, @MustResetPassword, @IsActive)",
                new {FirstName = request.FirstName, LastName = request.LastName, Role =request.Role, Avatar = avatar, 
                    Username = username, PasswordHash = passwordHash, MustResetPassword = true, @IsActive = true }
                );
            return new CreateEmployeeResponse
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Username = username,
                Role = request.Role,
                TempPassword = tempPassword
            };
        }


        public async Task DeleteEmployeeAsync(int id)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.ExecuteAsync(
                "UPDATE employees SET isActive = false WHERE id=@Id",
                new { Id = id });
        }

        public async Task UpdateEmployeeRoleAsync(int id, EmployeeRole role)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.ExecuteAsync(
                "UPDATE employees SET role = @Role WHERE id = @Id",
                new { role = role, Id = id });
        }

        private async Task<string> GenerateUserNameAsync(MySqlConnection connection, string firstName, string lastName)
        {

            for(int i = 1; i <= firstName.Length; i++)
            {
                var username = firstName.Substring(0, i).ToLower() + lastName.ToLower();
                var exists = await connection.QueryFirstOrDefaultAsync<string>(
                    "SELECT username FROM employees WHERE username = @Username",
                    new { Username = username }
                );
                if (exists == null) 
                { 
                    return username; 
                }
            }

            var fallback = firstName.ToLower() + lastName.ToLower() + "2";
            return fallback;
        }

        public async Task<EmployeePasswordResetResponse?> ResetTempPasswordAsync(int id)
        {
            using var connection = new MySqlConnection(_connectionString);

            var tempPassword = GenerateTempPassword();
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword);

            await connection.ExecuteAsync(
                "UPDATE employees SET passwordHash = @PasswordHash, mustResetPassword = TRUE " +
                "WHERE id = @Id",
                new { PasswordHash = passwordHash, Id = id });

            var username = await connection.ExecuteScalarAsync<string>(
                "SELECT username FROM employees WHERE id = @Id",
                new { Id = id });
            return new EmployeePasswordResetResponse 
            
            {
                TempPassword = tempPassword,
                Username = username
            };
        }

        private string GenerateTempPassword()
        {
            var words = new[] { "Dirt", "Rock", "Grade", "Dig", "Fill" };
            var word = words[new Random().Next(words.Length)];
            var number = new Random().Next(1000, 9999);
            return $"{word}#{number}";
        }
    }
}
