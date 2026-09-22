#!/usr/bin/env bash
# Usage: ./scripts/apply.sh dev|staging|prod
# Prefer letting CI run this. Use locally only for a first bootstrap deploy.
set -euo pipefail

ENV="${1:?Usage: apply.sh <dev|staging|prod>}"
cd "$(dirname "$0")/../terraform/environments/$ENV"

terraform init -input=false
terraform apply -var-file="terraform.tfvars"
