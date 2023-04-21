-include .env

interactionId=$(environment)

aws_profile = apim-dev
tf_cmd = AWS_PROFILE=$(aws_profile) terraform

project_name = gp-connect-user-permissions
project_short_name = gcupf
state_bucket = $(project_name)-terraform-state
tf_state= -backend-config="bucket=$(state_bucket)"

tf_vars= -var="project_name=$(project_name)" -var="project_short_name=$(project_short_name)"

workspace:
	$(tf_cmd) workspace new $(environment) || $(tf_cmd) workspace select $(environment) && echo "Switched to workspace/environment: $(environment)"

init:
	$(tf_cmd) init $(tf_state) $(tf_vars) -var="client_id=$(client_id)" -var="client_secret=$(client_secret)" -var="keycloak_environment=$(keycloak_environment)"

plan: workspace
	 $(tf_cmd) plan $(tf_vars) -var="client_id=$(client_id)" -var="client_secret=$(client_secret)" -var="keycloak_environment=$(keycloak_environment)"

apply: workspace
	$(tf_cmd) apply $(tf_vars) -auto-approve -var="client_id=$(client_id)" -var="client_secret=$(client_secret)" -var="keycloak_environment=$(keycloak_environment)"

clean:
	rm -rf build .terraform upload-key

destroy: workspace
	$(tf_cmd) destroy $(tf_vars) -auto-approve -var="client_id=$(client_id)" -var="client_secret=$(client_secret)" -var="keycloak_environment=$(keycloak_environment)"
	teraform workspace select default
	terraform workspace delete $(environment)

add-endpoint:
	chmod +x ./AddEndpoints.sh
	./AddEndpoints.sh

output:
	$(tf_cmd) output -raw $(name)

mock_provider_repository_name = gp-connect-user-permissions-infra-dev-mock-provider
mock_provider_repository_url = $(aws_account_no).dkr.ecr.eu-west-2.amazonaws.com/$(mock_provider_repository_name)
build_version=$(environment)
dockerImageName=$(mock_provider_repository_url):$(build_version)
dockerFilePath=../mock_provider/Dockerfile
dockerContext=../mock_provider

docker-login:
	 aws ecr get-login-password --profile $(aws_profile) --region eu-west-2 | docker login --username AWS --password-stdin $(aws_account_no).dkr.ecr.eu-west-2.amazonaws.com

docker-build:
	make -C .. publish
	docker build -t $(dockerImageName) -f $(dockerFilePath) $(dockerContext)


docker-deploy: docker-login docker-build
	 docker push $(dockerImageName)

lock-provider:
	# Run this only when you install a new terraform provider. This will generate sha code in lock file for all platform
	echo "This may take a while. Be patient!"
	$(tf_cmd) providers lock -platform=darwin_arm64 -platform=darwin_amd64 -platform=linux_amd64 -platform=windows_amd64

# Token Validation Lambda
lambda_repository_name = $(project_name)-infra-dev-token-validator
lambda_repository_url = $(aws_account_no).dkr.ecr.eu-west-2.amazonaws.com/$(lambda_repository_name)
build_version=$(environment)
lambdaDockerImageName=$(lambda_repository_url):$(build_version)
lambdaDockerFilePath=../mock_provider/auth/Dockerfile
lambdaDockerContext=../mock_provider/auth

docker-build-lambda:
	docker build -t $(lambdaDockerImageName) -f $(lambdaDockerFilePath) $(lambdaDockerContext)

docker-deploy-lambda: docker-build-lambda docker-login
	docker push $(lambdaDockerImageName)
