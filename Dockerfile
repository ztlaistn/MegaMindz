FROM node:12.18.4
ENV NODE_ENV=production

WORKDIR /app

RUN cd /app

# copy over package-lock and package files
COPY package*.json .

# Download dependancies
RUN npm install --production

# Copy all app files into the image
COPY . .

# Allow port $PORT to be accessed
# from outside the container
EXPOSE $PORT

# Run the app
CMD node -r esm backend/index.js $PORT
