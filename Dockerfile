FROM sitespeedio/node:ubuntu-20.04-nodejs-16.16.0

WORKDIR /app

COPY package.json .
RUN npm i

COPY main.js .
COPY .env .

CMD ["node", "main.js"]
