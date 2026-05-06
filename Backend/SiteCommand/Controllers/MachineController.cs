using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LegacyOps.DTOs;
using LegacyOps.Repositories;

namespace LegacyOps.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MachineController : ControllerBase
    {
        private readonly MachineRepository _machineRepository;

        public MachineController(MachineRepository machineRepository)
        {
            _machineRepository = machineRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMachines()
        {
            var machines = await _machineRepository.GetAllMachinesAsync();
            return Ok(machines);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMachineById(int id)
        {
            var machine = await _machineRepository.GetMachineByIdAsync(id);
            if (machine == null)
            {
                return NotFound();
            }

            return Ok(machine);
        }

        [HttpGet("job/{jobId}")]
        public async Task<IActionResult> GetMachinesByJobId(int jobId)
        {
            var machines = await _machineRepository.GetMachinesByJobIdAsync(jobId);
            return Ok(machines);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateMachine([FromBody] CreateMachineRequest request)
        {
            var createdMachine = await _machineRepository.CreateMachineAsync(request);
            return CreatedAtAction(nameof(GetMachineById), new { id = createdMachine?.Id }, createdMachine);

        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMachine(int id)
        {
            var hardDeleted = await _machineRepository.DeleteMachineAsync(id);
            return Ok(hardDeleted);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateMachineStatus(int id, [FromBody] UpdateMachineStatusRequest request)
        {
            await _machineRepository.UpdateMachineStatusAsync(id, request.Status);
            return NoContent();
        }

        [HttpPatch("{id}/maintenance")]
        public async Task<IActionResult> UpdateMaintenance(int id, [FromBody] UpdateMachineMaintenanceRequest request)
        {
            await _machineRepository.UpdateMachineMaintenanceAsync(id, request);
            return NoContent();
        }

        [HttpPatch("{id}/startMachine")]
        public async Task<IActionResult> StartMachine(int id, [FromBody] UpdateMachineRunningStatusRequest request)
        {
            await _machineRepository.UpdateMachineRunningAsync(id, request);
            return NoContent();
        }
    }
}
