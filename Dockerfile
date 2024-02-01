FROM sitespeedio/node:ubuntu-20.04-nodejs-16.16.0

WORKDIR /app
COPY main.js .
COPY package.json .
RUN npm i

COPY .env .

CMD ["node", "main.js"]
