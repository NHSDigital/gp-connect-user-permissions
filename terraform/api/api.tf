resource "aws_apigatewayv2_api" "service_api" {
  name                         = "${var.prefix}-api"
  description                  = "GP Connect PFS mock-provider service backend api - ${var.environment}"
  protocol_type                = "HTTP"
  disable_execute_api_endpoint = true
}

resource "aws_apigatewayv2_domain_name" "service_api_domain_name" {
  domain_name = var.api_domain_name

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.service_certificate.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  tags = {
    Name = "${var.prefix}-api-domain-name"
  }
}

resource "aws_apigatewayv2_api_mapping" "api_mapping" {
  api_id      = aws_apigatewayv2_api.service_api.id
  domain_name = aws_apigatewayv2_domain_name.service_api_domain_name.id
  stage       = aws_apigatewayv2_stage.default.id
}

locals {
  api_stage_name = var.environment
}

resource "aws_apigatewayv2_integration" "route_integration" {
  api_id             = aws_apigatewayv2_api.service_api.id
  integration_uri    = var.lb.listener_arn
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  connection_type    = "VPC_LINK"
  connection_id      = var.lb.alb_vpc_link_id
}

resource "aws_apigatewayv2_route" "root_route" {
  api_id               = aws_apigatewayv2_api.service_api.id
  route_key            = "ANY /{proxy+}"
  target               = "integrations/${aws_apigatewayv2_integration.route_integration.id}"
  authorization_type   = "CUSTOM"
  authorizer_id        = aws_apigatewayv2_authorizer.token_validation.id
}

resource "aws_apigatewayv2_route" "ping_route" {
  api_id               = aws_apigatewayv2_api.service_api.id
  route_key            = "GET /ping"
  target               = "integrations/${aws_apigatewayv2_integration.route_integration.id}"
  authorization_type   = "NONE"
}

resource "aws_apigatewayv2_route" "status_route" {
  api_id               = aws_apigatewayv2_api.service_api.id
  route_key            = "GET /_status"
  target               = "integrations/${aws_apigatewayv2_integration.route_integration.id}"
  authorization_type   = "NONE"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.validate-token-lambda-function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.service_api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_stage" "default" {
  depends_on  = [aws_cloudwatch_log_group.api_access_log]
  api_id      = aws_apigatewayv2_api.service_api.id
  name        = local.api_stage_name
  auto_deploy = true

  default_route_settings {
    logging_level          = "ERROR"
    throttling_burst_limit = 100
    throttling_rate_limit  = 100
  }
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_access_log.arn
    format          = "{ \"requestId\":\"$context.requestId\", \"extendedRequestId\":\"$context.extendedRequestId\", \"ip\": \"$context.identity.sourceIp\", \"caller\":\"$context.identity.caller\", \"user\":\"$context.identity.user\", \"requestTime\":\"$context.requestTime\", \"httpMethod\":\"$context.httpMethod\", \"resourcePath\":\"$context.resourcePath\", \"status\":\"$context.status\", \"protocol\":\"$context.protocol\",  \"responseLength\":\"$context.responseLength\", \"authorizerError\":\"$context.authorizer.error\", \"authorizerStatus\":\"$context.authorizer.status\", \"requestIsValid\":\"$context.authorizer.is_valid\"\"environment\":\"$context.authorizer.environment\", \"clientID\":\"$context.authorizer.client_id\"}"
  }

  # Bug in terraform-aws-provider with perpetual diff
  lifecycle {
    ignore_changes = [deployment_id]
  }
}


resource "aws_apigatewayv2_authorizer" "token_validation" {
  api_id                            = aws_apigatewayv2_api.service_api.id
  authorizer_type                   = "REQUEST"
  identity_sources                  = ["$request.header.Authorization"]
  name                              = "token-validation-authorizer"
  authorizer_uri                    = aws_lambda_function.validate-token-lambda-function.invoke_arn
  authorizer_payload_format_version = "2.0"
  authorizer_credentials_arn        = aws_iam_role.apig_lambda_role.arn
  enable_simple_responses           = true
  authorizer_result_ttl_in_seconds  = 1

}

output "service_domain_name" {
  value = aws_apigatewayv2_api_mapping.api_mapping.domain_name
}
