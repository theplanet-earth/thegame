# [Choice] Node.js version: 18, 20
ARG VARIANT="18"
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

# Install git, serve, etc. if you need them:
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    git \
    curl \
 && rm -rf /var/lib/apt/lists/*

# (Optional) Install global CLI for simple previews:
RUN npm install -g serve
