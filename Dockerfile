FROM node:8

RUN mkdir -p /usr/src/Arkheia

#RUN npm install -g yo gulp-cli gulp


WORKDIR /usr/src/Arkheia

COPY ./dist/ /usr/src/Arkheia
RUN chown -R node:node /usr/src/Arkheia

USER node
RUN npm --production install 
#RUN npm install typescript@2.0.3

ENV NODE_ENV=production

# change to whatever port is to be used
EXPOSE 8080
RUN echo "DSADA"
RUN echo $NODE_ENV
CMD ["node", "./server" ]