# Use official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy the rest of the application code to the working directory
COPY . .

# Install workspace dependencies
RUN pnpm install

# Move into the server package
WORKDIR /usr/src/app/packages/explorerkit-server

# Install dependencies
RUN pnpm install

# Compile TypeScript to JavaScript
RUN pnpm build

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the application
CMD [ "node", "./dist/index.js" ]
