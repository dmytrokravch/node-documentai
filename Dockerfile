# Use Node.js base image
FROM node:18

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk update && apk upgrade
RUN apk add git

# Copy the rest of your application code
COPY . .

RUN npm install

ENV HOST 0.0.0.0

# Start the application
CMD ["npm", "start"]
