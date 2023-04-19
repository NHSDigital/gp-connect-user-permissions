module "vpc_endpoints" {
  source = "./vpc_endpoints"

  vpc_id      = local.vpc_id
  prefix = local.prefix
  subnet_ids  = local.private_subnet_ids
}
