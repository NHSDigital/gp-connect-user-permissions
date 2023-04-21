locals {
  mock_provider_path = "${path.cwd}/../mock_provider"
  specification_path = "${path.cwd}/../specification"
}

data "archive_file" "specification_archive" {
  type        = "zip"
  source_dir  = local.specification_path
  output_path = "build/specification.zip"
}

data "archive_file" "prism_archive" {
  type        = "zip"
  source_dir  = local.mock_provider_path
  output_path = "build/mock_provider.zip"
}

data "aws_caller_identity" "current" {}

data "aws_ecr_repository" "mock_provider_repository" {
  name = var.registry_id
}

resource "null_resource" "mock-provider_image_push" {
  triggers = {
    specification_src = data.archive_file.specification_archive.output_sha
    prism_src         = data.archive_file.prism_archive.output_sha
  }

  provisioner "local-exec" {
    interpreter = ["bash", "-c"]
    command=<<-EOF
export AWS_PROFILE=apim-dev
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.eu-west-2.amazonaws.com
ecr_url=${data.aws_ecr_repository.mock_provider_repository.repository_url}
image_tag=$ecr_url:${var.image_version}
docker build -t $image_tag -f ${local.mock_provider_path}/Dockerfile ${local.mock_provider_path}
docker push -a $ecr_url
aws ecs update-service --cluster ${var.prefix} --service ${var.prefix} --force-new-deployment --region eu-west-2
sleep 50
counter=0
endpoint=https://${var.service_domain_name}/_status
echo $endpoint
while [ $counter -lt 10 ]
do
    response=$(curl -s -o /dev/null -w "%%{http_code}" -X GET $endpoint )
    echo $response
    if [ $response -eq 200 ]
    then
      echo "Status test successful"
      break
    else
      echo "Waiting for $endpoint to return a 200 response..."
      ((counter=counter+1))
      echo $counter
      sleep 80
    fi
done
    EOF
  }
}
