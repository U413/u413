#!/bin/bash

# Apply all available updates to the server, then restart.

GIT=/usr/bin/git
NPM=npm

# Fetch the new git data
$GIT fetch origin master
$GIT reset --hard FETCH_HEAD
$GIT clean -df

# Install any new npm packages
$NPM install

source tools/restart.sh
