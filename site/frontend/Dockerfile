FROM node:latest
#create a directory
WORKDIR /front

COPY package*.json ./

RUN npm install

COPY . /front

RUN npm run build


EXPOSE 3000

CMD ["npm", "run", "start"]
