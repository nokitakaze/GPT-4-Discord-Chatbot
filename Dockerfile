FROM sitespeedio/node:ubuntu-24-04-nodejs-22.13.0

WORKDIR /app

COPY package.json .
RUN npm i

COPY main.js .
COPY .env .

CMD ["node", "main.js"]
