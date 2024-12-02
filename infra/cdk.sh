#!/bin/bash
set -e

cd $(dirname $0)

ACTION=$1
ENV=$2
SYSNAME=$3

case $ACTION in
check)
  echo "format check"

  npm run format
  RPC=$?
  if [ "$RPC" != 0 ]; then
    echo "prettier結果を再確認してください"
    exit 1
  else
    echo "Format OK"
  fi

  npm run lint
  RLC=$?
  if [ "$RLC" != 0 ]; then
    echo "eslint結果を再確認してください"
    exit 1
  else
    echo "Lint OK"
  fi
  ;;
diff)
  echo "Start cdk diff"
  npm run cdk:diff
  echo "End cdk diff"
  ;;
deploy)
  echo "Start cdk deploy"
  npm run cdk:deploy
  echo "End cdk deploy"
  ;;
diff:n)
  echo "Start cdk diff"
  npm run cdk:diff -- -c isFirst=n
  echo "End cdk diff"
  ;;
deploy:n)
  echo "Start cdk deploy"
  npm run cdk:deploy -- -c isFirst=n
  echo "End cdk deploy"
  ;;
destroy)
  echo "Start cdk destroy"
  npm run cdk:destroy
  echo "End cdk destroy"
  ;;
esac
