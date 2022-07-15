FROM node:16-buster

WORKDIR /usr/src/app

# install java
RUN apt-get update && \
    apt-get -y install default-jre && \
    apt-get clean

# install npm dependencies (production and dev)
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm i

# install dynamodb
COPY serverless.yml ./serverless.yml
RUN npm install serverless-dynamodb-local@0.2.30
RUN npx sls dynamodb install

CMD npm run debug
