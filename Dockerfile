FROM node:20-alpine

WORKDIR /app

# Copy everything first
COPY . .

# Install all workspace dependencies
RUN npm install

EXPOSE 3000
EXPOSE 3001
EXPOSE 3002
EXPOSE 3008
EXPOSE 3009
EXPOSE 3010

CMD ["npm", "start"]