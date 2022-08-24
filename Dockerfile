FROM node:18.7.0 as building
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM node:18.7.0-alpine
WORKDIR /usr/src/app
COPY --from=building /usr/src/app/package*.json ./
RUN npm install --only=prod
COPY --from=building /usr/src/app ./
RUN mkdir -p /usr/src/app/adx_logistics/data_files
RUN mkdir -p /usr/src/app/logs
CMD ["npm", "run", "start:prod"]