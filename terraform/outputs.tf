# ================================
# LayerX Forum - Terraform Outputs
# ================================

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
}

output "eb_application_name" {
  description = "Elastic Beanstalk application name"
  value       = aws_elastic_beanstalk_application.main.name
}

output "eb_environment_name" {
  description = "Elastic Beanstalk environment name"
  value       = aws_elastic_beanstalk_environment.main.name
}

output "eb_environment_url" {
  description = "Elastic Beanstalk environment URL"
  value       = "http://${aws_elastic_beanstalk_environment.main.cname}"
}

output "ecr_server_repository_url" {
  description = "ECR server repository URL"
  value       = aws_ecr_repository.server.repository_url
}

output "ecr_client_repository_url" {
  description = "ECR client repository URL"
  value       = aws_ecr_repository.client.repository_url
}

output "eb_bucket_name" {
  description = "S3 bucket for EB deployments"
  value       = aws_s3_bucket.eb_bucket.id
}

output "connection_info" {
  description = "Connection information summary"
  value       = <<-EOT
    
    =============================================
    🚀 LayerX Forum Infrastructure Deployed!
    =============================================
    
    📍 Application URL: http://${aws_elastic_beanstalk_environment.main.cname}
    
    🗄️ Database:
       Host: ${aws_db_instance.main.address}
       Port: ${aws_db_instance.main.port}
       Name: ${aws_db_instance.main.db_name}
       
    🐳 ECR Repositories:
       Server: ${aws_ecr_repository.server.repository_url}
       Client: ${aws_ecr_repository.client.repository_url}
       
    📦 S3 Bucket: ${aws_s3_bucket.eb_bucket.id}
    
    =============================================
  EOT
}
