# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-09-21
### Added
- Initial Terraform modules: `vpc`, `iam`, `eks`, `rds`, `s3`, `alb`, `security-groups`, `route53`.
- Three isolated environments: `dev`, `staging`, `prod`, each with its own remote state and tfvars.
- Remote state backend (S3 + DynamoDB locking) via `terraform/bootstrap`.
- GitHub Actions pipeline: `fmt` → `validate` → `plan` (PR comment) → manual approval → `apply`.
- Sample microservices `api-1` and `api-2` (Node.js/Express) connecting to PostgreSQL and Redis.
- Kubernetes manifests (base + Kustomize overlays per environment) for EKS deployment behind an ALB Ingress.
- Architecture and pipeline diagrams, English and Portuguese documentation.
