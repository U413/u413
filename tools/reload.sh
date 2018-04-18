#!/bin/bash

# This script is run by the u413 node instance, called with its PID for $1

# Kill the host node process
kill $1

# Run the server (defer to run.sh)
/bin/bash ./tools/run-disown.sh
