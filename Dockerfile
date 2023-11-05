# syntax = docker/dockerfile:1.2
## Install dev and compilation dependencies, build files
FROM alpine:3.18 as build
WORKDIR /iceshrimp

# Install compilation dependencies
RUN apk add --no-cache --no-progress git alpine-sdk vips-dev python3 nodejs-current npm vips moreutils jq

# Copy only the dependency-related files first, to cache efficiently
COPY package.json yarn.lock .pnp.cjs .pnp.loader.mjs ./
COPY packages/backend/package.json packages/backend/package.json
COPY packages/client/package.json packages/client/package.json
COPY packages/sw/package.json packages/sw/package.json
COPY packages/iceshrimp-js/package.json packages/iceshrimp-js/package.json

# Prepare yarn cache
COPY .yarn/cache .yarn/cache
RUN --mount=type=cache,target=/iceshrimp/.yarncache cp -Tr .yarncache .yarn

# Configure corepack and install dev mode dependencies for compilation
RUN corepack enable && corepack prepare --activate && yarn

# Save yarn cache
RUN --mount=type=cache,target=/iceshrimp/.yarncache rm -rf .yarncache/* && cp -Tr .yarn .yarncache

# Copy in the rest of the files to compile
COPY . ./

# Build the thing
RUN env NODE_ENV=production yarn build

# Prepare focused yarn cache
RUN --mount=type=cache,target=/iceshrimp/.yarncache_focused cp -Tr .yarncache_focused .yarn

# Remove dev deps
RUN find packages package.json -name package.json | xargs -i sh -c "jq 'del(.devDependencies)' {} | sponge {}"
RUN yarn

# Save focused yarn cache
RUN --mount=type=cache,target=/iceshrimp/.yarncache_focused rm -rf .yarncache/* && cp -Tr .yarn .yarncache_focused

## Runtime container
FROM alpine:3.18
WORKDIR /iceshrimp

# Install runtime dependencies
RUN apk add --no-cache --no-progress tini ffmpeg vips-dev zip unzip nodejs-current

# Copy built files
COPY --from=build /iceshrimp /iceshrimp

# Configure corepack
RUN corepack enable && corepack prepare --activate

ENV NODE_ENV=production
VOLUME "/iceshrimp/files"
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "yarn", "run", "migrateandstart" ]
