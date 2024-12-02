import { Construct } from 'constructs';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import { Props } from '../../bin/main';

interface ParameterStoreProps extends Props {
  subnets: ec2.ISubnet[];
  securityGroup: ec2.ISecurityGroup;
  targetGroup: elbv2.ITargetGroup;
  executionRole: iam.IRole;
  taskRole: iam.IRole;
}

interface Parameter {
  id: string;
  name: string;
  stringValue: string;
}

export class ParameterStore extends Construct {
  private readonly prefix: string;

  constructor(scope: Construct, id: string, props: ParameterStoreProps) {
    super(scope, id);

    this.prefix = props.prefix;

    const parameters = [
      {
        id: 'SubnetId1',
        name: 'subnet-id-1',
        stringValue: props.subnets[0]!.subnetId,
      },
      {
        id: 'SubnetId2',
        name: 'subnet-id-2',
        stringValue: props.subnets[1]!.subnetId,
      },
      {
        id: 'SecurityGroupId',
        name: 'security-group-id',
        stringValue: props.securityGroup.securityGroupId,
      },
      {
        id: 'TargetGroupArn',
        name: 'target-group-arn',
        stringValue: props.targetGroup.targetGroupArn,
      },
      {
        id: 'ExecutionRoleArn',
        name: 'execution-role-arn',
        stringValue: props.executionRole.roleArn,
      },
      {
        id: 'TaskRoleArn',
        name: 'task-role-arn',
        stringValue: props.taskRole.roleArn,
      },
    ] as const satisfies Parameter[];

    parameters.forEach((e) => {
      this.createParameters(e);
    });
  }

  private createParameters(parameter: Parameter): void {
    new ssm.StringParameter(this, parameter.id, {
      parameterName: this.formatParameterName(parameter.name),
      stringValue: parameter.stringValue,
    });
  }

  private formatParameterName(name: string): string {
    return `/${this.prefix}/${name}`;
  }
}
