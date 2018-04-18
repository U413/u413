#!/bin/bash

# This script is run by the u413 node instance, called with its PID for $1

GIT=/usr/bin/git
NPM=npm

# Kill the host node process
kill $1

# Fetch the new git data
$GIT fetch origin master
$GIT reset --hard FETCH_HEAD
$GIT clean -df

# Install any new npm packages
$NPM install

# Run the server (defer to run.sh)
nohup ./tools/run & disown
