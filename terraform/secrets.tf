# ================================
# LayerX Forum - Secrets Manager & Parameter Store
# ================================

resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}/${var.environment}/db-credentials"
  description             = "Database credentials"
  recovery_window_in_days = 0
  tags                    = { Name = "${var.project_name}-${var.environment}-db-credentials" }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    dbname   = var.db_name
  })
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.project_name}/${var.environment}/jwt-secret"
  description             = "JWT secret"
  recovery_window_in_days = 0
  tags                    = { Name = "${var.project_name}-${var.environment}-jwt-secret" }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret.result
}

# Parameter Store
resource "aws_ssm_parameter" "node_env" {
  name  = "/${var.project_name}/${var.environment}/NODE_ENV"
  type  = "String"
  value = var.environment == "prod" ? "production" : "development"
  tags  = { Name = "${var.project_name}-${var.environment}-node-env" }
}

resource "aws_ssm_parameter" "db_host" {
  name  = "/${var.project_name}/${var.environment}/DB_HOST"
  type  = "String"
  value = aws_db_instance.main.address
  tags  = { Name = "${var.project_name}-${var.environment}-db-host" }
}

resource "aws_ssm_parameter" "db_port" {
  name  = "/${var.project_name}/${var.environment}/DB_PORT"
  type  = "String"
  value = tostring(aws_db_instance.main.port)
  tags  = { Name = "${var.project_name}-${var.environment}-db-port" }
}

resource "aws_ssm_parameter" "db_name" {
  name  = "/${var.project_name}/${var.environment}/DB_NAME"
  type  = "String"
  value = var.db_name
  tags  = { Name = "${var.project_name}-${var.environment}-db-name" }
}

resource "aws_ssm_parameter" "db_username" {
  name  = "/${var.project_name}/${var.environment}/DB_USERNAME"
  type  = "String"
  value = var.db_username
  tags  = { Name = "${var.project_name}-${var.environment}-db-username" }
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.project_name}/${var.environment}/DB_PASSWORD"
  type  = "SecureString"
  value = random_password.db_password.result
  tags  = { Name = "${var.project_name}-${var.environment}-db-password" }
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.project_name}/${var.environment}/JWT_SECRET"
  type  = "SecureString"
  value = random_password.jwt_secret.result
  tags  = { Name = "${var.project_name}-${var.environment}-jwt-secret" }
}

resource "aws_ssm_parameter" "app_url" {
  name       = "/${var.project_name}/${var.environment}/APP_URL"
  type       = "String"
  value      = "http://${aws_elastic_beanstalk_environment.main.cname}"
  tags       = { Name = "${var.project_name}-${var.environment}-app-url" }
  depends_on = [aws_elastic_beanstalk_environment.main]
}

resource "aws_ssm_parameter" "db_ssl" {
  name  = "/${var.project_name}/${var.environment}/DB_SSL"
  type  = "String"
  value = "true"
  tags  = { Name = "${var.project_name}-${var.environment}-db-ssl" }
}
