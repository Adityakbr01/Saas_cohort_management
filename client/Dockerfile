FROM node:18-bookworm-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Create .vite-temp directory and set permissions for non-root user
RUN mkdir -p /app/node_modules/.vite-temp && \
    chown -R node:node /app && \
    chmod -R u+w /app/node_modules

# Copy source code
COPY . .

# Expose Vite's default port for development server
EXPOSE 5173

# Run as non-root user
USER node

# Start Vite development server with hot-reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]