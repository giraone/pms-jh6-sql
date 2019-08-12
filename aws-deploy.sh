#!/bin/bash

rm -rf target/.ebextensions
mkdir -p target/.ebextensions/nginx
cp -r src/main/ebs/ebextensions/nginx/* target/.ebextensions/nginx

cd target || exit

jar=$(ls -1t *.jar | head -1)
name="${jar%.jar}"
zipfile="${name}.ebs.zip"

cp "${jar}" application.jar

rm "${zipfile}"

zip "${zipfile}" \
.ebextensions/nginx/nginx.conf \
application.jar

cd ..
