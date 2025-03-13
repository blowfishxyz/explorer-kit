FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json files and workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/explorerkit-server/package.json ./packages/explorerkit-server/
COPY packages/explorerkit-idls/package.json ./packages/explorerkit-idls/
COPY packages/explorerkit-translator/package.json ./packages/explorerkit-translator/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config-explorerkit/package.json ./packages/eslint-config-explorerkit/

# Copy tsconfig files
COPY packages/tsconfig/base.json ./packages/tsconfig/
COPY packages/explorerkit-server/tsconfig.json ./packages/explorerkit-server/
COPY packages/explorerkit-idls/tsconfig.json ./packages/explorerkit-idls/
COPY packages/explorerkit-translator/tsconfig.json ./packages/explorerkit-translator/

# Install dependencies
RUN pnpm install

# Copy source files
COPY packages/explorerkit-server/src ./packages/explorerkit-server/src
COPY packages/explorerkit-idls/src ./packages/explorerkit-idls/src
COPY packages/explorerkit-translator/src ./packages/explorerkit-translator/src
COPY packages/eslint-config-explorerkit/index.js ./packages/eslint-config-explorerkit/

# Build the dependencies first
ENV NODE_ENV="production"

# Build explorer-kit-idls
WORKDIR /usr/src/app/packages/explorerkit-idls
RUN pnpm build

# Build explorer-kit-translator
WORKDIR /usr/src/app/packages/explorerkit-translator
RUN pnpm build

# Set working directory to server package and build it
WORKDIR /usr/src/app/packages/explorerkit-server
RUN pnpm build

# Expose port
EXPOSE 3000

# Command to run the application
CMD [ "node", "./dist/index.js" ]
