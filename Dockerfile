FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./server/

# Install dependencies
WORKDIR /app/server
RUN npm install --production

# Go back to app root
WORKDIR /app

# Copy all frontend files to /app
COPY index.html ./
COPY styles.css ./
COPY profile.html ./
COPY shop.html ./
COPY tasks.html ./
COPY leaderboard.html ./
COPY css/ ./css/
COPY js/ ./js/

# Copy server files
COPY server/ ./server/

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Start server from server directory
WORKDIR /app/server
CMD ["node", "server.js"]
