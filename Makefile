GIT_COMMIT ?= HEAD
#VERSION ?= $(shell git rev-parse --short ${GIT_COMMIT})
VERSION ?= latest
REGISTRY ?= quay.io/
IMAGE_PREFIX ?= mozmar
IMAGE_NAME ?= viewsourceconf
IMAGE ?= ${REGISTRY}${IMAGE_PREFIX}/${IMAGE_NAME}\:${VERSION}
DEV_IMAGE ?= ${REGISTRY}${IMAGE_PREFIX}/${IMAGE_NAME}-dev\:${VERSION}
SERVE_PORT ?= 80
HTTPS_SERVE_PORT ?= 443
LIVE_RELOAD_PORT ?= 35729
MOUNT_DIR ?= $(shell pwd)
APP_DIR ?= /app
DOCKER_RUN_ARGS ?= -v ${MOUNT_DIR}\:${APP_DIR} -w ${APP_DIR}
DEV_ARGS ?= ${DOCKER_RUN_ARGS} -p "${SERVE_PORT}:${SERVE_PORT}" \
                               -p "${LIVE_RELOAD_PORT}:${LIVE_RELOAD_PORT}"
SERVE_ARGS ?= -v ${MOUNT_DIR}/build:/usr/share/nginx/html \
              -v ${MOUNT_DIR}/nginx.conf:/etc/nginx/nginx.conf \
              -p "${SERVE_PORT}:80"
HTTPS_SERVE_ARGS ?= -v ${MOUNT_DIR}/build:/usr/share/nginx/html \
                    -v ${MOUNT_DIR}/nginx-ssl.conf:/etc/nginx/nginx.conf \
                    -v ${MOUNT_DIR}/ssl:/etc/nginx/ssl \
                    -p "${SERVE_PORT}:80" -p "${HTTPS_SERVE_PORT}:443" \
                    -e FORCE_HTTPS=1

.PHONY: build

build:
	docker build -t ${IMAGE} .

build-dev:
	docker build -t ${DEV_IMAGE} -f Dockerfile-dev . #TODO

sh:
	docker run -it ${IMAGE} sh

serve:
	docker run -p "${SERVE_PORT}:80" ${IMAGE}

serve-https:
	docker run ${HTTPS_SERVE_ARGS} ${IMAGE} #TODO

generate-cert:
	mkdir -p ssl; \
	openssl req -x509 -sha256 -nodes -newkey rsa\:2048 -days 365 -keyout ssl/localhost.key -out ssl/localhost.crt -subj '/CN=localhost'

curl:
	curl -v -H "X-Forwarded-Proto: https" ${HOST_IP}:${SERVE_PORT}${path}
