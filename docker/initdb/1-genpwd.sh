#!/bin/bash

echo Generating database password
PRIV=/var/www/private
mkdir -p "$PRIV"
dd if=/dev/urandom bs=18 count=1 | base64 > "$PRIV/u413.pwd"
psql -c "alter user $USER password '$(<"$PRIV/u413.pwd")';"
