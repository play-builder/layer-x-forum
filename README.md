# 🚀 LayerX Forum

커뮤니티 포럼 플랫폼 - Next.js + Express + TypeORM + PostgreSQL




## 🚀 빠른 시작

### 로컬 개발

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/layerx-forum.git
cd layerx-forum

# Docker로 전체 실행
docker-compose up -d

# 또는 개별 실행
# 1. 데이터베이스
docker-compose up -d db

# 2. 서버 (새 터미널)
cd server
npm install
npm run dev

# 3. 클라이언트 (새 터미널)
cd client
npm install
npm run dev
```

### URL
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 📦 AWS 배포

### 1. 사전 요구사항

```bash
# AWS CLI 설치 및 설정
aws configure

# Terraform 설치
brew install terraform  # macOS
```

### 2. 인프라 생성

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 3. GitHub Secrets 설정

Repository → Settings → Secrets and variables → Actions:

| Secret | 설명 |
|--------|------|
| `AWS_ACCESS_KEY_ID` | AWS 액세스 키 |
| `AWS_SECRET_ACCESS_KEY` | AWS 시크릿 키 |
| `AWS_ACCOUNT_ID` | AWS 계정 ID |

### 4. 배포

```bash
git push origin main
# GitHub Actions가 자동으로 배포합니다
```


## 📝 환경변수

### 서버 (.env)
```env
NODE_ENV=development
PORT=4000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=postgres
DB_SSL=false

JWT_SECRET=your_jwt_secret
APP_URL=http://localhost:4000
ORIGIN=http://localhost:3000
CLIENT_URL=http://localhost:3000

# 이메일 (선택)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=pass
EMAIL_FROM=noreply@layerx-forum.com
```

### 클라이언트 (.env)
```env
NEXT_PUBLIC_SERVER_BASE_URL=http://localhost:4000
```

## 🛠 기술 스택

| 레이어 | 기술 |
|--------|------|
| **Frontend** | Next.js 12, React 18, TypeScript, Tailwind CSS, SWR |
| **Backend** | Express.js, TypeORM, TypeScript, JWT, Nodemailer |
| **Database** | PostgreSQL 15 (AWS RDS) |
| **Infrastructure** | AWS (Elastic Beanstalk, RDS, ECR, VPC) |
| **IaC** | Terraform |
| **CI/CD** | GitHub Actions |
| **Secrets** | AWS Secrets Manager, Parameter Store |











































































































