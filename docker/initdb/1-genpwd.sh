#!/bin/bash

echo Generating database password
PRIV=/var/www/private
mkdir -p $PRIV
dd if=/dev/urandom of=$PRIV/u413.pwd bs=1 count=16
PWD=$(cat $PRIV/u413.pwd)
psql -c "alter user password '${PWD//'/\\}';"
