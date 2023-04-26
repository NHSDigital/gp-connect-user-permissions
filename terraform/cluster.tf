module "cluster" {
  source       = "./cluster"
  prefix       = local.prefix
  short_prefix = local.short_prefix
}
