FROM node:20-alpine

WORKDIR /backend/notification-service

# Copy root package files
COPY package*.json ./

# Copy workspace package
COPY backend/notification-service/package*.json ./backend/notification-service/

# Install dependencies
RUN npm install

# Copy full source
COPY . .

WORKDIR /backend/notification-service

EXPOSE 3001

CMD ["npm", "run", "dev"]