GIT_COMMIT ?= HEAD
VERSION ?= $(shell git rev-parse --short ${GIT_COMMIT})
REGISTRY ?= quay.io/
IMAGE_PREFIX ?= mozmar
IMAGE_NAME ?= viewsourceconf
IMAGE ?= ${REGISTRY}${IMAGE_PREFIX}/${IMAGE_NAME}\:${VERSION}
LATEST_DEPLOY_IMAGE ?= ${REGISTRY}${IMAGE_PREFIX}/${IMAGE_NAME}\:latest
BUILD_IMAGE_NAME ?= ${IMAGE_NAME}_build
BUILD_IMAGE ?= ${REGISTRY}${IMAGE_PREFIX}/${BUILD_IMAGE_NAME}\:${VERSION}
LATEST_BUILD_IMAGE ?= ${REGISTRY}${IMAGE_PREFIX}/${BUILD_IMAGE_NAME}\:latest
SERVE_PORT ?= 8080
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
HOST_IP ?= $(shell docker-machine ip || echo 127.0.0.1)
DEIS_PROFILE ?= usw
DEIS_APP ?= viewsourceconf-stage
PRIVATE_IMAGE ?= ${PRIVATE_REGISTRY}/${DEIS_APP}\:${VERSION}

.PHONY: build

build:
	docker run ${DOCKER_RUN_ARGS} ${BUILD_IMAGE} node build || \
	docker run ${DOCKER_RUN_ARGS} ${LATEST_BUILD_IMAGE} node build

dev:
	docker run ${DEV_ARGS} ${BUILD_IMAGE} node build dev || \
	docker run ${DEV_ARGS} ${LATEST_BUILD_IMAGE} node build dev

sh:
	docker run -it ${DOCKER_RUN_ARGS} ${BUILD_IMAGE} sh || \
	docker run -it ${DOCKER_RUN_ARGS} ${LATEST_BUILD_IMAGE} sh

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
