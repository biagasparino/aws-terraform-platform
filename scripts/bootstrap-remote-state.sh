#!/usr/bin/env bash
# Run ONCE before deploying any environment: creates the S3 bucket + DynamoDB
# table used as Terraform's remote state backend.
set -euo pipefail

cd "$(dirname "$0")/../terraform/bootstrap"
terraform init
terraform apply
