FROM node:20-slim

RUN apt-get update && apt-get install -y ffmpeg curl

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g tsx

COPY . .

USER node

CMD ["npm", "run", "dev"]
