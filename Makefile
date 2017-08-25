GIT_COMMIT ?= HEAD
#VERSION ?= $(shell git rev-parse --short ${GIT_COMMIT})
VERSION ?= latest
REGISTRY ?= quay.io/
IMAGE_PREFIX ?= mozmar
IMAGE_NAME ?= viewsourceconf
IMAGE ?= ${REGISTRY}${IMAGE_PREFIX}/${IMAGE_NAME}\:${VERSION}
DEV_IMAGE ?= ${REGISTRY}${IMAGE_PREFIX}/${IMAGE_NAME}\:${VERSION}
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

dev:
	docker build -t ${DEV_IMAGE} -f Dockerfile-dev . #TODO

sh:
	docker run -it ${DEV_IMAGE} bash

build-build-image:
	docker build -f Dockerfile-build -t ${BUILD_IMAGE} .

push-build-image:
	docker push ${BUILD_IMAGE}

push-latest-build-image: push-build-image
	docker tag ${BUILD_IMAGE} ${LATEST_BUILD_IMAGE}
	docker push ${LATEST_BUILD_IMAGE}

push-latest: push-latest-build-image

serve:
	docker run ${SERVE_ARGS} ${IMAGE} || \
	docker run ${SERVE_ARGS} ${LATEST_DEPLOY_IMAGE}

serve-https:
	docker run ${HTTPS_SERVE_ARGS} ${IMAGE} || \
	docker run ${HTTPS_SERVE_ARGS} ${LATEST_DEPLOY_IMAGE}

generate-cert:
	mkdir -p ssl; \
	openssl req -x509 -sha256 -nodes -newkey rsa\:2048 -days 365 -keyout ssl/localhost.key -out ssl/localhost.crt -subj '/CN=localhost'

curl:
	curl -v -H "X-Forwarded-Proto: https" ${HOST_IP}:${SERVE_PORT}${path}

deis-pull:
	deis pull ${IMAGE} -a ${DEIS_APP}

push-private-registry:
	docker tag ${IMAGE} ${PRIVATE_IMAGE}
	docker push ${PRIVATE_IMAGE}

deis-pull-private: push-private-registry
	deis pull ${DEIS_APP}:${VERSION} -a ${DEIS_APP}

s3-sync:
	cd build && aws s3 sync . s3://" + bucket +" --acl public-read --delete --profile viewsourceconf --exclude 'docs/*'

build-deploy: build-build-image build s3-sync
