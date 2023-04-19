variable "region" {}

variable "prefix" {}
variable "short_prefix" {}

variable "registry_id" {}
variable "image_version" {}

variable "cluster_id" {}

variable "service_domain_name" {}

variable "container_port" {
}

locals {
  service_name = "mock-provider"
}

variable "subnet_ids" {
  type = list(string)
}

variable "alb_tg_arn" {}

data "aws_subnet" "private_subnets" {
  count = length(var.subnet_ids)
  id    = var.subnet_ids[count.index]
}

variable "vpc_id" {}
