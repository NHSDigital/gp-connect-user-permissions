/* Use infra terraform state to populate infra outputs.
We use the infra state file to read the outputs and then reassign them to local names
*/

data "terraform_remote_state" "gp-connect-pfs-user-permissions-infra" {
  backend = "s3"
  config = {
    bucket = "${var.project_name}-infra-terraform-state"
    key    = "env:/dev/state"
    region = "eu-west-2"
  }
}

locals {
  vpc_id              = data.terraform_remote_state.gp-connect-pfs-user-permissions-infra.outputs.vpc_id
  project_domain_name = data.terraform_remote_state.gp-connect-pfs-user-permissions-infra.outputs.zone_domain
  alb_vpc_link_id     = data.terraform_remote_state.gp-connect-pfs-user-permissions-infra.outputs.alb_vpc_link_id

  mock_provider_subnet_ids  = data.terraform_remote_state.gp-connect-pfs-user-permissions-infra.outputs.mock_provider_subnet_ids
  mock_provider_registry_id = data.terraform_remote_state.gp-connect-pfs-user-permissions-infra.outputs.mock_provider_registry_id

  token_validator_registry_id = data.terraform_remote_state.gp-connect-pfs-user-permissions-infra.outputs.token_validator_registry_id
}


data "aws_subnet" "mock_provider_subnets" {
  count = length(local.mock_provider_subnet_ids)
  id    = local.mock_provider_subnet_ids[count.index]
}

locals {
  private_subnet_cidr = data.aws_subnet.mock_provider_subnets.*.cidr_block
}
