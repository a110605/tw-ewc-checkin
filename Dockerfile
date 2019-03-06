FROM node:8-stretch

# Change working directory
WORKDIR "/app"

# Update packages and install dependency packages for services
RUN apt-get update \
 && apt-get dist-upgrade -y \
 && apt-get clean \
 && echo 'Finished installing dependencies'

# Install npm production packages
COPY package.json /app/
RUN cd /app; npm install --production

COPY . /app

#ENV NODE_ENV development
#ENV DEBUG=express:*

EXPOSE 3000
EXPOSE 443

CMD ["npm", "start"]
