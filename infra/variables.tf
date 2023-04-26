variable "project_name" {}
variable "project_short_name" {}

locals {
  project_name = "${var.project_name}-infra"
  prefix       = "${local.project_name}-${var.environment}"
  short_prefix = "${var.project_short_name}-${var.environment}"
}

locals {
  vpc_cidr = "10.0.0.0/16"
}

variable "region" {
  default = "eu-west-2"
}


variable "root_domain_name" {
  default = "dev.api.platform.nhs.uk"
}

variable "environment" {
  default = "dev"
}

variable "container_port" {
  default = 9000
}

variable "listener_port" {
  default = 80
}
