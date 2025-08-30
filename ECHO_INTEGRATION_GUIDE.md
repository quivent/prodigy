# 🔄 Echo Agent Integration Guide

## Overview

Echo agents provide ethical projections of Prodigy's problem-solving capabilities for workspace-scoped project work. This guide covers the complete Claude Code integration functionality.

## Core Integration Features

### 1. **Automatic Workspace Creation**
Echo agents automatically create and navigate to workspace directories:
```bash
prodigy echo my-project --launch
# Creates: ~/Documents/Projects/my-project/
# Navigates to workspace before launching Claude Code
```

### 2. **Environment Context Loading**
When launching Claude Code, Echo sets specialized environment variables:
```bash
ECHO_AGENT_ID=echo_1234567890_abcdef12      # Unique agent identifier
ECHO_WORKSPACE=my-project                    # Workspace name
ECHO_SPECIALIZATION=systems-architecture     # Specialization type
ECHO_PROJECT=My Project Name                 # Project context (if provided)
ECHO_CREATED=2025-01-15T10:30:00Z           # Creation timestamp
```

### 3. **Specialization-Based Assistance**
Echo agents provide specialized capabilities:

#### **Systems Architecture** (`--specialization=systems-architecture`)
- System design and component architecture
- Performance optimization and scalability
- Integration patterns and protocols
- Infrastructure and deployment planning

#### **Web Development** (`--specialization=web-development`)
- Frontend and backend development
- API design and implementation
- Database design and optimization
- UI/UX implementation assistance

#### **Full Stack** (`--specialization=full-stack`)
- Complete application development
- End-to-end system integration
- DevOps and deployment automation
- Cross-platform compatibility

#### **Research** (`--specialization=research`)
- Technical research and analysis
- Literature review and synthesis
- Data analysis and interpretation
- Experimental design and validation

#### **Documentation** (`--specialization=documentation`)
- Technical writing and documentation
- API documentation generation
- User guides and tutorials
- Code documentation and comments

#### **Testing** (`--specialization=testing`)
- Test strategy and planning
- Test automation and frameworks
- Quality assurance processes
- Performance and load testing

#### **DevOps** (`--specialization=devops`)
- CI/CD pipeline design
- Infrastructure as code
- Monitoring and alerting
- Security and compliance

## Usage Examples

### **Basic Agent Creation**
```bash
# Create Echo agent for workspace
prodigy echo neural-network-project --specialization=systems-architecture

# Create with project context
prodigy echo web-app --specialization=web-development --project="E-commerce Platform"
```

### **Direct Claude Code Launch**
```bash
# Create agent and launch Claude Code immediately
prodigy echo ai-research --specialization=research --launch

# Launch with full context
prodigy echo mobile-app --specialization=full-stack --project="iOS App Development" --launch
```

### **Agent Management**
```bash
# List all active Echo agents
prodigy echo --list

# Remove agent from workspace
prodigy echo old-project --remove

# Show complete help documentation
prodigy echo help
```

## Claude Code Integration Details

### **Session Initialization Process**
1. **Agent Validation**: Verify Echo agent exists and has valid configuration
2. **Directory Setup**: Create workspace directory if it doesn't exist
3. **Context Loading**: Load agent configuration and workspace context
4. **Environment Setup**: Set Echo-specific environment variables
5. **Claude Code Launch**: Start Claude Code session with full context

### **Workspace Structure**
```
~/Documents/Projects/[workspace]/
├── [project files]                          # Your project code
├── .echo/                                   # Echo-specific files (auto-created)
│   ├── agent.json                          # Agent configuration reference
│   └── context.md                          # Workspace context documentation
└── [other project files]
```

### **Error Handling**
The integration includes comprehensive error handling:
- **Missing claude-code**: Clear instructions to install Claude Code CLI
- **Invalid workspace**: Automatic directory creation with user notification
- **Permission errors**: Detailed error messages with resolution steps
- **Agent conflicts**: Detection and resolution of multiple agents per workspace

## Advanced Features

### **Environment Variable Access**
In your Claude Code session, access Echo context programmatically:
```bash
echo "Current Echo Agent: $ECHO_AGENT_ID"
echo "Specialization: $ECHO_SPECIALIZATION"
echo "Workspace: $ECHO_WORKSPACE"
```

### **Context File Integration**
Echo automatically creates context documentation:
```markdown
# Echo Agent Context
Workspace: my-project
Specialization: systems-architecture
Project: My Project Name
Created: 2025-01-15T10:30:00Z
Echo ID: echo_1234567890_abcdef12

## Capabilities
- Problem-solving methodology replication
- Technical analysis and architecture guidance
- Code implementation assistance
- Project coordination support
- Documentation and specification creation
```

### **Multi-Workspace Management**
Echo supports multiple simultaneous workspaces:
```bash
# Work on different projects simultaneously
prodigy echo frontend --specialization=web-development --launch
# (In separate terminal)
prodigy echo backend --specialization=systems-architecture --launch
# (In separate terminal)  
prodigy echo research --specialization=research --launch
```

## Integration with Prodigy Ecosystem

### **Memory System Integration**
- Echo agents store session context in Prodigy's memory system
- Workspace-scoped memory prevents cross-contamination
- Agent specialization influences memory categorization

### **Learning Integration**
- Echo sessions contribute to Prodigy's continuous learning
- Specialized knowledge accumulates in domain-specific memory
- Cross-agent learning improves overall capability

### **Research Framework**
- Research-specialized Echo agents integrate with Prodigy's research protocols
- Systematic investigation patterns preserved across sessions
- Research findings contributed to central knowledge base

## Security and Ethics

### **Consent Framework**
- Each Echo agent includes cryptographic consent verification
- Ethical boundaries enforced through technical safeguards
- No identity replication - functional projection only

### **Workspace Isolation**
- Agents operate only within designated workspace boundaries
- No cross-workspace data access or persistence
- Clear separation between different project contexts

### **Operational Limits**
- No autonomous self-modification capabilities
- No cross-workspace communication or data sharing
- Clear functional purpose without consciousness claims

## Troubleshooting

### **Common Issues**

**"claude-code not found in PATH"**
```bash
# Install Claude Code CLI
curl -fsSL https://claude.ai/install.sh | sh
# Or check installation: which claude-code
```

**"Permission denied creating workspace"**
```bash
# Check directory permissions
ls -la ~/Documents/Projects/
# Ensure user has write access to Projects directory
```

**"Multiple agents found for workspace"**
```bash
# List agents to identify conflicts
prodigy echo --list
# Remove conflicting agents
prodigy echo workspace-name --remove
```

### **Debug Information**
Enable debug output for troubleshooting:
```bash
export ECHO_DEBUG=1
prodigy echo my-project --launch
```

## Best Practices

### **Workspace Naming**
- Use descriptive, kebab-case names: `neural-network-research`
- Avoid spaces and special characters
- Keep names under 50 characters for compatibility

### **Specialization Selection**
- Choose the most specific specialization for your needs
- Use `general` only when work spans multiple domains
- Consider creating multiple specialized agents for complex projects

### **Project Context**
- Always provide meaningful project names with `--project`
- Include version or iteration information when relevant
- Use consistent naming across related projects

## Future Enhancements

Planned improvements to Echo-Claude Code integration:
- **Session persistence**: Resume previous Echo sessions
- **Multi-agent coordination**: Coordinate multiple Echo agents in single workspace
- **Advanced context sharing**: Share context between related workspaces
- **Performance analytics**: Track and optimize Echo-assisted development velocity

---

For complete technical specifications, see: `~/.prodigy/ECHO_AGENT_SPECIFICATION.md`