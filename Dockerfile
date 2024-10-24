# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
