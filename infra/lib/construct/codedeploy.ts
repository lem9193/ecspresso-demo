import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';

import * as codedeploy from 'aws-cdk-lib/aws-codedeploy';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Props } from '../../bin/main';

interface CodeDeployProps extends Props {
  cluster: ecs.Cluster;
  blueTargetGroup: elbv2.ApplicationTargetGroup;
  greenTargetGroup: elbv2.ApplicationTargetGroup;
  listener: elbv2.ApplicationListener;
  testListener: elbv2.ApplicationListener;
}

export class CodeDeploy extends Construct {
  private readonly codeDeployRole: iam.Role;
  private readonly ecsDeployApp: codedeploy.EcsApplication;
  private readonly prefix: string;
  constructor(scope: Construct, id: string, props: CodeDeployProps) {
    super(scope, id);

    this.prefix = props.prefix;

    this.codeDeployRole = new iam.Role(this, 'EcsCodeDeployRole', {
      roleName: `${this.prefix}-codedeploy`,
      assumedBy: new iam.ServicePrincipal('codedeploy.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeDeployRoleForECS'),
      ],
    });

    this.ecsDeployApp = new codedeploy.EcsApplication(this, 'EcsDeployApp', {
      applicationName: `${this.prefix}-ecs-app`,
    });

    // 初回時は作成しない
    if (props.isFirst === 'n') {
      new codedeploy.EcsDeploymentGroup(this, 'EcsCodeDeployGroup', {
        application: this.ecsDeployApp,
        deploymentGroupName: `${this.prefix}-ecs-deploy-group`,
        service: ecs.BaseService.fromServiceArnWithCluster(
          this,
          'EcsService',
          `arn:aws:ecs:${cdk.Stack.of(this).region}:${
            cdk.Stack.of(this).account
          }:service/${props.cluster.clusterName}/${this.prefix}-service`,
        ),
        deploymentConfig: codedeploy.EcsDeploymentConfig.ALL_AT_ONCE,
        role: this.codeDeployRole,
        blueGreenDeploymentConfig: {
          blueTargetGroup: props.blueTargetGroup,
          greenTargetGroup: props.greenTargetGroup,
          listener: props.listener,
          testListener: props.testListener,
        },
        autoRollback: {
          failedDeployment: true,
          stoppedDeployment: true,
        },
      });
    }
  }
}
