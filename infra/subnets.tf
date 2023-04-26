locals {
  vpc_link_public_subnets = [
    {
      cidr              = cidrsubnet(local.vpc_cidr, 8, 0)
      availability_zone = "eu-west-2a"
      is_public         = true
      description       = "vpc link default subnet zone a"
      }, {
      cidr              = cidrsubnet(local.vpc_cidr, 8, 1)
      availability_zone = "eu-west-2b"
      is_public         = true
      description       = "vpc link default subnet zone b"
      }, {
      cidr              = cidrsubnet(local.vpc_cidr, 8, 2)
      availability_zone = "eu-west-2c"
      is_public         = true
      description       = "vpc link default subnet zone c"
    }
  ]
  mock_provider_subnets = [
    {
      cidr              = cidrsubnet(local.vpc_cidr, 8, 32)
      availability_zone = "eu-west-2a"
      is_public         = false
      description       = "mock-provider zone a"
      }, {
      cidr              = cidrsubnet(local.vpc_cidr, 8, 33)
      availability_zone = "eu-west-2b"
      is_public         = false
      description       = "mock-provider zone b"
    }
  ]
}

locals {
  private_subnets = concat(local.mock_provider_subnets)
  public_subnets  = concat(local.vpc_link_public_subnets)

  private_subnet_cidr = [for subnet in local.private_subnets : subnet.cidr]
  public_subnet_cidr  = [for subnet in local.public_subnets : subnet.cidr]
}

resource "aws_subnet" "mock_provider_subnets" {
  count                   = length(local.mock_provider_subnets)
  cidr_block              = local.mock_provider_subnets[count.index].cidr
  vpc_id                  = local.vpc_id
  availability_zone       = local.mock_provider_subnets[count.index].availability_zone
  map_public_ip_on_launch = local.mock_provider_subnets[count.index].is_public

  tags = {
    Name        = "${local.prefix}-${local.mock_provider_subnets[count.index].is_public ? "public" : "private"}-${local.mock_provider_subnets[count.index].availability_zone}"
    Description = local.mock_provider_subnets[count.index].description
  }
}

resource "aws_subnet" "vpc_link_subnets" {
  count                   = length(local.vpc_link_public_subnets)
  cidr_block              = local.vpc_link_public_subnets[count.index].cidr
  vpc_id                  = local.vpc_id
  availability_zone       = local.vpc_link_public_subnets[count.index].availability_zone
  map_public_ip_on_launch = local.vpc_link_public_subnets[count.index].is_public

  tags = {
    Name        = "${local.prefix}-${local.vpc_link_public_subnets[count.index].is_public ? "public" : "private"}-${local.vpc_link_public_subnets[count.index].availability_zone}"
    Description = local.vpc_link_public_subnets[count.index].description
  }
}

locals {
  mock_provider_subnet_ids = aws_subnet.mock_provider_subnets[*].id
  private_subnet_ids       = concat(local.mock_provider_subnet_ids)
}
