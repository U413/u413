#!/bin/bash

# Kill the host node process
kill $1

# Run the server (defer to run.sh)
nohup ./tools/run & disown
echo $!
