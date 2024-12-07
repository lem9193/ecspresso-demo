import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { Props } from '../bin/main';
import { Alb } from './construct/alb';
import { CodeDeploy } from './construct/codedeploy';
import { Ecs } from './construct/ecs';
import { Iam } from './construct/iam';
import { Network } from './construct/network';
import { ParameterStore } from './construct/parameter-store';

export class EcspressoDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const network = new Network(this, 'Network', {
      ...props,
    });

    const alb = new Alb(this, 'Alb', {
      ...props,
      vpc: network.vpc,
      subnets: network.publicSubnets,
      securityGroup: network.albSg,
    });

    const ecs = new Ecs(this, 'Ecs', {
      ...props,
      vpc: network.vpc,
    });

    new ParameterStore(this, 'ParameterStore', {
      ...props,
      subnets: network.apiSubnets,
      securityGroup: network.ecsSg,
      targetGroup: alb.blueTg,
      executionRole: ecs.executionRole,
      taskRole: ecs.taskRole,
    });

    new CodeDeploy(this, 'Codedeploy', {
      ...props,
      cluster: ecs.cluster,
      listener: alb.listener,
      testListener: alb.testListener,
      blueTargetGroup: alb.blueTg,
      greenTargetGroup: alb.greenTg,
    });

    new Iam(this, 'Iam', {
      ...props,
    });
  }
}
