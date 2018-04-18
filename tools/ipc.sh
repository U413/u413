#!/bin/bash

# Communicate with u413's IPC system

echo $1 > private/ipc.sock
cat private/ipc.sock
