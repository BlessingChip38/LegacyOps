using Dapper;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using LegacyOps.DTOs;
using LegacyOps.Enum;


namespace LegacyOps.Repositories
{
    public class MachineRepository
    {
        private readonly string? _connectionString;

        public MachineRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<IEnumerable<MachineResponse>> GetAllMachinesAsync()
        {
            using var connection = new MySqlConnection(_connectionString);
            var machines = await connection.QueryAsync<MachineResponse>(
                "SELECT * FROM machines"
                );
            foreach(var machine in machines)
            {
                Normalize(machine);
            }
            return machines;
        }

        public async Task<MachineResponse?> GetMachineByIdAsync(int id)
        {
            using var connection = new MySqlConnection(_connectionString);
            var machine = await connection.QueryFirstOrDefaultAsync<MachineResponse>(
                "SELECT * FROM machines WHERE id = @Id",
                new { Id = id }
                );
            if (machine != null) 
            { 
                Normalize(machine); 
            }
            return machine;
        }

        public async Task<IEnumerable<MachineResponse>> GetMachinesByJobIdAsync(int jobId)
        {
            using var connection = new MySqlConnection(_connectionString);
            var machines = await connection.QueryAsync<MachineResponse>(
                "SELECT * FROM machines WHERE jobId = @JobId",
                new { JobId = jobId }
                );
            foreach(var machine in machines)
            {
                Normalize(machine);
            }
            return machines;
        }

        public async Task<MachineResponse?> CreateMachineAsync(CreateMachineRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);

            var status = MachineStatus.idle;
            var today = DateTime.UtcNow;
            await connection.ExecuteAsync(
                "INSERT INTO machines (name, serial, hours, lastGreased, serviceInterval, lastServiceDate, lastServiceHours,  status) VALUES (@Name, @Serial, @Hours, @LastGreased, @ServiceInterval, @LastServiceDate, @LastServiceHours, @Status)",
                new
                {
                    Name = request.Name,
                    Serial = request.Serial,
                    Hours = request.Hours,
                    LastGreased = today,
                    ServiceInterval = request.ServiceInterval,
                    LastServiceDate = today,
                    LastServiceHours = request.Hours,
                    Status = status
                }
                );
            var id = await connection.ExecuteScalarAsync<int>("SELECT LAST_INSERT_ID()");

            return await GetMachineByIdAsync(id);
        }

        // TODO: Consider implementing soft delete by adding an IsActive column to the machines table and updating the queries accordingly.
        public async Task<bool> DeleteMachineAsync(int id)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.ExecuteAsync(
                "DELETE FROM machines WHERE id = @Id",
                new { Id = id }
            );
            return true;
        }

        public async Task UpdateMachineStatusAsync(int id, MachineStatus status)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.ExecuteAsync(
                "UPDATE machines SET status = @Status WHERE id = @Id",
                new { Status = status, Id = id }
            );
        }

        public async Task UpdateMachineRunningAsync(int id, UpdateMachineRunningStatusRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.ExecuteAsync(
                "UPDATE machines SET status = @Status, hours = @Hours WHERE id = @Id",
                new { Id = id, Status = request.Status, Hours = request.Hours }
                );
        }

        public async Task UpdateMachineMaintenanceAsync(int id, UpdateMachineMaintenanceRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);

            if (request.Greased)
            {
                var greasedDate = DateTime.UtcNow;
                await connection.ExecuteAsync(
                    "UPDATE machines SET lastGreased = @LastGreased WHERE id=@Id",
                    new { LastGreased = greasedDate, Id = id }
                    );
            }

            if (request.LastServiceHours.HasValue)
            {
                Console.WriteLine(request.LastServiceHours);
                var serviceDate = DateTime.UtcNow;
                await connection.ExecuteAsync(
                    "UPDATE machines SET lastServiceHours = @LastServiceHours, " +
                    "lastServiceDate = @LastServiceDate WHERE id = @Id",
                    new { LastServiceHours = request.LastServiceHours, LastServiceDate = serviceDate, Id = id }
                    );
            }
        }

        private static DateTime EnsureUtc(DateTime dt)
        {
            return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
        }

        private void Normalize(MachineResponse machine)
        {
            machine.LastGreased = EnsureUtc(machine.LastGreased);
            machine.LastServiceDate = EnsureUtc(machine.LastServiceDate);
        }

    }
}
