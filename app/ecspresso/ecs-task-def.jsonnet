local must_env = std.native('must_env');
local ssm = std.native('ssm');

{
  family: must_env('SYS_NAME'),
  containerDefinitions: [
    {
      name: must_env('SYS_NAME') + '-container',
      image: must_env('REPO') + ':' + must_env('TAG'),
      cpu: 0,
      portMappings: [
        {
          containerPort: 8080,
          hostPort: 8080,
          protocol: 'tcp',
          appProtocol: 'http',
        },
      ],
      essential: true,
      environment: [],
      secrets: [],
      mountPoints: [],
      volumesFrom: [],
      logConfiguration: {
        logDriver: 'awslogs',
        options: {
          'awslogs-group': '/aws/' + must_env('SYS_NAME') + '/logs',
          mode: 'non-blocking',
          'max-buffer-size': '25m',
          'awslogs-region': 'ap-northeast-1',
          'awslogs-stream-prefix': '${prefix-name}/${container-name}/${ecs-task-id}',
          'awslogs-create-group': 'true',
        },
        secretOptions: [],
      },
      systemControls: [],
      dependsOn: [],
    },
  ],
  taskRoleArn: ssm('/' + must_env('SYS_NAME') + '/task-role-arn'),
  executionRoleArn: ssm('/' + must_env('SYS_NAME') + '/execution-role-arn'),
  networkMode: 'awsvpc',
  requiresCompatibilities: ['FARGATE'],
  cpu: '1024',
  memory: '2048',
  runtimePlatform: {
    cpuArchitecture: 'ARM64',
    operatingSystemFamily: 'LINUX',
  },
}
