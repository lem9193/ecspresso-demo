local must_env = std.native('must_env');

{
  region: 'ap-northeast-1',
  cluster: must_env('SYS_NAME') + '-' + must_env('CLUSTER'),
  service: must_env('SYS_NAME') + '-' + must_env('SERVICE'),
  service_definition: 'ecs-service-def.jsonnet',
  task_definition: 'ecs-task-def.jsonnet',
  timeout: '10m0s',
  codedeploy: {
    application_name: must_env('SYS_NAME') + '-' + must_env('APPLICATION_NAME'),
    deployment_group_name: must_env('SYS_NAME') + '-' + must_env('DEPLOYMENT_GROUP_NAME'),
  },
}
