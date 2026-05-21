FROM node:20-alpine

WORKDIR /frontend

COPY package*.json ./
COPY frontend/package*.json ./frontend/

RUN npm install

COPY . .

WORKDIR /frontend

EXPOSE 3000

CMD ["npm", "start"]