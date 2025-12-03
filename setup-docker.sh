#!/bin/bash

# RFP Management System - Docker Setup Script
# Sets up all services using Docker Compose

set -e

echo "🐳 RFP Management System - Docker Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found.${NC}"
    echo ""
    echo "Please install Docker Desktop:"
    echo "  macOS: https://www.docker.com/products/docker-desktop"
    echo "  Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is installed ($(docker --version))"

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found.${NC}"
    echo ""
    echo "Docker Compose is required. It's included with Docker Desktop."
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker Compose is available"
echo ""

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running.${NC}"
    echo ""
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker daemon is running"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true
echo ""

# Pull latest images
echo "📥 Pulling Docker images..."
docker-compose pull
echo ""

# Start services
echo "🚀 Starting services with Docker Compose..."
docker-compose up -d
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy (this may take 30-60 seconds)..."
sleep 5

MAX_WAIT=60
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    POSTGRES_HEALTH=$(docker inspect -f {{.State.Health.Status}} rfp_postgres 2>/dev/null || echo "starting")
    REDIS_HEALTH=$(docker inspect -f {{.State.Health.Status}} rfp_redis 2>/dev/null || echo "starting")
    RABBITMQ_HEALTH=$(docker inspect -f {{.State.Health.Status}} rfp_rabbitmq 2>/dev/null || echo "starting")

    if [ "$POSTGRES_HEALTH" = "healthy" ] && [ "$REDIS_HEALTH" = "healthy" ] && [ "$RABBITMQ_HEALTH" = "healthy" ]; then
        echo -e "${GREEN}✓${NC} All services are healthy!"
        break
    fi

    echo -n "."
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

echo ""
echo ""

# Check service status
echo "📊 Service Status"
echo "================="
docker-compose ps
echo ""

# Test connections
echo "🧪 Testing Connections"
echo "====================="

# Test PostgreSQL
if docker exec rfp_postgres psql -U rfpuser -d rfp_management -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL connection successful"
else
    echo -e "${RED}✗${NC} PostgreSQL connection failed"
fi

# Test Redis
if docker exec rfp_redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Redis connection successful"
else
    echo -e "${RED}✗${NC} Redis connection failed"
fi

# Test RabbitMQ
if docker exec rfp_rabbitmq rabbitmqctl status > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} RabbitMQ connection successful"
else
    echo -e "${RED}✗${NC} RabbitMQ connection failed"
fi

echo ""

# Display service information
echo "📝 Service Information"
echo "===================="
echo -e "${BLUE}PostgreSQL:${NC}"
echo "  Host: 127.0.0.1"
echo "  Port: 5432"
echo "  Database: rfp_management"
echo "  User: rfpuser"
echo "  Password: rfppassword"
echo ""
echo -e "${BLUE}Redis:${NC}"
echo "  Host: 127.0.0.1"
echo "  Port: 6379"
echo "  Password: (none)"
echo ""
echo -e "${BLUE}RabbitMQ:${NC}"
echo "  AMQP: amqp://localhost:5672"
echo "  Management UI: http://localhost:15672"
echo "  Username: guest"
echo "  Password: guest"
echo ""

# Display environment configuration
echo "⚙️  Environment Configuration"
echo "==========================="
echo "Your backend/.env should have:"
echo ""
cat << 'EOF'
# Database (PostgreSQL in Docker)
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=rfp_management
DB_USER=rfpuser
DB_PASSWORD=rfppassword

# Redis (in Docker)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# RabbitMQ (in Docker)
RABBITMQ_URL=amqp://localhost:5672
EOF
echo ""

# Display next steps
echo "📋 Next Steps"
echo "============"
echo "1. Verify your backend/.env has the correct configuration (shown above)"
echo "2. Install backend dependencies:"
echo "   ${BLUE}cd backend && npm install${NC}"
echo "3. Start the backend:"
echo "   ${BLUE}npm run dev${NC}"
echo ""

# Display useful commands
echo "🛠️  Useful Commands"
echo "=================="
echo "  ${BLUE}docker-compose ps${NC}              - Check service status"
echo "  ${BLUE}docker-compose logs -f${NC}         - View all logs"
echo "  ${BLUE}docker-compose logs -f redis${NC}   - View Redis logs"
echo "  ${BLUE}docker-compose down${NC}            - Stop all services"
echo "  ${BLUE}docker-compose restart redis${NC}   - Restart Redis"
echo ""

# Display management UIs
echo "🌐 Management Interfaces"
echo "======================="
echo "  RabbitMQ UI: ${BLUE}http://localhost:15672${NC} (guest/guest)"
echo ""

# Display documentation
echo "📚 Documentation"
echo "==============="
echo "  Complete guide: ${BLUE}DOCKER_SETUP.md${NC}"
echo "  Architecture: ${BLUE}UPGRADE_GUIDE.md${NC}"
echo "  Implementation: ${BLUE}IMPLEMENTATION_SUMMARY.md${NC}"
echo ""

echo -e "${GREEN}✅ Docker setup complete!${NC}"
echo ""
echo "To stop all services, run:"
echo "  ${BLUE}docker-compose down${NC}"
