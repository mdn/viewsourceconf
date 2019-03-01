#!/bin/bash

set -e
git checkout master

TODAY=$(date +%Y-%m-%d)
echo "Today is ${TODAY}"
# wanted to use grep -c, but it sets a return code of 1 if its count == 0
# this works fine
TAG_COUNT=$(git tag | grep "${TODAY}" | wc -l | awk '{ print $1 }')
echo "Tag count = ${TAG_COUNT}"
# see if there are other tags from today's date
if [ $TAG_COUNT -eq 0 ]; then
    echo "No tags for today, using ${TODAY} as initial tag"
    VSC_TAG="${TODAY}"
else
    echo "Tags exist for today, appending suffix"
    VSC_TAG="${TODAY}.${TAG_COUNT}"
fi

echo "New tag name = ${VSC_TAG}"
TAG_CHECK=$(git tag | grep "${VSC_TAG}" | wc -l | awk '{ print $1 }')
if [ $TAG_CHECK -ne 0 ]; then
    # tags were most likely manually created
    echo "Tag already exists, bailing out."
    exit 1
fi

git tag "${VSC_TAG}"
git push origin master:prod

echo "Check your prod deploy status here:"
echo "https://ci.vpn1.moz.works/blue/organizations/jenkins/viewsourceconf_deploy_k8s/activity"
