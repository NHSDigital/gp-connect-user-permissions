terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4"
    }
  }

  backend "s3" {
    key    = "state"
    region = "eu-west-2"
  }
}

provider "aws" {
  region  = "eu-west-2"
  profile = "apim-dev"

  default_tags {
    tags = {
      project     = local.project_name
      environment = var.environment
      tier        = "infrastructure"
    }
  }
}
