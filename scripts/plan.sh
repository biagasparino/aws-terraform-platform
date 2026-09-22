#!/usr/bin/env bash
# Usage: ./scripts/plan.sh dev|staging|prod
set -euo pipefail

ENV="${1:?Usage: plan.sh <dev|staging|prod>}"
cd "$(dirname "$0")/../terraform/environments/$ENV"

terraform init -input=false
terraform plan -var-file="terraform.tfvars"
