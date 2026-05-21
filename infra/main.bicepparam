// ============================================================
// Tour Planner — Bicep Parameter File
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

