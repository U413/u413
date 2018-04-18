#!/bin/bash

# This script is run by the u413 node instance, called with its PID for $1

disown

GIT=/usr/bin/git
NPM=npm

echo "KILLING"
# Kill the host node process
kill $1

echo "GIT"

# Fetch the new git data
$GIT fetch origin master
$GIT reset --hard FETCH_HEAD
$GIT clean -df

echo "NPM"

# Install any new npm packages
$NPM install

echo "REDEPLOY"

# Run the server (defer to run.sh)
/bin/bash ./run-disown.sh
