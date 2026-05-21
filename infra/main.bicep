// ============================================================
// Tour Planner — Azure Infrastructure (Bicep IaC)
// ============================================================
// Provisions: ACR, Key Vault, PostgreSQL, Container Apps Environment,
//             Backend Container App, Frontend Container App.
//
//
// Deploy with:
//   az deployment group create \
//     --resource-group tour-planner-rg \
//     --template-file infra/main.bicep \
//     --parameters @infra/main.bicepparam \
//     --parameters dbPassword=<secret> jwtSecret=<secret> orsApiKey=<secret>
// ============================================================

targetScope = 'resourceGroup'

// ── Parameters ───────────────────────────────────────────────

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Short environment tag used in resource names')
@allowed(['prod', 'dev', 'test'])
param environment string = 'prod'

@description('Container Registry name (must be globally unique)')
param acrName string = 'tourplannercr'

@description('Key Vault name (must be globally unique)')
param keyVaultName string = 'tour-planner-kv'

@description('PostgreSQL server name (must be globally unique)')
param dbServerName string = 'tour-planner-db'

@description('PostgreSQL admin username')
param dbAdminUser string = 'postgres_admin'

@description('PostgreSQL application username stored in Key Vault')
param dbAppUser string = 'tourplanner_app'

@description('PostgreSQL admin password — never stored in Git')
@secure()
param dbAdminPassword string

@description('PostgreSQL application password — never stored in Git')
@secure()
param dbPassword string

@description('JWT signing secret (min 32 chars) — never stored in Git')
@secure()
param jwtSecret string

@description('OpenRouteService API key — never stored in Git')
@secure()
param orsApiKey string

@description('Object ID of the Azure DevOps Service Principal (for Key Vault access)')
param devOpsSpObjectId string

// ── Variables ─────────────────────────────────────────────────

var containerEnvName = 'tour-planner-env'
var backendAppName   = 'tour-planner-backend'
var frontendAppName  = 'tour-planner-frontend'
var dbName           = 'tourplanner'
var tags = {
  project:     'tour-planner'
  environment: environment
  managedBy:   'bicep'
}

// ── Azure Container Registry ──────────────────────────────────

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
  }
}

// ── Azure Key Vault ───────────────────────────────────────────

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name:   'standard'
    }
    tenantId:                        subscription().tenantId
    enableRbacAuthorization:         true
    enableSoftDelete:                true
    softDeleteRetentionInDays:       7
    enabledForTemplateDeployment:    true
  }
}

// ── Key Vault Secrets ─────────────────────────────────────────

resource secretDbUser 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name:   'DB-USER'
  properties: { value: dbAppUser }
}

resource secretDbPassword 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name:   'DB-PASSWORD'
  properties: { value: dbPassword }
}

resource secretJwt 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name:   'JWT-SECRET'
  properties: { value: jwtSecret }
}

resource secretOrs 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name:   'ORS-API-KEY'
  properties: { value: orsApiKey }
}

// ── RBAC: DevOps SP → Key Vault Secrets User ──────────────────

var kvSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'

resource kvRoleDevOpsSp 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name:  guid(keyVault.id, devOpsSpObjectId, kvSecretsUserRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', kvSecretsUserRoleId)
    principalId:      devOpsSpObjectId
    principalType:    'ServicePrincipal'
  }
}

// ── PostgreSQL Flexible Server ────────────────────────────────

resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name:     dbServerName
  location: location
  tags:     tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version:                     '16'
    administratorLogin:          dbAdminUser
    administratorLoginPassword:  dbAdminPassword
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup:  'Disabled'
    }
    network: {
      publicNetworkAccess: 'Disabled'
    }
  }
}

resource postgresDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-06-01-preview' = {
  parent: postgres
  name:   dbName
}

// ── Container Apps Environment ────────────────────────────────

resource containerEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name:     containerEnvName
  location: location
  tags:     tags
  properties: {}
}

// ── Backend Container App ─────────────────────────────────────

resource backendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name:     backendAppName
  location: location
  tags:     tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    environmentId: containerEnv.id
    configuration: {
      ingress: {
        external:   true
        targetPort: 8081
      }
      registries: [
        {
          server:   acr.properties.loginServer
          identity: 'system'
        }
      ]
    }
    template: {
      containers: [
        {
          name:  'backend'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu:    '0.5'
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

// ── RBAC: Backend Identity → AcrPull ─────────────────────────

var acrPullRoleId = '7f951dda-4ed3-4680-a7ca-43fe172d538d'

resource acrPullBackend 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name:  guid(acr.id, backendApp.id, acrPullRoleId)
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
    principalId:      backendApp.identity.principalId
    principalType:    'ServicePrincipal'
  }
}

// ── Frontend Container App ────────────────────────────────────

resource frontendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name:     frontendAppName
  location: location
  tags:     tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    environmentId: containerEnv.id
    configuration: {
      ingress: {
        external:   true
        targetPort: 80
      }
      registries: [
        {
          server:   acr.properties.loginServer
          identity: 'system'
        }
      ]
    }
    template: {
      containers: [
        {
          name:  'frontend'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu:    '0.25'
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 2
      }
    }
  }
}

resource acrPullFrontend 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name:  guid(acr.id, frontendApp.id, acrPullRoleId)
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
    principalId:      frontendApp.identity.principalId
    principalType:    'ServicePrincipal'
  }
}

// ── Outputs ───────────────────────────────────────────────────

output acrLoginServer    string = acr.properties.loginServer
output keyVaultUri       string = keyVault.properties.vaultUri
output backendFqdn       string = backendApp.properties.configuration.ingress.fqdn
output frontendFqdn      string = frontendApp.properties.configuration.ingress.fqdn
output backendIdentityId string = backendApp.identity.principalId
