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
	$(tf_cmd) workspace select default
	$(tf_cmd) workspace delete $(environment)

output:
	$(tf_cmd) output -raw $(name)
