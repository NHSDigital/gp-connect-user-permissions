-include .env

APIGEE_ACCESS_TOKEN ?= $(shell export SSO_LOGIN_URL=https://login.apigee.com && eval get_token -u $(APIGEE_USERNAME))

PYTEST_CMD = APIGEE_ACCESS_TOKEN=$(APIGEE_ACCESS_TOKEN) poetry run pytest -s -v --color=yes --api-name=gp-connect-user-permissions --proxy-name=$(PROXY_NAME)


PYTEST_CMD = APIGEE_ACCESS_TOKEN=$(APIGEE_ACCESS_TOKEN) poetry run pytest -s -v --color=yes --api-name=gp-connect-user-permissions --proxy-name=$(PROXY_NAME)
PYTEST_CMD_INT = APIGEE_ENVIRONMENT=int APIGEE_ACCESS_TOKEN=$(APIGEE_ACCESS_TOKEN) DEFAULT_CLIENT_ID=$(DEFAULT_CLIENT_ID) DEFAULT_CLIENT_SECRET=$(DEFAULT_CLIENT_SECRET)\
	PROXY_NAME=gp-connect-user-permissions-int SERVICE_BASE_PATH=gp-connect/patient-facing/user-permissions\
	poetry run pytest -s -v --color=yes -m mock_provider_int --api-name=gp-connect-user-permissions --proxy-name=$PROXY_NAME --apigee-app-id=$(APIGEE_APP_ID) --apigee-organization=nhsd-prod

run:
	$(PYTEST_CMD)

run-int:
	$(PYTEST_CMD_INT)

#  run tests with certain marker e.g. make run-sandbox runs tests marked with sandbox
run-%:
	$(PYTEST_CMD) -m "$*"
