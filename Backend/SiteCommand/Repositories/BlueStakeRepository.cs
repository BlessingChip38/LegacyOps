using Dapper;
using MySql.Data.MySqlClient;
using LegacyOps.DTOs;
using LegacyOps.Enum;

namespace LegacyOps.Repositories
{
    public class BlueStakeRepository
    {
        private readonly string? _connectionString;

        public BlueStakeRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<BlueStakeResponse?> GetBlueStakeByIdAsync(int id)
        {
            using var connection = new MySqlConnection(_connectionString);
            var blueStake = await connection.QueryFirstOrDefaultAsync<BlueStakeResponse>(
                "SELECT * FROM blue_stakes WHERE id = @Id",
                new { Id = id }
                );
            if (blueStake == null)
            {
                return null;
            }
            blueStake.Status = CalculateStatus(blueStake.LegalDigDate, blueStake.ExpiryDate);
            return blueStake;

        }
        public async Task<IEnumerable<BlueStakeResponse?>> GetAllBlueStakesAsync()
        {
            using var connection = new MySqlConnection(_connectionString);
            var blueStakes = await connection.QueryAsync<BlueStakeResponse>(
                "SELECT * FROM blue_stakes"
                );
            foreach (var blueStake in blueStakes)
            {
                blueStake.Status = CalculateStatus(blueStake.LegalDigDate, blueStake.ExpiryDate);
            }
            return blueStakes;
        }


        public async Task<IEnumerable<BlueStakeResponse?>> GetAllBlueStakesByJobIdAsync(int jobId)
        {
            using var connection = new MySqlConnection(_connectionString);
            var blueStakes = await connection.QueryAsync<BlueStakeResponse>(
                "SELECT * FROM blue_stakes WHERE jobId = @JobId",
                new { JobId = jobId }
                );
            foreach (var blueStake in blueStakes)
            {
                blueStake.Status = CalculateStatus(blueStake.LegalDigDate, blueStake.ExpiryDate);
            }
            return blueStakes;
        }

        public async Task<BlueStakeResponse?> CreateBlueStakeAsync(CreateBlueStakeRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);
            //var id = "BS" + DateTime.Now.ToString("yyyyMMddHHmmss");

            await connection.ExecuteAsync(
                "INSERT INTO blue_stakes (jobId, ticketNumber, requestDate, legalDigDate, expiryDate, notes, calledInBy) VALUES (@JobId, @TicketNumber, @RequestDate, @LegalDigDate, @ExpiryDate, @Notes, @CalledInBy)",
                new
                {
                    JobId = request.JobId,
                    TicketNumber = request.TicketNumber,
                    RequestDate = request.RequestDate,
                    LegalDigDate = request.LegalDigDate,
                    ExpiryDate = request.ExpiryDate,
                    Notes = request.Notes,
                    CalledInBy = request.CalledInBy
                }
                );
            var id = await connection.ExecuteScalarAsync<int>("SELECT LAST_INSERT_ID()");

            return await GetBlueStakeByIdAsync(id);
        }

        public BlueStakeStatus CalculateStatus(DateTimeOffset legalDigDate, DateTimeOffset expiryDate)
        {
            var today = DateTime.Today;
            if (today < legalDigDate)
            {
                return BlueStakeStatus.pending;
            }
            else if (today >= legalDigDate && today <= expiryDate)
            {
                return BlueStakeStatus.active;
            }
            else
            {
                return BlueStakeStatus.expired;
            }
        }
    }
}
