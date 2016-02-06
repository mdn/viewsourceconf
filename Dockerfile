FROM alpine:3.3
EXPOSE 80
RUN apk add --update nginx && rm -rf /var/cache/apk/*
COPY nginx.conf /etc/nginx/nginx.conf
COPY . /usr/share/nginx/html
CMD ["nginx"]
