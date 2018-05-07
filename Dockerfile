FROM node:alpine

ADD . /var/www
WORKDIR /var/www

EXPOSE 3000
EXPOSE 80

RUN apk add --update gcc g++ make python
RUN npm install
