image_name = gp-connect-user-permissions-mock-receiver
aws_profile = apim-dev
aws_account_no = 790083933819

build:
	make -C .. publish
	docker build -t $(image_name) .

run: build
	docker run --rm -it -p 9000:9000 $(image_name)

login:
	 aws ecr get-login-password --profile $(aws_profile) --region eu-west-2 | docker login --username AWS --password-stdin $(aws_account_no).dkr.ecr.eu-west-2.amazonaws.com

tag:
	docker tag $(image_name) $(tag)

push: build tag login
	docker push $(tag)

.PHONY: build run login tag
