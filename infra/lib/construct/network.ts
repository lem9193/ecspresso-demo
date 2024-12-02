import { Construct } from 'constructs';

import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { Props } from '../../bin/main';

interface SubnetNames {
  public: string;
  api: string;
}

export class Network extends Construct {
  public readonly vpc: ec2.Vpc;
  public readonly publicSubnets: ec2.ISubnet[];
  public readonly apiSubnets: ec2.ISubnet[];
  public readonly albSg: ec2.SecurityGroup;
  public readonly ecsSg: ec2.SecurityGroup;
  private readonly prefix: string;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.prefix = props.prefix;

    const subnetNames = {
      public: `${this.prefix}-pub-subnet`,
      api: `${this.prefix}-ap-subnet`,
    } as const satisfies SubnetNames;

    this.vpc = new ec2.Vpc(this, 'Default', {
      vpcName: `${this.prefix}-vpc`,
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
      natGateways: 1,
      createInternetGateway: true,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      ipProtocol: ec2.IpProtocol.IPV4_ONLY,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: subnetNames.public,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: subnetNames.api,
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    const [publicSubnets, apiSubnets] = [
      this.vpc.publicSubnets.map((e) => e),
      this.vpc.privateSubnets.map((e) => e),
    ];

    this.publicSubnets = publicSubnets;
    this.apiSubnets = apiSubnets;

    this.albSg = this.createSecurityGroup('Alb');
    this.ecsSg = this.createSecurityGroup('Ecs');

    this.ecsSg.addIngressRule(this.albSg, ec2.Port.tcp(8080));
  }

  private createSecurityGroup(id: string): ec2.SecurityGroup {
    return new ec2.SecurityGroup(this, `${id}Sg`, {
      vpc: this.vpc,
      securityGroupName: `${this.prefix}-${id}-sg`,
      disableInlineRules: true,
    });
  }
}
