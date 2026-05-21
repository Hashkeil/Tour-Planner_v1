#!/usr/bin/env bash
# ============================================================
# Tour Planner — Azure Infrastructure Setup Script
# ============================================================
set -euo pipefail

RESOURCE_GROUP="tour-planner-rg"
LOCATION="westeurope"
ACR_NAME="tourplannercr"
KV_NAME="tour-planner-kv"
DB_SERVER="tour-planner-db"
CONTAINER_ENV="tour-planner-env"
BACKEND_APP="tour-planner-backend"
FRONTEND_APP="tour-planner-frontend"

echo "=== Creating Resource Group ==="
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

echo "=== Creating Container Registry ==="
az acr create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$ACR_NAME" \
  --sku Basic \
  --admin-enabled false

echo "=== Creating Key Vault ==="
az keyvault create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$KV_NAME" \
  --location "$LOCATION" \
  --enable-rbac-authorization true

echo "=== Storing secrets in Key Vault ==="
az keyvault secret set --vault-name "$KV_NAME" --name "DB-USER"     --value "tourplanner_app"
az keyvault secret set --vault-name "$KV_NAME" --name "DB-PASSWORD" --value "$DB_PASSWORD"
az keyvault secret set --vault-name "$KV_NAME" --name "JWT-SECRET"  --value "$JWT_SECRET"
az keyvault secret set --vault-name "$KV_NAME" --name "ORS-API-KEY" --value "$ORS_API_KEY"

echo "=== Creating PostgreSQL Flexible Server ==="
az postgres flexible-server create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DB_SERVER" \
  --location "$LOCATION" \
  --admin-user "postgres_admin" \
  --admin-password "$DB_ADMIN_PASSWORD" \
  --sku-name "Standard_B1ms" \
  --tier "Burstable" \
  --version 16 \
  --storage-size 32 \
  --public-access None

az postgres flexible-server db create \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "$DB_SERVER" \
  --database-name "tourplanner"

echo "=== Creating Container Apps Environment ==="
az containerapp env create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$CONTAINER_ENV" \
  --location "$LOCATION"

echo "=== Creating Backend Container App ==="
az containerapp create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$BACKEND_APP" \
  --environment "$CONTAINER_ENV" \
  --image "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest" \
  --target-port 8081 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --system-assigned

echo "=== Creating Frontend Container App ==="
az containerapp create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$FRONTEND_APP" \
  --environment "$CONTAINER_ENV" \
  --image "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest" \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 2 \
  --system-assigned

echo "=== Granting AcrPull to Container Apps ==="
ACR_ID=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query id -o tsv)
BACKEND_IDENTITY=$(az containerapp show --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP" --query identity.principalId -o tsv)
FRONTEND_IDENTITY=$(az containerapp show --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP" --query identity.principalId -o tsv)

az role assignment create --assignee "$BACKEND_IDENTITY"  --role AcrPull --scope "$ACR_ID"
az role assignment create --assignee "$FRONTEND_IDENTITY" --role AcrPull --scope "$ACR_ID"

echo "=== Setup complete ==="
az containerapp show --name "$BACKEND_APP"  --resource-group "$RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv
az containerapp show --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv
