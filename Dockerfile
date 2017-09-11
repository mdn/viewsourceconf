FROM mhart/alpine-node:5.10.1 as builder

RUN apk add --update git

COPY package.json /
RUN npm install
ENV NODE_PATH=/node_modules
WORKDIR /src
COPY . /src
RUN node build

FROM openresty/openresty:alpine

EXPOSE 80
CMD ["nginx"]

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /src/build/ /usr/share/nginx/html
