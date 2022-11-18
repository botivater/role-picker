# Build a Docker image of the NestJS application
# based on a NodeJS 16 image. The multi-stage mechanism
# allows to build the application in a "builder" stage
# and then create a lightweight production image
# containing the required dependencies and the JS build files.
FROM node:18-alpine as builder

# Set the node environment to build.
ENV NODE_ENV build

# Set the user to node and set the workdir to /home/node.
USER node
WORKDIR /home/node

# Copy the package file and clean install.
COPY package.json yarn.lock ./
RUN rm -rf node_modules && yarn install --frozen-lockfile

# Copy the source code.
COPY --chown=node:node . .

# Build the application and remove the dev dependencies.
RUN yarn build && yarn install --frozen-lockfile --production

# ---

FROM node:18-alpine

# Set the node environment to production.
ENV NODE_ENV production

# Set the user to node and set the workdir to /home/node.
USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package.json ./
COPY --from=builder --chown=node:node /home/node/yarn.lock ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/out/ ./out/
COPY --from=builder --chown=node:node /home/node/entrypoint.sh ./

# Run the startup script
CMD entrypoint.sh