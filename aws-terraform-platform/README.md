# AWS + Terraform Platform

[![Terraform CI/CD](https://img.shields.io/badge/terraform-plan%20%E2%86%92%20review%20%E2%86%92%20apply-7c3aed)](.github/workflows/terraform.yml)
[![App CI](https://img.shields.io/badge/app%20ci-lint%20%2B%20test-2563eb)](.github/workflows/app-ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Terraform](https://img.shields.io/badge/terraform-%3E%3D1.7-844FBA?logo=terraform&logoColor=white)](terraform)
[![AWS](https://img.shields.io/badge/AWS-EKS%20%7C%20RDS%20%7C%20S3-FF9900?logo=amazonaws&logoColor=white)](terraform)

🇧🇷 **Leia isto em português: [README.pt-br.md](README.pt-br.md)**

A production-shaped, fully modular AWS infrastructure — built entirely with Terraform — that provisions a VPC, an EKS cluster, PostgreSQL, Redis-compatible caching, and a load-balanced ingress for two sample microservices. Infrastructure changes ship through a real GitOps pipeline: **plan → review → apply**, never a manual `terraform apply` on someone's laptop.

## What this project demonstrates

This repository exists to prove hands-on, real-world skill with the stack that shows up in almost every infrastructure/DevOps job posting today: **Terraform modules, remote state, workspaces/environments, and AWS networking & IAM** — not toy examples, but a layout you could hand to a team tomorrow.

## Architecture

![Architecture diagram](docs/images/architecture-diagram.svg)

```
                    Internet
                       |
                 ALB / Ingress
                       |
                 Kubernetes (EKS)
                  /        \
              API-1       API-2
                 \          /
                  PostgreSQL
                       |
                    Redis
```

| Layer | AWS service | Terraform module |
|---|---|---|
| Networking | VPC, public/private subnets, NAT, IGW | `terraform/modules/vpc` |
| Identity | IAM roles & policies (least privilege) | `terraform/modules/iam` |
| Compute | EKS cluster + managed node group | `terraform/modules/eks` |
| Database | RDS PostgreSQL (Multi-AZ in prod) | `terraform/modules/rds` |
| Object storage | S3 (encrypted, versioned, private) | `terraform/modules/s3` |
| Load balancing | Application Load Balancer | `terraform/modules/alb` |
| Network security | Security Groups (least-privilege ingress) | `terraform/modules/security-groups` |
| DNS | Route 53 alias record | `terraform/modules/route53` |
| State | S3 backend + DynamoDB locking | `terraform/bootstrap` |

## The pipeline (the actual differentiator)

Nobody hand-runs `terraform apply` here. Every infra change goes through GitHub Actions:

![CI/CD pipeline](docs/images/cicd-pipeline.svg)

1. **Git push** to a feature branch touching `terraform/**`.
2. **Terraform Plan** runs automatically for `dev`, `staging`, and `prod`, and is posted as a comment on the Pull Request.
3. **Code review** — a human (CODEOWNERS) reviews the plan output before merging.
4. **Terraform Apply** runs on merge to `main`, gated per-environment by a [GitHub Environment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) manual-approval rule (critical for `prod`).
5. **Infra updated** — state stays locked and versioned in S3 + DynamoDB the whole time.

Sample plan output posted by CI:

![Terraform plan output](docs/images/terraform-plan-output.svg)

## Repository structure

```
aws-terraform-platform/
├── terraform/
│   ├── bootstrap/            # one-time: creates the S3 + DynamoDB remote state backend
│   ├── modules/               # vpc, iam, eks, rds, s3, alb, security-groups, route53
│   └── environments/
│       ├── dev/
│       ├── staging/
│       └── prod/              # each with its own backend.tf, variables.tf, tfvars
├── app/
│   ├── api-1/                 # sample Node.js/Express service (items)
│   └── api-2/                 # sample Node.js/Express service (orders)
├── kubernetes/
│   ├── base/                  # Deployment, Service, Ingress, ConfigMap, HPA
│   └── overlays/{dev,staging,prod}/  # Kustomize per-environment overrides
├── .github/workflows/          # terraform.yml (infra) + app-ci.yml (lint/test)
├── docker-compose.yml          # run api-1 + api-2 + postgres + redis locally
├── docs/images/                 # architecture & pipeline diagrams
└── scripts/                     # bootstrap-remote-state.sh, plan.sh, apply.sh
```

## Technologies used

- **Terraform** ≥ 1.7 (modules, remote state, per-environment configuration)
- **AWS**: VPC, EKS, RDS (PostgreSQL), ElastiCache (Redis), S3, ALB, IAM, Security Groups, Route 53, DynamoDB
- **Kubernetes** (via EKS) with Kustomize overlays
- **Node.js 20 / Express** for the sample services
- **GitHub Actions** for CI/CD
- **Docker / Docker Compose** for local development

## Getting started

### Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/downloads) ≥ 1.7
- An AWS account + credentials configured (`aws configure` or SSO)
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (for local app development)
- `kubectl` and `kustomize` (for deploying to EKS)

### 1. Run the sample services locally (no AWS needed)

```bash
git clone https://github.com/your-username/aws-terraform-platform.git
cd aws-terraform-platform

cp app/api-1/.env.example app/api-1/.env
cp app/api-2/.env.example app/api-2/.env

docker compose up --build
```

- API-1: http://localhost:3001/items
- API-2: http://localhost:3002/orders
- Health checks: `GET /health` on both services

### 2. Provision the AWS infrastructure

```bash
# One-time only: creates the S3 bucket + DynamoDB table for remote state
./scripts/bootstrap-remote-state.sh

# Copy and fill in the variables for the environment you want
cp terraform/environments/dev/terraform.tfvars.example terraform/environments/dev/terraform.tfvars

# Review, then apply
./scripts/plan.sh dev
./scripts/apply.sh dev
```

Repeat with `staging` / `prod` as needed. In practice, `plan` and `apply` run through the GitHub Actions pipeline described above, not from a local machine.

### 3. Deploy the services to EKS

```bash
aws eks update-kubeconfig --name platform-dev-eks --region us-east-1
kubectl apply -k kubernetes/overlays/dev
```

## Environment variables

Each service documents its variables in its own `.env.example` (`app/api-1/.env.example`, `app/api-2/.env.example`):

| Variable | Description |
|---|---|
| `PORT` | Port the service listens on |
| `SERVICE_NAME` | Used in logs and the `/health` response |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL/RDS connection |
| `REDIS_HOST`, `REDIS_PORT` | Redis/ElastiCache connection |

Terraform environment variables live in `terraform/environments/<env>/terraform.tfvars.example` — copy them to `terraform.tfvars` (git-ignored) and fill in real values. **Never commit `terraform.tfvars` or `.env`.**

## Testing & code quality

```bash
cd app/api-1 && npm install && npm run lint && npm test
cd app/api-2 && npm install && npm run lint && npm test
```

- `terraform fmt -check` and `terraform validate` run on every PR (see `.github/workflows/terraform.yml`).
- ESLint runs on every PR that touches `app/**` (see `.github/workflows/app-ci.yml`).
- No secrets, tokens, or credentials are committed — everything sensitive lives in `.tfvars`/`.env` files that are git-ignored, with `.example` templates checked in instead.

## Contributing

1. Fork the repo and create a branch from `main`.
2. Make your change; run `terraform fmt`/`terraform validate` and the app tests locally.
3. Open a Pull Request — CI will post the Terraform plan as a comment.
4. A code owner reviews the plan and the diff before merge.
5. On merge, `apply` runs per environment (with manual approval for `prod`).

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

Distributed under the [MIT License](LICENSE).
