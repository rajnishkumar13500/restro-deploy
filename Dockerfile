# Start from a Node.js base image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the Prisma directory, including schema.prisma and migrations
COPY prisma /app/prisma

# Copy the rest of the application code
COPY . .

# Install Prisma CLI globally
RUN npm install -g prisma

# Generate Prisma Client (required for interacting with the database)
RUN npx prisma generate

# Make the entrypoint script executable
RUN chmod +x ./entrypoint.sh

# Expose the port the app runs on
EXPOSE 4000

# Set the entrypoint to the script
ENTRYPOINT ["./entrypoint.sh"]