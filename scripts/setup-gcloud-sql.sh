#!/bin/bash
# Setup Google Cloud SQL for WaxFeed
# Run this after: brew install google-cloud-sdk && gcloud init

set -e

PROJECT_ID=$(gcloud config get-value project)
INSTANCE_NAME="waxfeed-db"
REGION="us-central1"
DB_NAME="waxfeed"
DB_USER="waxfeed"
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)

echo "========================================"
echo "Setting up Cloud SQL for WaxFeed"
echo "========================================"
echo "Project: $PROJECT_ID"
echo "Instance: $INSTANCE_NAME"
echo "Region: $REGION"
echo ""

# Enable required APIs
echo "Enabling Cloud SQL API..."
gcloud services enable sqladmin.googleapis.com

# Create Cloud SQL instance (db-f1-micro is cheapest, but we'll use db-g1-small for import speed)
echo "Creating Cloud SQL instance (this takes 5-10 minutes)..."
gcloud sql instances create $INSTANCE_NAME \
  --database-version=POSTGRES_15 \
  --tier=db-g1-small \
  --region=$REGION \
  --storage-size=20GB \
  --storage-type=SSD \
  --storage-auto-increase \
  --authorized-networks=0.0.0.0/0 \
  --root-password=$DB_PASSWORD

# Create database
echo "Creating database..."
gcloud sql databases create $DB_NAME --instance=$INSTANCE_NAME

# Create user
echo "Creating user..."
gcloud sql users create $DB_USER \
  --instance=$INSTANCE_NAME \
  --password=$DB_PASSWORD

# Get instance IP
INSTANCE_IP=$(gcloud sql instances describe $INSTANCE_NAME --format="value(ipAddresses[0].ipAddress)")

# Output connection string
echo ""
echo "========================================"
echo "SETUP COMPLETE!"
echo "========================================"
echo ""
echo "Add this to your .env file:"
echo ""
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@$INSTANCE_IP:5432/$DB_NAME\""
echo ""
echo "Instance IP: $INSTANCE_IP"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $DB_PASSWORD"
echo ""
echo "SAVE THESE CREDENTIALS SOMEWHERE SAFE!"
echo "========================================"
