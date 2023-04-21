data aws_caller_identity current {}

data aws_ecr_repository "token_validation_ecr" {
    name = var.token_validator_registry_id
}

locals {
    ecr_image_tag = var.environment
    validation_ecr_url = data.aws_ecr_repository.token_validation_ecr.repository_url
}

resource null_resource ecr_image {
  triggers = {
    python_file = md5(file("${path.module}/../../mock_provider/auth/src/validate_access_token.py"))
    docker_file = md5(file("${path.module}/../../mock_provider/auth/Dockerfile"))
  }

  # The local-exec provisioner invokes a local executable after a resource is created.
  # This invokes a process on the machine running Terraform, not on the resource.
  provisioner "local-exec" {
    command = <<EOF
           make docker-deploy-lambda
       EOF
    interpreter = ["bash", "-c"]
    working_dir = "."
  }
}

data aws_ecr_image lambda_image {
  depends_on = [
    null_resource.ecr_image
  ]
  repository_name = data.aws_ecr_repository.token_validation_ecr.name
  image_tag       = local.ecr_image_tag
}

resource aws_lambda_function validate-token-lambda-function {
  depends_on = [
    null_resource.ecr_image
  ]
  function_name = "${var.short_prefix}-token-validation-lambda"
  role = aws_iam_role.lambda_role.arn
  timeout = 300
  image_uri = "${local.validation_ecr_url}@${data.aws_ecr_image.lambda_image.id}"
  package_type = "Image"
  source_code_hash = data.aws_ecr_image.lambda_image.image_digest

  environment {
      variables = {
          "keycloak_environment": var.keycloak_environment,
          "client_id": var.client_id,
          "client_secret": var.client_secret
      }
  }
}
