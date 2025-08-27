#!/bin/bash
echo "Testing prodigy binary..."
~/.local/bin/prodigy
exit_code=$?
echo "Exit code: $exit_code"