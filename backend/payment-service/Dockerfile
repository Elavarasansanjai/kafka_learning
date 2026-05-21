FROM node:20-alpine

WORKDIR /backend/payment-service

# Copy root package files
COPY package*.json ./

# Copy workspace package
COPY backend/payment-service/package*.json ./backend/payment-service/

# Install dependencies
RUN npm install

# Copy full source
COPY . .

WORKDIR /backend/payment-service

EXPOSE 3010

CMD ["npm", "run", "dev"]