environment = dev
aws_profile = apim-dev
tf_opt=
tf_cmd = AWS_PROFILE=$(aws_profile) terraform

project_name = gp-connect-user-permissions
project_short_name = gcupf
state_bucket = $(project_name)-infra-terraform-state
tf_state= -backend-config="bucket=$(state_bucket)"

tf_vars= -var="project_name=$(project_name)" -var="project_short_name=$(project_short_name)"

.SILENT:
workspace:
	$(tf_cmd) workspace new $(environment) || $(tf_cmd) workspace select $(environment) && echo "Switched to workspace/environment: $(environment)"

init:
	$(tf_cmd) init $(tf_state) $(tf_vars)

plan: workspace
	$(tf_cmd) plan $(tf_vars)

apply: workspace
	 $(tf_cmd) apply $(tf_vars) -auto-approve

destroy:
	$(tf_cmd) destroy $(tf_vars)

lock-provider:
	# Run this only when you install a new terraform provider. This will generate sha code in lock file for all platform
	echo "This may take a while. Be patient!"
	$(tf_cmd) providers lock -platform=darwin_arm64 -platform=darwin_amd64 -platform=linux_amd64 -platform=windows_amd64
