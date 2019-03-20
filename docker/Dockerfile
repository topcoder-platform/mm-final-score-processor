# Use the base image with Node.js
FROM node:latest

# Copy the current directory into the Docker image
COPY . /mm-final-score-processor
# Set working directory for future use
WORKDIR /mm-final-score-processor

# Install the dependencies from package.json
RUN npm install
CMD npm start