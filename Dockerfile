# build stage
FROM node:12-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
COPY src/docker-config.json src/config.json
RUN yarn run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
