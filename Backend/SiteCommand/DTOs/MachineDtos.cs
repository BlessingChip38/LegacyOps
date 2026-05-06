using LegacyOps.Enum;

namespace LegacyOps.DTOs
{
    public class MachineResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Serial { get; set; }
        public decimal Hours { get; set; }
        public DateTimeOffset? LastGreased { get; set; }
        public int ServiceInterval { get; set; }
        public DateTimeOffset? LastServiceDate { get; set; }
        public int LastServiceHours { get; set; }
        public MachineStatus Status { get; set; }

        public int JobId { get; set; }
    }

    public class CreateMachineRequest
    {
        public string? Name { get; set; }
        public string? Serial { get; set; }
        public decimal Hours { get; set; }
        public int ServiceInterval { get; set; }


    }

    public class UpdateMachineStatusRequest
    {
        public MachineStatus Status { get; set; }
    }

    public class UpdateMachineMaintenanceRequest
    {
        public bool Greased { get; set; }
        public int? LastServiceHours { get; set; }

    }

    public class UpdateMachineRunningStatusRequest
    {
        public decimal Hours { get; set; }
        public MachineStatus Status { get; set; }
    }
}
