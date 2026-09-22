output "eks_cluster_name" { value = module.eks.cluster_name }
output "rds_endpoint"     { value = module.rds.endpoint }
output "alb_dns_name"     { value = module.alb.dns_name }
output "s3_bucket"        { value = module.s3.bucket_name }
output "api_fqdn"         { value = module.route53.fqdn }
