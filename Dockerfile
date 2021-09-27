FROM ubuntu:20.04

RUN apt-get update

# Set the home directory to /root
ENV HOME /root

# cd into the home directory
WORKDIR /root

# Install Node
RUN apt-get update --fix-missing
RUN apt-get install -y node.js
RUN apt-get install -y npm

# Copy all app files into the image
COPY . .

# Download dependancies
RUN npm install

# Allow port $PORT to be accessed
# from outside the container
EXPOSE $PORT

# Run the app
CMD node backend/index.js $PORT
