FROM sitespeedio/node:ubuntu-22-04-nodejs-20.10.0

WORKDIR /app
COPY main.js .
COPY package.json .
RUN npm i

COPY .env .

CMD ["node", "main.js"]
