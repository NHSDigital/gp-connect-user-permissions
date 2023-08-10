### Introduction
This readme file describes the `mock_provider` service in detail. The content of the below directories will be discussed:
* `terraform` This includes the `mock_provider` service itself
* `infra` has terraform configuration to create AWS infrastructure
* `mock_provider` is the container that we run on AWS
* `token_validator` is the lambda that we use to check the request token

### Mock Provider
This is the service that mocks the provided OpenApi specification. We use a tool called [prism](https://stoplight.io/open-source/prism)
to generate a mock service from our OpeApi specification. The `mock_provider` directory contains everything that is needed
to create this service and run it as a container. You can use `mock_provider/Makefile` if you want to build and run this
container locally.

Our goal is to create AWS infrastructure so, we can run Mock Provider. Also, this entire stack is only used for non-prod
environments. For int environment, our Mock Provider will be available next to other providers that are given to us for
integration. Our tests only target this specific provider and other ones are going to be there to support external teams
integration.

### Terraform
We use terraform to deploy our AWS resources. This stack is divided into two directories.
The `infra` directory, is meant to be run only once. You can redeploy it by changing the resource's `prefix`. Once the infrastructure
is in place, then you can run the main stack in the `terraform` directory. You can create multiple instances of this deployment
only by creating a new [workspace](https://developer.hashicorp.com/terraform/language/state/workspaces) and pass a new
value to the `environment` variable. You should use the provided Makefile to handle the execution.

This readme file doesn't go into details of AWS resources but here is a short summary of what's happening.
We create a VPC with required networking stack. The goal is to have an ECS cluster and a Mock Provider service. We use AWS
Fargate to run these containers. This container is accessible only via an Api Gateway instance. Each request goes through
this instance before hitting a load balancer which will subsequently, proxy the request into the container.
Before we pass the request though, we run a Lambda to check the validity of the token. The code for this
Lambda lives under `token_validator` directory.

#### Makefile
The provided Makefile contains targets one to one matching with terraform actions i.e. apply, plan, destroy.
Before running any target make sure you provided the required variables. In most cases `environment` is the one but always
check the script and understand how it works before executing it.

### Pipeline
As mentioned before the terraform stack can be duplicated by creating a new workspace and changing the `environment` value.
We use this technic in the pipeline to create stand-alone deployment for each Pull Requests. When you create a new PR we deploy
it under the name `pr-<pr-number>`. This means every resource will get a `prefix` with that pattern.
The teardown process is the same. When you merge your PR, a new job will kick off a teardown process. It will run `terraform destroy`
for that specific PR.
