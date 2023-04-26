data "aws_route53_zone" "project_zone" {
  name = local.project_domain_name
}
