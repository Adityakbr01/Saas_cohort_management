FROM node:20-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm install --production
RUN npm install -g tsx

# Copy source code
COPY . .

# Run as non-root user for security
USER node

CMD ["tsx", "index.ts"]