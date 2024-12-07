#!/bin/bash
set -e

cd $(dirname $0)

ACTION=$1
ECR_URI=$(cat .env | grep ECR_URI | cut -d '=' -f2)

case $ACTION in

login)
  aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin $ECR_URI
  ;;
push)
  docker build -t $ECR_URI:latest .
  docker push $ECR_URI:latest
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
