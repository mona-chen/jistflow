# syntax = docker/dockerfile:1.2
## Install dev and compilation dependencies, build files
FROM alpine:3.18 as build
WORKDIR /iceshrimp

# Install compilation dependencies
RUN apk add --no-cache --no-progress git alpine-sdk vips-dev python3 nodejs-current npm vips

# Copy only the dependency-related files first, to cache efficiently
COPY package.json yarn.lock .pnp.cjs .pnp.loader.mjs .yarnrc.yml ./
COPY packages/backend/package.json packages/backend/package.json
COPY packages/client/package.json packages/client/package.json
COPY packages/sw/package.json packages/sw/package.json
COPY packages/iceshrimp-js/package.json packages/iceshrimp-js/package.json

# Prepare yarn cache
COPY .yarn/plugins .yarn/plugins
COPY .yarn/cache .yarn/cache
RUN --mount=type=cache,target=/iceshrimp/.yarncache cp -Tr .yarncache .yarn

# Configure corepack and yarn, then install dependencies for compilation
RUN corepack enable && corepack prepare yarn@stable --activate && yarn

# For releases please uncomment the commands below
# Save space by removing unneeded dependencies from cache
#RUN sed -i -E 's/(os|cpu|libc): \[.*\]/\1: \["current"\]/' .yarnrc.yml
#RUN yarn cache clean && yarn

# Save yarn cache
RUN --mount=type=cache,target=/iceshrimp/.yarncache rm -rf .yarncache/* && cp -Tr .yarn .yarncache

# Copy in the rest of the files to compile
COPY . ./

# Build the thing
RUN env NODE_ENV=production yarn build

## Runtime container
FROM alpine:3.18
WORKDIR /iceshrimp

# Install runtime dependencies
RUN apk add --no-cache --no-progress tini ffmpeg vips-dev zip unzip nodejs-current

COPY . ./

# Copy node modules
COPY --from=build /iceshrimp/.yarn /iceshrimp/.yarn

# Copy the finished compiled files
COPY --from=build /iceshrimp/built /iceshrimp/built
COPY --from=build /iceshrimp/packages/backend/built /iceshrimp/packages/backend/built
COPY --from=build /iceshrimp/packages/backend/assets/instance.css /iceshrimp/packages/backend/assets/instance.css

RUN corepack enable && corepack prepare yarn@stable --activate
ENV NODE_ENV=production
VOLUME "/iceshrimp/files"
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "yarn", "run", "migrateandstart" ]
