# Use Image
FROM jrottenberg/ffmpeg:latest
FROM node:latest

# Create Discord Bot directory
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

# Install required NPM packages
RUN npm install -g typescript ts-node nodemon

# Copy package.json and Install the Discord Bot
COPY package.json /usr/src/bot
RUN npm install

# Copy all Discord Bot folders
COPY . /usr/src/bot

# Startup the Discord Bot
CMD [ "npm", "start" ]