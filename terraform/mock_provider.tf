module "mock-provider" {
  source         = "./mock-provider"
  region         = var.region
  prefix         = local.prefix
  short_prefix   = local.short_prefix
  cluster_id     = module.cluster.cluster_id
  container_port = 9000
  subnet_ids     = local.mock_provider_subnet_ids
  alb_tg_arn     = module.alb.alb_target_group_arn
  vpc_id         = local.vpc_id
  registry_id    = local.mock_provider_registry_id
  image_version  = local.environment
  service_domain_name = module.api.service_domain_name
}
