FROM node:20-alpine

WORKDIR /backend/analytics-service

# Copy root package files
COPY package*.json ./

# Copy workspace package
COPY backend/analytics-service/package*.json ./backend/analytics-service/

# Install dependencies
RUN npm install

# Copy full source
COPY . .

WORKDIR /backend/analytics-service

EXPOSE 3008

CMD ["npm", "run", "dev"]