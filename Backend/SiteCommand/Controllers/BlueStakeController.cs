using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LegacyOps.DTOs;
using LegacyOps.Repositories;

namespace LegacyOps.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BlueStakeController : ControllerBase
    {
        private readonly BlueStakeRepository _blueStakeRepository;

        public BlueStakeController(BlueStakeRepository blueStakeRepository)
        {
            _blueStakeRepository = blueStakeRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBlueStakes()
        {
            var blueStakes = await _blueStakeRepository.GetAllBlueStakesAsync();
            return Ok(blueStakes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBlueStakeById(int id)
        {
            var blueStake = await _blueStakeRepository.GetBlueStakeByIdAsync(id);
            if (blueStake == null)
            {
                return NotFound();
            }
            return Ok(blueStake);

        }

        [HttpGet("job/{jobId}")]
        public async Task<IActionResult> GetBlueStakesByJobId(int jobId)
        {
            var blueStakes = await _blueStakeRepository.GetAllBlueStakesByJobIdAsync(jobId);
            return Ok(blueStakes);
        }

        [HttpPost]
        public async Task<IActionResult> CreateBlueStake(CreateBlueStakeRequest request)
        {
            var blueStake = await _blueStakeRepository.CreateBlueStakeAsync(request);
            if (blueStake == null)
            {
                return BadRequest();
            }
            return CreatedAtAction(nameof(GetBlueStakeById), new { id = blueStake.Id }, blueStake);
        }

    }

}
