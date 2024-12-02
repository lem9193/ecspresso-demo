local must_env = std.native('must_env');
local ssm = std.native('ssm');

{
  capacityProviderStrategy: [
    {
      base: 0,
      capacityProvider: 'FARGATE',
      weight: 1,
    },
  ],
  deploymentConfiguration: {
    maximumPercent: 200,
    minimumHealthyPercent: 100,
  },
  deploymentController: {
    type: 'CODE_DEPLOY',
  },
  desiredCount: 1,
  enableECSManagedTags: true,
  enableExecuteCommand: false,
  healthCheckGracePeriodSeconds: 0,
  launchType: '',
  loadBalancers: [
    {
      containerName: must_env('SYS_NAME') + '-container',
      containerPort: 8080,
      targetGroupArn: ssm('/' + must_env('SYS_NAME') + '/target-group-arn'),
    },
  ],
  networkConfiguration: {
    awsvpcConfiguration: {
      assignPublicIp: 'DISABLED',
      securityGroups: [ssm('/' + must_env('SYS_NAME') + '/security-group-id')],
      subnets: [
        ssm('/' + must_env('SYS_NAME') + '/subnet-id-1'),
        ssm('/' + must_env('SYS_NAME') + '/subnet-id-2'),
      ],
    },
  },
  platformFamily: 'Linux',
  platformVersion: 'LATEST',
  propagateTags: 'NONE',
  schedulingStrategy: 'REPLICA',
}
