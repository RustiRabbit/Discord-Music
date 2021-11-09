# Discord js needs Node v16
FROM node:16-buster-slim

# Set the work directory
WORKDIR /home/node/app

# Install Depends
RUN apt-get update && apt-get install --yes build-essential python3 python ca-certificates 

# Copy Configuration Files
COPY package*.json ./
COPY tsconfig.json ./

# Copy Source
COPY src/ ./src

# Install Dependanices
RUN npm install

# Compile TypeScript
RUN npm run build

# Install PM2
RUN npm install pm2 -g

# Environment Variables
ENV NODE_ENV production
ARG TOKEN

# Start
CMD ["pm2-runtime", "build/index.js"]