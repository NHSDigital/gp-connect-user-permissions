terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4"
    }
  }
  backend "s3" {
    region = "eu-west-2"
    key    = "state"
  }
}

provider "aws" {
  region  = "eu-west-2"
  profile = "apim-dev"
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = local.environment
      Service     = var.service
    }
  }
}

provider "aws" {
  alias   = "acm_provider"
  region  = "eu-west-2"
  profile = "apim-dev"
}
