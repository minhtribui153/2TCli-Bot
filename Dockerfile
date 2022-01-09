FROM ubuntu:latest
RUN apt-get update
RUN apt update
RUN apt-get -y install curl
RUN apt -y install ffmpeg

# Now copy the content to get the Discord Bot Project in the Docker Container
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

# Install required NPM packages
RUN npm install -g typescript ts-node ts-node-dev nodemon

# Copy package.json
RUN mkdir /usr/src/bot
COPY package.json /usr/src/bot

# Copy all Discord Bot folders
COPY . /usr/src/bot
WORKDIR /usr/src/bot

# Install dependencies
RUN npm install

# Startup the Discord Bot
CMD [ "npm", "start" ]
