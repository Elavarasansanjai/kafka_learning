FROM node:20-alpine

WORKDIR /backend/matching-service

# Copy root package files
COPY package*.json ./

# Copy workspace package
COPY backend/matching-service/package*.json ./backend/matching-service/

# Install dependencies
RUN npm install

# Copy full source
COPY . .

WORKDIR /backend/matching-service

EXPOSE 3009

CMD ["npm", "run", "dev"]