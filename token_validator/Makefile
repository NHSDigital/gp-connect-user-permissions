docker-build:
	docker build -t token_validation_lambda:latest .

docker-run: docker-build
	docker run --rm -p 9000:8080 --name token_validation_lambda token_validation_lambda
