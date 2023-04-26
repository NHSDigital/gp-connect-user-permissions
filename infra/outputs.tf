output "zone_domain" {
  value = aws_route53_zone.project_zone.name
}

output "vpc_id" {
  value = local.vpc_id
}

output "mock_provider_subnet_ids" {
  value = local.mock_provider_subnet_ids
}

output "alb_vpc_link_id" {
  value = aws_apigatewayv2_vpc_link.alb_vpc_link.id
}

output "mock_provider_registry_id" {
  value = aws_ecr_repository.mock_provider_registry.id
}

output "token_validator_registry_id" {
  value = aws_ecr_repository.token_validator_registry.id
}
