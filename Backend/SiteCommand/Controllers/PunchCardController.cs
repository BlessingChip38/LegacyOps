using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LegacyOps.DTOs;
using LegacyOps.Repositories;

namespace LegacyOps.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PunchCardController : ControllerBase
    {
        private readonly PunchCardRepository _punchCardRepository;


        public PunchCardController(PunchCardRepository punchCardRepository)
        {
            _punchCardRepository = punchCardRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPunchCards()
        {
            var punchCards = await _punchCardRepository.GetAllPunchCardsAsync();
            return Ok(punchCards);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPunchCardById(int id)
        {
            var punchCard = await _punchCardRepository.GetPunchCardByIdAsync(id);
            if (punchCard == null)
            {
                return NotFound("Punch card not found");
            }
            return Ok(punchCard);
        }

        [HttpGet("employee/{empId}")]
        public async Task<IActionResult> GetPunchCardsByEmployeeId(int empId)
        {
            var punchCards = await _punchCardRepository.GetPunchCardsByEmployeeIdAsync(empId);
            return Ok(punchCards);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePunchCard(CreatePunchCardRequest request)
        {

            //if (string.IsNullOrEmpty(request.EmpId) || string.IsNullOrEmpty(request.JobId))
            //{
            //    Console.WriteLine("Getting the missing id error.");
            //    return BadRequest("Missing important identification data.");
            //}
            Console.WriteLine("It is working to here.");
            var createdPunchCard = await _punchCardRepository.CreatePunchCardAsync(request);
            return CreatedAtAction(nameof(GetPunchCardById), new { id = createdPunchCard?.Id }, createdPunchCard);
        }

        [HttpPatch("{id}/clockout")]
        public async Task<IActionResult> ClockOut(int id)
        {
            var punchCard = await _punchCardRepository.UpdateClockOutPunchCardAsync(id);
            if (punchCard == null) return NotFound();

            return Ok(punchCard);
        }
    }
}
