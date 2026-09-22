locals {
  name = "platform-prod"
  tags = {
    Project     = "aws-terraform-platform"
    Environment = "prod"
    ManagedBy   = "terraform"
  }
}

module "vpc" {
  source                = "../../modules/vpc"
  name                  = local.name
  cidr_block            = "10.30.0.0/16"
  azs                   = ["us-east-1a", "us-east-1b", "us-east-1c"]
  public_subnet_cidrs   = ["10.30.0.0/24", "10.30.1.0/24", "10.30.2.0/24"]
  private_subnet_cidrs  = ["10.30.10.0/24", "10.30.11.0/24", "10.30.12.0/24"]
  enable_nat_gateway    = true
  tags                  = local.tags
}

module "iam" {
  source = "../../modules/iam"
  name   = local.name
  tags   = local.tags
}

module "security_groups" {
  source = "../../modules/security-groups"
  name   = local.name
  vpc_id = module.vpc.vpc_id
  tags   = local.tags
}

module "eks" {
  source              = "../../modules/eks"
  name                = local.name
  cluster_role_arn    = module.iam.eks_cluster_role_arn
  node_role_arn       = module.iam.eks_node_role_arn
  private_subnet_ids  = module.vpc.private_subnet_ids
  public_subnet_ids   = module.vpc.public_subnet_ids
  node_instance_types = ["t3.large"]
  desired_size        = 3
  min_size            = 3
  max_size            = 8
  tags                = local.tags
}

module "rds" {
  source                  = "../../modules/rds"
  name                    = local.name
  vpc_id                  = module.vpc.vpc_id
  private_subnet_ids      = module.vpc.private_subnet_ids
  security_group_id       = module.security_groups.rds_sg_id
  instance_class          = "db.r6g.large"
  multi_az                = true
  backup_retention_period = 14
  master_username         = var.db_master_username
  master_password         = var.db_master_password
  tags                    = local.tags
}

module "s3" {
  source = "../../modules/s3"
  name   = local.name
  tags   = local.tags
}

module "alb" {
  source            = "../../modules/alb"
  name              = local.name
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  security_group_id = module.security_groups.alb_sg_id
  tags              = local.tags
}

module "route53" {
  source       = "../../modules/route53"
  domain_name  = var.domain_name
  subdomain    = "api"
  alb_dns_name = module.alb.dns_name
  alb_zone_id  = module.alb.zone_id
}
