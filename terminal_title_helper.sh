#!/bin/bash
# Prodigy Terminal Title Helper

# Set Prodigy-specific terminal title
prodigy_title() {
    local task="${1:-Development}"
    echo -e "\033]0;🧠 Prodigy: $task\007"
}

# Auto-detect current context and set appropriate title
auto_title() {
    if [[ -f "TASK.md" ]]; then
        local current_task=$(grep -m1 "^#" TASK.md | sed 's/^# //' 2>/dev/null)
        if [[ -n "$current_task" ]]; then
            prodigy_title "$current_task"
            return
        fi
    fi
    
    # Fallback to directory-based title
    local dir_name=$(basename "$PWD")
    prodigy_title "$dir_name"
}

# Export functions
export -f prodigy_title
export -f auto_title

# Aliases for convenience
alias pt='prodigy_title'
alias at='auto_title'

echo "🧠 Prodigy terminal title helper loaded!"
echo "Usage: pt 'Your Task Name' or at (auto-detect)"