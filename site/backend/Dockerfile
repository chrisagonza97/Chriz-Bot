FROM node:latest
#create a directory
WORKDIR /usr/src/back

COPY package*.json ./

RUN npm install

COPY . /usr/src/back

EXPOSE 4000

CMD ["node", "index.js"]
