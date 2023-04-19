# Building infrastructure with Terraform (using AWS CLI)

## Prerequisites

1. [Terraform CLI](https://learn.hashicorp.com/tutorials/terraform/install-cli?in=terraform/aws-get-started) installed
2. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) installed
3. Your AWS credentials. (Create an access key for your user account)
4. Set up you AWS account for AWS CLI usage (https://nhsd-confluence.digital.nhs.uk/pages/viewpage.action?spaceKey=APM&title=KOP-011+Set+up+AWS+Account+for+CLI+Usage)

### Step 1

Configure the AWS CLI from your terminal by inputing your AWS Access Key ID and Secret Access Key using the following command:
```
$ aws configure
```
Once configured, your credentials will be stored in a file at `~/.aws/credentials`.

### Step 2

Follow the instructions [here](https://nhsd-confluence.digital.nhs.uk/pages/viewpage.action?spaceKey=APM&title=KOP-011+Set+up+AWS+Account+for+CLI+Usage), once aws_mfa_update has been setup run this command to get a new token:
```
$ aws-mfa-update 347250048819 <your aws name> <aws mfa code>
```
The result of this step should be a working aws_mfa_update script and a `~/.aws/config` file containing the Role you will assume (NHSDAdminRole).

### Step 3

Set AWS_PROFILE to the role you will assume, e.g.
```
$ export AWS_PROFILE=apim_dev
```

### Step 4

Run Terraform using the following:
```
$ cd infra
$ make init
```
```
$ make plan
```
This will prompt you to enter a region, e.g. "eu-west-2"
```
$ make apply
```
This may ask you for confirmation before execution.
```
$ make docker-build
```
This will build PrismMockProvider docker
```
$ make docker-deploy
```
This will deploy PrismMock provider docker image to ECR repo from your local machine.
This step is also integrated with azure pipeline; with each new build, mock provider will be tagged with build number and pushed on ECR

## Implementation
This folder contains all the configuration related to the networking and infrastructure. You probably don't need to either change
or redeploy contents of this directory.
- This will create ECR repo for you in AWS. In development there will be single ECR and different images will be pushed to the same repo
- This will create private and public subnets and VPC

### per-user and per-pr environment



### internal environments deployment
Create a `.env` file and set `environment=dev` and `aws_account_no=790083933819`. When you run `terraform apply` you should see all services
are prefixed with `dev`.We dont want these services to get deployed per user per env.
In AWS we only have one development environment,called `dev`. All apigee internal environments will use this `dev` environment as their
backend i.e. mock-provider. You need to deploy ECR to `dev` environment manually, since we currently don't have pipeline integration.*



