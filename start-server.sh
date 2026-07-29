#!/bin/bash
# Start the LLM Concepts preview server
cd "$(dirname "$0")/dist"
export PATH="$HOME/.nvm/versions/node/v24.13.0/bin:$PATH"
npx serve -p 5173 -C --cors --no-clipboard --listen 0.0.0.0
