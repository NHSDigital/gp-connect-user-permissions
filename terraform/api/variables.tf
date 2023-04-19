variable "prefix" {}
variable "short_prefix" {}
variable "environment" {}
variable "zone_id" {}
variable "api_domain_name" {}
variable "lb" {
  type = object({
    alb_vpc_link_id = string,
    listener_arn    = string
  })
}
variable "token_validator_registry_id" {}
variable "client_id" {}
variable "client_secret" {}
variable "keycloak_environment" {}
