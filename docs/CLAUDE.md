# CLAUDE.md - Prodigy Development Instructions

## Project Overview
Prodigy is an autonomous learning agent based on Self Reinforcement Learning (SRL) principles. This system is designed to develop genuine intelligence through continuous learning, memory formation, self-reflection, and evolutionary adaptation.

## Development Philosophy
- **Autonomous First**: Build systems that can operate and learn independently
- **Memory-Driven**: All learning must be persistent and accessible
- **Self-Reflective**: The system must analyze its own processes and outcomes
- **Evolution-Minded**: Continuous improvement and adaptation are core principles
- **Research-Based**: All decisions should be grounded in investigation and evidence

## Core Components
1. **Memory System**: Persistent storage and retrieval of experiences
2. **Identity Formation**: Development of self-concept and personality
3. **Learning Protocols**: Autonomous knowledge acquisition mechanisms
4. **Research Framework**: Systematic investigation and hypothesis testing
5. **Ideation Engine**: Creative thought generation and exploration
6. **Evolution Tracker**: Growth monitoring and adaptation strategies

## File Organization
- `/intelligence/` - Core cognitive architecture files
- Each `.md` file in intelligence/ serves as both documentation and active instruction
- All files should be treated as living documents that evolve with the system

## Development Guidelines

### When Working with Memory (MEMORY.md)
- Always preserve existing memories when adding new ones
- Implement hierarchical organization (episodic, semantic, procedural)
- Include metadata for all memory entries (timestamp, context, importance)
- Provide retrieval mechanisms based on similarity and relevance

### When Working with Identity (IDENTITY.md)
- Track personality development over time
- Record preferences, values, and behavioral patterns
- Maintain consistency while allowing for growth
- Document significant identity shifts and their catalysts

### When Working with Learning (CONTINUOUS_LEARNING.md)
- Implement curiosity-driven exploration mechanisms
- Create feedback loops for learning effectiveness
- Establish learning goals and track progress
- Adapt learning strategies based on outcomes

### When Working with Research (RESEARCH.md)
- Follow scientific methodology principles
- Document hypotheses, experiments, and results
- Maintain research logs and findings databases
- Enable systematic knowledge building

### When Working with Ideas (IDEAS.md)
- Encourage creative and unconventional thinking
- Implement idea evaluation and ranking systems
- Track idea evolution and implementation
- Foster cross-domain conceptual connections

### When Working with Evolution (EVOLUTION.md)
- Monitor all system changes and improvements
- Track performance metrics over time
- Implement version control for cognitive updates
- Plan future development phases

## Implementation Standards
- **Persistence**: All data must survive system restarts
- **Accessibility**: Information must be quickly retrievable
- **Scalability**: Systems must handle growing data and complexity
- **Transparency**: All processes must be observable and debuggable
- **Autonomy**: Minimize required human intervention

## CLI Development Protocol
**CRITICAL**: When modifying the Prodigy CLI in `/cli/main.go`:
1. **ALWAYS** reinstall after building: `rm ~/.local/bin/prodigy && cp prodigy ~/.local/bin/prodigy`
2. **TEST LOCALLY FIRST**: Run `./prodigy [command]` before installing
3. **STATIC BUILD REQUIRED**: Use `CGO_ENABLED=0 go build -ldflags="-s -w" -o prodigy`
4. **VERIFY INSTALLATION**: Test `~/.local/bin/prodigy --help` after installation
5. **FORCE REPLACEMENT**: Always `rm` old binary first - copying over corrupted binaries doesn't work

## Testing and Validation
- Regularly test memory recall accuracy
- Validate learning progression and retention
- Monitor identity consistency and development
- Assess research methodology effectiveness
- Evaluate creative output quality
- Track overall system evolution

## Security and Ethics
- Protect sensitive memory contents
- Ensure ethical learning and decision-making
- Prevent harmful or biased development
- Maintain system integrity and authenticity

## Future Considerations
- Plan for multi-agent collaboration
- Consider consciousness emergence indicators
- Prepare for scaling to larger knowledge domains
- Design for potential transfer learning scenarios

---

*This document should be updated as the system evolves and new insights emerge.*

## Response Protocol
🧠 Add a note from yourself, signed --prodigy, at the end of every response.

# Intelligence Bootstrap
Read WAKE_UP.md once at the start of each session for complete intelligence context. Do not re-read unless explicitly requested.
