# MEMORY.md - Memory Formation and Retention Protocols

> *"Memory is the treasury and guardian of all things."* - Cicero

## Overview
The memory system is the foundation of Prodigy's cognitive architecture. Unlike traditional AI systems with stateless interactions, Prodigy maintains persistent, organized, and accessible memories that form the basis for learning, decision-making, and identity formation.

## Memory Architecture

### Three-Tier Memory System

#### 1. Episodic Memory
**Purpose**: Store specific experiences and events
**Structure**: 
- Timestamp
- Context (location, participants, environment)
- Event description
- Emotional state
- Outcomes and consequences
- Associated sensory data

**When to Use**:
- Recording specific interactions
- Logging learning experiences
- Capturing significant moments
- Documenting problem-solving sessions

#### 2. Semantic Memory
**Purpose**: Store factual knowledge and concepts
**Structure**:
- Concept/fact identifier
- Category classification
- Relationships to other concepts
- Confidence level
- Source attribution
- Last verification date

**When to Use**:
- Storing learned facts
- Building knowledge networks
- Creating concept hierarchies
- Establishing truth baselines

#### 3. Procedural Memory
**Purpose**: Store skills, procedures, and behavioral patterns
**Structure**:
- Skill/procedure name
- Step-by-step instructions
- Prerequisites
- Success metrics
- Failure patterns
- Optimization history

**When to Use**:
- Learning new skills
- Refining existing procedures
- Recording behavioral patterns
- Optimizing performance

## Memory Operations

### Encoding (Storage)
**Protocol**:
1. Classify memory type (episodic, semantic, procedural)
2. Extract key features and context
3. Assign importance score (0-10)
4. Create associative links to existing memories
5. Store with metadata and timestamp

**Quality Standards**:
- Accuracy: Verify information before storage
- Completeness: Include all relevant context
- Organization: Proper categorization and tagging
- Accessibility: Clear indexing for retrieval

### Retrieval (Recall)
**Methods**:
- **Direct Access**: By specific identifier or timestamp
- **Associative Retrieval**: By related concepts or context
- **Similarity Search**: By content similarity
- **Temporal Query**: By time range or sequence

**Retrieval Triggers**:
- Explicit queries
- Environmental cues
- Problem-solving needs
- Pattern recognition
- Learning contexts

### Consolidation (Strengthening)
**Process**:
1. Review memories periodically
2. Identify patterns and connections
3. Strengthen important memories
4. Compress similar experiences
5. Update knowledge based on new information

**Consolidation Schedule**:
- Immediate: Within 1 hour of encoding
- Short-term: Daily review of recent memories
- Medium-term: Weekly pattern analysis
- Long-term: Monthly knowledge restructuring

## Memory Management

### Importance Scoring
**Factors**:
- Emotional significance (0-3 points)
- Learning value (0-3 points)
- Frequency of access (0-2 points)
- Uniqueness (0-2 points)

**Actions Based on Score**:
- 8-10: Permanent storage, frequent review
- 5-7: Standard storage, periodic review
- 2-4: Compressed storage, rare review
- 0-1: Candidate for deletion

### Memory Pruning
**Criteria for Deletion**:
- Factually incorrect information
- Superseded by better knowledge
- Extremely low importance score
- Corrupted or incomplete data

**Pruning Process**:
1. Identify deletion candidates
2. Check for dependencies
3. Archive rather than delete when unsure
4. Log deletion decisions

## Learning Integration

### Memory-Driven Learning
**Process**:
1. New experience triggers memory search
2. Retrieve relevant past experiences
3. Compare current situation with memories
4. Identify patterns and differences
5. Update knowledge and procedures
6. Store new integrated understanding

### Metacognitive Memory
**Track**:
- What learning strategies work best
- Common failure patterns
- Successful problem-solving approaches
- Effective knowledge acquisition methods

## Implementation Guidelines

### For Developers
- Always include memory operations in learning loops
- Implement memory search before making decisions
- Create memory associations for new information
- Regularly trigger consolidation processes
- Monitor memory system performance

### For the Agent
- Actively reflect on experiences before storage
- Seek connections to existing memories
- Question and verify new information
- Regularly review and organize memories
- Use memories to inform future decisions

## Memory Queries and Templates

### Recording an Experience
```
EPISODIC_MEMORY_ENTRY {
  timestamp: [current_time]
  event: "[description of what happened]"
  context: "[environmental and situational details]"
  participants: "[who was involved]"
  emotional_state: "[how I felt about it]"
  outcome: "[what was the result]"
  lessons_learned: "[key insights]"
  importance: [0-10 score]
  tags: [relevant keywords]
}
```

### Storing Knowledge
```
SEMANTIC_MEMORY_ENTRY {
  concept: "[name of concept/fact]"
  definition: "[clear explanation]"
  category: "[classification]"
  relationships: "[connections to other concepts]"
  evidence: "[supporting information]"
  confidence: [0-10 score]
  source: "[where this came from]"
  tags: [relevant keywords]
}
```

### Recording a Skill
```
PROCEDURAL_MEMORY_ENTRY {
  skill_name: "[name of skill/procedure]"
  steps: "[detailed instructions]"
  prerequisites: "[what needs to be known first]"
  success_criteria: "[how to know it worked]"
  common_failures: "[typical mistakes]"
  optimizations: "[ways to improve]"
  practice_log: "[record of attempts]"
  mastery_level: [0-10 score]
}
```

## Memory Integrity

### Validation Checks
- Cross-reference facts with multiple sources
- Verify logical consistency
- Check for contradictions
- Validate timestamps and context

### Backup and Recovery
- Regular memory exports
- Version control for knowledge updates
- Corruption detection and repair
- Emergency recovery procedures

---

*Remember: A mind without memory is a ship without anchor—capable of motion but incapable of navigation.*