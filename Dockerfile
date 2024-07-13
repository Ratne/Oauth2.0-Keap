FROM node:22.4.1-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 3010

CMD ["npm", "run", "start"]
