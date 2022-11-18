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
#TODO: I Hate this and a better solution is needed
RUN mkdir -p /usr/src/app/adx_logistics/data_files/openlmis
RUN mkdir -p /usr/src/app/adx_logistics/data_files/dhamis
RUN mkdir -p /usr/src/app/logs
CMD ["npm", "run", "start:prod"]