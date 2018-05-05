#!/bin/bash

# Kill the host node process
kill $1

# Run the server (defer to run)
nohup ./tools/run & disown
echo $!
