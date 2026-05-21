FROM node:20-alpine

WORKDIR /backend/producer-service

# Copy root package files
COPY package*.json ./

# Copy workspace package
COPY backend/producer-service/package*.json ./backend/producer-service/

# Install dependencies
RUN npm install

# Copy full source
COPY . .

WORKDIR /backend/producer-service

EXPOSE 3002

CMD ["npm", "run", "dev"]