// ============================================================
// Tour Planner — Bicep Parameter File
// ============================================================
// Safe non-secret parameters only.
// Secrets (dbAdminPassword, dbPassword, jwtSecret, orsApiKey)
// are passed on the command line — NEVER stored in this file.
// ============================================================

using './main.bicep'

param location       = 'spaincentral'
param environment    = 'prod'
param acrName        = 'tourplannercr'
param keyVaultName   = 'tour-planner-kv'
param dbServerName   = 'tour-planner-db'
param dbAdminUser    = 'postgres_admin'
param dbAppUser      = 'tourplanner_app'

// devOpsSpObjectId: get this from:
//   az ad sp show --display-name "tour-planner-devops-sp" --query id -o tsv
param devOpsSpObjectId = '<replace-with-sp-object-id>'

// ── Secrets are NOT here ──────────────────────────────────────
// Pass them at deploy time:
//   az deployment group create ... \
//     --parameters dbAdminPassword=$DB_ADMIN_PASSWORD \
//     --parameters dbPassword=$DB_PASSWORD \
//     --parameters jwtSecret=$JWT_SECRET \
//     --parameters orsApiKey=$ORS_API_KEY
