import { Construct } from 'constructs';

import * as iam from 'aws-cdk-lib/aws-iam';

import { Props } from '@bin/main';

export class Iam extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const repoName = process.env.GIT_REPO;

    if (repoName) {
      const oidcProvider = new iam.OpenIdConnectProvider(
        this,
        'GitHubOIDCProvider',
        {
          url: 'https://token.actions.githubusercontent.com',
          clientIds: ['sts.amazonaws.com'],
        },
      );

      new iam.Role(this, 'GitHubOIDCRole', {
        roleName: `${props.prefix}-github-oidc-role`,
        assumedBy: new iam.FederatedPrincipal(
          oidcProvider.openIdConnectProviderArn,
          {
            StringEquals: {
              'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
            },
            StringLike: {
              'token.actions.githubusercontent.com:sub': [
                `repo:${repoName}:ref:refs/heads/*`,
                `repo:${repoName}:pull_request`,
              ],
            },
          },
          'sts:AssumeRoleWithWebIdentity',
        ),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
        ],
      });
    }
  }
}
