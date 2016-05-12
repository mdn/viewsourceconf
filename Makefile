GIT_COMMIT ?= HEAD
VERSION ?= $(shell git rev-parse --short ${GIT_COMMIT})
REGISTRY ?= quay.io/
IMAGE_PREFIX ?= mozmar
IMAGE_NAME ?= viewsourceconf
IMAGE ?= ${REGISTRY}${IMAGE_PREFIX}/${IMAGE_NAME}\:${VERSION}
LATEST_IMAGE ?= ${REGISTRY}${IMAGE_PREFIX}/${IMAGE_NAME}\:latest
BUILD_IMAGE_NAME ?= ${IMAGE_NAME}_build
BUILD_IMAGE ?= ${REGISTRY}${IMAGE_PREFIX}/${BUILD_IMAGE_NAME}\:${VERSION}
LATEST_BUILD_IMAGE ?= ${REGISTRY}${IMAGE_PREFIX}/${BUILD_IMAGE_NAME}\:latest
WATCH_PORT ?= 8080
SERVE_PORT ?= 8000
MOUNT_DIR ?= $(shell pwd)
APP_DIR ?= /app
DOCKER_RUN_ARGS ?= -v ${MOUNT_DIR}\:${APP_DIR} -w ${APP_DIR}
HOST_IP ?= $(shell docker-machine ip || echo 127.0.0.1)
DEIS_PROFILE ?= usw
DEIS_APP ?= viewsourceconf-stage
PRIVATE_IMAGE ?= ${PRIVATE_REGISTRY}/${DEIS_APP}\:${VERSION}

.PHONY: build

build:
	docker run ${DOCKER_RUN_ARGS} ${BUILD_IMAGE} node build

watch:
	docker run ${DOCKER_RUN_ARGS} -p "${WATCH_PORT}:${WATCH_PORT}" ${BUILD_IMAGE} node watch 

build-build-image:
	docker build -f Dockerfile-build -t ${BUILD_IMAGE} .

build-deploy-image:
	docker build -t ${IMAGE} .

tag-latest-build-image:
	docker tag -f ${IMAGE} ${LATEST_BUILD_IMAGE}

tag-latest-deploy-image:
	docker tag -f ${IMAGE} ${LATEST_DEPLOY_IMAGE}

push-build-image: tag-latest-build-image
	docker push ${BUILD_IMAGE}

push-deploy-image: tag-latest-deploy-image
	docker push ${IMAGE}
	docker push ${LATEST_DEPLOY_IMAGE}

serve:
	docker run -p "${SERVE_PORT}:80" ${IMAGE}

curl:
	curl -H "X-Forwarded-Proto: https" ${HOST_IP}:${SERVE_PORT}

deis-pull:
	deis pull ${IMAGE} -a ${DEIS_APP}

push-private-registry:
	docker tag -f ${IMAGE} ${PRIVATE_IMAGE}
	docker push ${PRIVATE_IMAGE}

deis-pull-private: push-private-registry
	deis pull ${DEIS_APP}:${VERSION} -a ${DEIS_APP}

build-deploy: build-build-image build build-deploy-image deis-pull-private
