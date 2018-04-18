#!/bin/bash

# TODO: Someone figure out how the fuck to do this because goddamn
#  is it confusing...

# Make sure we're in the root directory
if [[ $(basename $(pwd)) == tools ]]; then
	cd ..
fi;

# How to generate SSL certificates from:
# https://jamielinux.com/docs/openssl-certificate-authority/create-the-intermediate-pair.html
# See also: https://medium.com/@nileshsingh/everything-about-creating-an-https-server-using-node-js-2fc5c48a8d4e

echo Generating the intermediate certificate

openssl genrsa -aes256 -out private/intermediate.key.pem 4096
chmod 400 private/intermediate.key.pem

openssl req -config tools/openssl.conf -new -sha256 \
	-key private/intermediate.key.pem \
	-out private/intermediate.csr.pem

openssl ca -config openssl.conf -extensions v3_intermediate_ca \
	-days 3640 -notext -md sha256
	-in intermediate.csr.pem \
	-out intermediate.cert.pem
chmod 444 intermediate.cert.pem

echo Generating the SSL certificate

openssl req -new -newkey rsa:2048 -nodes -out private/u413.com.csr -keyout private/private.key
