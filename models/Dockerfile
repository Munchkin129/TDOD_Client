FROM node:14

RUN npm install -g http-server

WORKDIR /model

COPY /tfjsexportmy_ssd_mobnet_tuned_v4 ./

EXPOSE 8080

CMD [ "http-server", "-c1", "--cors", "." ]