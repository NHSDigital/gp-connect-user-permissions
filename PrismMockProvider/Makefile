mock_provider_repository_name = gp-connect-user-permissions-infra-dev-mock-provider
mock_provider_repository_url = $(aws_account_no).dkr.ecr.eu-west-2.amazonaws.com/$(mock_provider_repository_name)
aws_profile = apim-dev
aws_account_no = 790083933819
build_version=alli5  #change to your short name
dockerImageName=$(mock_provider_repository_url):$(build_version)

build: spec
	docker build -t gp-connect-mock-provider -f Dockerfile .

run: build
	docker run --rm -it -p 9000:9000 gp-connect-mock-provider

spec:
	make -C .. publish

.PHONY: build run

docker-login:
	 aws ecr get-login-password --profile $(aws_profile) --region eu-west-2 | docker login --username AWS --password-stdin $(aws_account_no).dkr.ecr.eu-west-2.amazonaws.com

docker-build:
	make -C .. publish
	docker build -t $(dockerImageName) .

docker-deploy: docker-login docker-build
	 docker push $(dockerImageName)
