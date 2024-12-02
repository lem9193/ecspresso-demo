import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';

import * as applicationautoscaling from 'aws-cdk-lib/aws-applicationautoscaling';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Props } from '../../bin/main';

interface EcsProps extends Props {
  vpc: ec2.IVpc;
}

export class Ecs extends Construct {
  public readonly cluster: ecs.Cluster;
  public readonly executionRole: iam.Role;
  public readonly taskRole: iam.Role;
  private readonly prefix: string;

  constructor(scope: Construct, id: string, props: EcsProps) {
    super(scope, id);

    this.prefix = props.prefix;

    this.createEcrRepositories('ecspresso-demo', 'ecspresso-demo');
    this.executionRole = this.createExecutionRole();
    this.taskRole = this.createTaskRole();

    this.cluster = new ecs.Cluster(this, 'Default', {
      clusterName: `${this.prefix}-cluster`,
      containerInsights: true,
      enableFargateCapacityProviders: true,
      vpc: props.vpc,
    });

    // 初回時は作成しない
    if (props.isFirst === 'n') {
      this.createAutoScaling();
    }
  }

  private createEcrRepositories(id: string, name: string): void {
    new ecr.Repository(this, `${id}Repository`, {
      repositoryName: name,
      emptyOnDelete: true,
      encryption: ecr.RepositoryEncryption.KMS,
      imageTagMutability: ecr.TagMutability.MUTABLE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }

  private createExecutionRole(): iam.Role {
    const role = new iam.Role(this, 'ExecutionRole', {
      roleName: `${this.prefix}-execution-role`,
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonECSTaskExecutionRolePolicy',
        ),
      ],
    });

    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ssm:GetParameters',
          'ssm:GetParameter',
          'secretsmanager:GetSecretValue',
        ],
        resources: ['*'],
      }),
    );

    return role;
  }

  private createTaskRole(): iam.Role {
    const role = new iam.Role(this, 'TaskRole', {
      roleName: `${this.prefix}-task-role`,
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    this.addSystemsManagerPolicy(role);
    this.addCloudWatchLogsPolicy(role);

    return role;
  }

  private addSystemsManagerPolicy(role: iam.Role): void {
    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ssmmessages:CreateControlChannel',
          'ssmmessages:CreateDataChannel',
          'ssmmessages:OpenControlChannel',
          'ssmmessages:OpenDataChannel',
        ],
        resources: ['*'],
      }),
    );
  }

  private addCloudWatchLogsPolicy(role: iam.Role): void {
    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:PutLogEvents',
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:DescribeLogStreams',
          'logs:DescribeLogGroups',
        ],
        resources: ['*'],
      }),
    );
  }

  private createAutoScaling(): applicationautoscaling.ScalableTarget {
    const scalableTarget = new applicationautoscaling.ScalableTarget(
      this,
      'ApiServiceAutoScale',
      {
        serviceNamespace: applicationautoscaling.ServiceNamespace.ECS,
        scalableDimension: 'ecs:service:DesiredCount',
        resourceId: `service/${this.cluster.clusterName}/${this.prefix}-service`,
        maxCapacity: 2,
        minCapacity: 1,
      },
    );

    scalableTarget.scaleToTrackMetric('ApiServiceCPUUtilization', {
      targetValue: 90,
      predefinedMetric:
        applicationautoscaling.PredefinedMetric
          .ECS_SERVICE_AVERAGE_CPU_UTILIZATION,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    scalableTarget.scaleToTrackMetric('ApiServiceMemoryUtilization', {
      targetValue: 90,
      predefinedMetric:
        applicationautoscaling.PredefinedMetric
          .ECS_SERVICE_AVERAGE_MEMORY_UTILIZATION,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    return scalableTarget;
  }
}
