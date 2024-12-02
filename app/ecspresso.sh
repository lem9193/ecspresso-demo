#!/bin/bash
set -e

cd $(dirname $0)

ACTION=$1
case $ACTION in
login)
  REPO=$(cat .env | grep REPO | cut -d '=' -f2)
  aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin $REPO
  ;;
push)
  REPO=$(cat .env | grep REPO | cut -d '=' -f2)
  docker build -t $REPO:latest .
  docker push $REPO:latest
  ;;
verify)
  ecspresso verify --config ecspresso/ecspresso.jsonnet --envfile=.env
  ;;
diff)
  ecspresso diff --config ecspresso/ecspresso.jsonnet --envfile=.env
  ;;
deploy)
  ecspresso deploy --config ecspresso/ecspresso.jsonnet --envfile=.env
  ;;
refresh)
  ecspresso refresh --config ecspresso/ecspresso.jsonnet --envfile=.env
  ;;
scale0)
  ecspresso scale --tasks 0 --config ecspresso/ecspresso.jsonnet --envfile=.env
  ;;
delete)
  ecspresso delete --config ecspresso/ecspresso.jsonnet --envfile=.env
  ;;
esac
