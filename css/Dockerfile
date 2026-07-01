# Use Node.js 20 Bookworm-slim for Python 3.11+ (required by latest yt-dlp)
FROM node:20-bookworm-slim

# Install system dependencies
# python3: needed for yt-dlp
# ffmpeg: needed for audio/video conversion
# curl: needed to download yt-dlp
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Download and install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Create app directory
WORKDIR /usr/src/app

# Create a directory for temporary downloads
RUN mkdir -p /tmp/downloads && chmod 777 /tmp/downloads

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000
ENV DOWNLOAD_DIR=/tmp/downloads

# Expose the port
EXPOSE 10000

# Start the application
CMD ["node", "server.js"]
