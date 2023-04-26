module "api" {
  source = "./api"

  prefix          = local.prefix
  short_prefix    = local.short_prefix
  zone_id         = data.aws_route53_zone.project_zone.zone_id
  api_domain_name = local.service_domain_name
  environment     = local.environment
  lb = {
    listener_arn    = module.alb.alb_listener_arn
    alb_vpc_link_id = local.alb_vpc_link_id
  }
  token_validator_registry_id = local.token_validator_registry_id
  client_id = var.client_id
  client_secret = var.client_secret
  keycloak_environment = var.keycloak_environment
}
