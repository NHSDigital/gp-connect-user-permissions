data "aws_caller_identity" "current" {}

data "aws_ecr_repository" "token_validation_ecr" {
    name = var.token_validator_registry_id
}

locals {
   validator_path      = "${path.root}/../token_validator"
   validator_ecr_url   = data.aws_ecr_repository.token_validation_ecr.repository_url
   validator_image_tag = var.environment
   validator_ecr_tag   = "${local.validator_ecr_url}:${local.validator_image_tag}"
}

data "archive_file" "token_validator_archive" {
  type        = "zip"
  source_dir  = local.validator_path
  output_path = "build/token_validator.zip"
}

resource "null_resource" "push_token_validator_image" {
  triggers = {
    token_validator_src = data.archive_file.token_validator_archive.output_sha
  }

  provisioner "local-exec" {
    interpreter = ["bash", "-c"]
    command = <<EOF
      aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.eu-west-2.amazonaws.com
      docker build -t ${local.validator_ecr_tag} -f ${local.validator_path}/Dockerfile ${local.validator_path}
      docker push ${local.validator_ecr_tag}
      EOF
    working_dir = "."
  }
}

data "aws_ecr_image" "lambda_image" {
  depends_on = [
    null_resource.push_token_validator_image
  ]
  repository_name = data.aws_ecr_repository.token_validation_ecr.name
  image_tag       = local.validator_image_tag
}

resource "aws_lambda_function" "validate-token-lambda-function" {
  depends_on = [
    null_resource.push_token_validator_image
  ]
  function_name    = "${var.short_prefix}-token-validator-lambda"
  role             = aws_iam_role.lambda_role.arn
  timeout          = 300
  image_uri        = "${local.validator_ecr_url}@${data.aws_ecr_image.lambda_image.id}"
  package_type     = "Image"
  source_code_hash = data.aws_ecr_image.lambda_image.image_digest

  environment {
      variables = {
        "keycloak_environment" : var.keycloak_environment,
        "client_id" : var.client_id,
        "client_secret" : var.client_secret
    }
  }
}
