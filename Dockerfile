FROM quay.io/deis/base:0.3.0
EXPOSE 80
CMD ["nginx"]

RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx nginx-extras

COPY nginx.conf /etc/nginx/nginx.conf
COPY build/ /usr/share/nginx/html
