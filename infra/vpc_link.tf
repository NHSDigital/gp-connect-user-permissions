resource "aws_apigatewayv2_vpc_link" "alb_vpc_link" {
  name               = local.prefix
  security_group_ids = [aws_security_group.vpc_link_security_group.id]
  subnet_ids         = local.private_subnet_ids
}

resource "aws_security_group" "vpc_link_security_group" {
  name   = "${local.prefix}-vpc-link"
  vpc_id = local.vpc_id

  ingress {
    protocol    = "tcp"
    from_port   = var.listener_port
    to_port     = var.listener_port
    cidr_blocks = local.public_subnet_cidr
  }

  egress {
    protocol    = "tcp"
    from_port   = var.listener_port
    to_port     = var.listener_port
    cidr_blocks = local.private_subnet_cidr
  }
}
