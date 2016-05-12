#!/bin/bash -ex

rm -f .new_tag
rm -f .new_commit_master

LATEST_COMMIT=$(git rev-parse HEAD)
if [[ ! -e .latest_commit || "$(< .latest_commit)" != "${LATEST_COMMIT}" ]]; then
    echo ${LATEST_COMMIT} > .new_commit_master
fi
echo ${LATEST_COMMIT} > .latest_commit

LATEST_TAG=$(git describe --abbrev=0 --tags)
if [[ ! -e .latest_tag || "$(< .latest_tag)" != "${LATEST_TAG}" ]]; then
    echo ${LATEST_TAG} > .new_tag
fi
echo ${LATEST_TAG} > .latest_tag
