import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import { Props } from '../../bin/main';

interface AlbProps extends Props {
  vpc: ec2.IVpc;
  subnets: ec2.ISubnet[];
  securityGroup: ec2.ISecurityGroup;
}

const HEALTH_CHECK_CONFIG: elbv2.HealthCheck = {
  enabled: true,
  path: '/',
  healthyHttpCodes: '200',
  interval: cdk.Duration.seconds(15),
  timeout: cdk.Duration.seconds(5),
  healthyThresholdCount: 2,
  unhealthyThresholdCount: 2,
};

export class Alb extends Construct {
  public readonly lb: elbv2.ApplicationLoadBalancer;
  public readonly blueTg: elbv2.ApplicationTargetGroup;
  public readonly greenTg: elbv2.ApplicationTargetGroup;
  public readonly listener: elbv2.ApplicationListener;
  public readonly testListener: elbv2.ApplicationListener;
  private readonly prefix: string;
  private readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props: AlbProps) {
    super(scope, id);

    this.prefix = props.prefix;

    this.vpc = props.vpc;

    this.lb = new elbv2.ApplicationLoadBalancer(this, 'Default', {
      vpc: props.vpc,
      loadBalancerName: `${this.prefix}-alb`,
      internetFacing: true,
      ipAddressType: elbv2.IpAddressType.IPV4,
      clientKeepAlive: cdk.Duration.hours(1),
      idleTimeout: cdk.Duration.seconds(60),
      securityGroup: props.securityGroup,
      vpcSubnets: { subnets: props.subnets },
    });

    this.blueTg = this.createTargetGroup('Blue');
    this.greenTg = this.createTargetGroup('Green');

    this.listener = this.createListener(
      'Api',
      elbv2.ListenerAction.forward([this.blueTg]),
      80,
    );

    this.testListener = this.createListener(
      'Test',
      elbv2.ListenerAction.forward([this.greenTg]),
      8080,
    );
  }

  private createTargetGroup(id: string): elbv2.ApplicationTargetGroup {
    return new elbv2.ApplicationTargetGroup(this, `${id}Tg`, {
      targetGroupName: `${this.prefix}-${id}Tg`,
      deregistrationDelay: cdk.Duration.seconds(300),
      healthCheck: HEALTH_CHECK_CONFIG,
      loadBalancingAlgorithmType:
        elbv2.TargetGroupLoadBalancingAlgorithmType.ROUND_ROBIN,
      port: 8080,
      targetType: elbv2.TargetType.IP,
      vpc: this.vpc,
    });
  }

  private createListener(
    id: string,
    defaultAction: elbv2.ListenerAction,
    port: number,
  ): elbv2.ApplicationListener {
    return new elbv2.ApplicationListener(this, `${id}Listener`, {
      loadBalancer: this.lb,
      defaultAction,
      open: true,
      port,
      protocol: elbv2.ApplicationProtocol.HTTP,
    });
  }
}
