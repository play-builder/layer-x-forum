# ================================
# LayerX Forum - RDS PostgreSQL
# ================================

resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-${var.environment}-db-subnet"
  description = "Database subnet group"
  subnet_ids  = aws_subnet.private[*].id
  tags        = { Name = "${var.project_name}-${var.environment}-db-subnet-group" }
}

resource "aws_db_instance" "main" {
  identifier            = "${var.project_name}-${var.environment}-db"
  engine                = "postgres"
  engine_version        = "15.4"
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage * 2
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result
  port     = 5432

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az               = false

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  skip_final_snapshot      = true
  delete_automated_backups = true
  deletion_protection      = false

  performance_insights_enabled = false
  parameter_group_name         = aws_db_parameter_group.main.name

  tags = { Name = "${var.project_name}-${var.environment}-db" }
}

resource "aws_db_parameter_group" "main" {
  name   = "${var.project_name}-${var.environment}-pg15"
  family = "postgres15"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  tags = { Name = "${var.project_name}-${var.environment}-db-params" }
}
