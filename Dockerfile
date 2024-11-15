FROM node

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install

RUN npm install --global nodemon

COPY . /usr/src/app

EXPOSE 8080

CMD [ "npm", "run", "build" ]