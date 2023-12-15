# build stage
FROM node:16-alpine as build-stage
ENV JQ_VERSION=1.6
RUN wget --no-check-certificate https://github.com/stedolan/jq/releases/download/jq-${JQ_VERSION}/jq-linux64 -O /tmp/jq-linux64
RUN cp /tmp/jq-linux64 /usr/bin/jq
RUN chmod +x /usr/bin/jq
RUN apk add --no-cache git
WORKDIR /app
COPY . .
RUN yarn install && yarn run build

# production stage
FROM nginx:stable-alpine as production-stage
ENV JSFOLDER=/usr/share/nginx/html/js
COPY ./start-nginx.sh /usr/bin/start-nginx.sh
RUN chmod +x /usr/bin/start-nginx.sh
WORKDIR /usr/share/nginx/html
COPY --from=build-stage /app/dist .
ENTRYPOINT [ "start-nginx.sh" ]
