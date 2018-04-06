#!/bin/bash

# Usage: sudo -u <postgres user> query.sh <query name>

# Make sure we're in the root directory
if [[ $(basename $(pwd)) == tools ]]; then
	cd ..
fi;

# Check for dangerous SQL scripts
if [[ $1 = "nuke" ]]; then
	read -p "Are you sure? (y/n) "
	echo
	if ! [[ $REPLY =~ ^[Yy]$ ]]; then
		exit
	fi
fi

cat db/$1.sql | psql ${DB:-u413}
