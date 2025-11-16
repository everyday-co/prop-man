#!/bin/bash

# Script to add rent roll fields using GraphQL mutations
# This is the fastest way to add fields programmatically in Twenty
#
# Usage: ./add-rent-roll-fields-graphql.sh
#
# Prerequisites:
# 1. Server must be running (yarn start)
# 2. You must be authenticated
# 3. Set WORKSPACE_ID and API_TOKEN environment variables

set -e

# Configuration
API_URL="${API_URL:-http://localhost:3000/graphql}"
WORKSPACE_ID="${WORKSPACE_ID:-}"
API_TOKEN="${API_TOKEN:-}"

if [ -z "$WORKSPACE_ID" ] || [ -z "$API_TOKEN" ]; then
  echo "❌ Error: WORKSPACE_ID and API_TOKEN environment variables must be set"
  echo ""
  echo "To get your API token:"
  echo "  1. Go to Settings → API & Webhooks → API Keys"
  echo "  2. Create a new API key"
  echo "  3. Copy the token"
  echo ""
  echo "Then run:"
  echo "  export WORKSPACE_ID='your-workspace-id'"
  echo "  export API_TOKEN='your-api-token'"
  echo "  ./add-rent-roll-fields-graphql.sh"
  exit 1
fi

echo "🚀 Adding Rent Roll fields via GraphQL..."
echo ""

# Helper function to execute GraphQL mutation
execute_mutation() {
  local query="$1"
  local description="$2"

  echo "➡️  $description"

  response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_TOKEN" \
    -d "$query")

  # Check for errors
  if echo "$response" | grep -q '"errors"'; then
    echo "❌ Error: $(echo "$response" | jq -r '.errors[0].message')"
    return 1
  else
    echo "✅ Success"
    return 0
  fi
}

# =============================================================================
# STEP 1: Add fields to Lease Charges
# =============================================================================

echo "📋 Adding fields to Lease Charges object..."
echo ""

# Field 1: tenant (Relation to Person)
execute_mutation '{
  "query": "mutation { createOneFieldMetadata(input: { field: { name: \"tenant\", label: \"Tenant\", description: \"Primary tenant for this charge\", type: RELATION, objectMetadataId: \"LEASE_CHARGES_OBJECT_ID\" } }) { id } }"
}' "Adding 'tenant' field (Relation to Person)"

# Field 2: chargeDate (Date)
execute_mutation '{
  "query": "mutation { createOneFieldMetadata(input: { field: { name: \"chargeDate\", label: \"Charge Date\", description: \"When the charge was created/scheduled\", type: DATE_TIME, objectMetadataId: \"LEASE_CHARGES_OBJECT_ID\" } }) { id } }"
}' "Adding 'chargeDate' field (Date)"

# Field 3: balanceRemaining (Currency)
execute_mutation '{
  "query": "mutation { createOneFieldMetadata(input: { field: { name: \"balanceRemaining\", label: \"Balance Remaining\", description: \"Amount still owed after payments\", type: CURRENCY, objectMetadataId: \"LEASE_CHARGES_OBJECT_ID\", defaultValue: { amountMicros: 0, currencyCode: \"USD\" } } }) { id } }"
}' "Adding 'balanceRemaining' field (Currency)"

# Field 4: memo (Long Text)
execute_mutation '{
  "query": "mutation { createOneFieldMetadata(input: { field: { name: \"memo\", label: \"Memo\", description: \"Internal notes\", type: TEXT, objectMetadataId: \"LEASE_CHARGES_OBJECT_ID\" } }) { id } }"
}' "Adding 'memo' field (Long Text)"

# Field 5: description (Long Text)
execute_mutation '{
  "query": "mutation { createOneFieldMetadata(input: { field: { name: \"description\", label: \"Description\", description: \"Public description\", type: TEXT, objectMetadataId: \"LEASE_CHARGES_OBJECT_ID\" } }) { id } }"
}' "Adding 'description' field (Long Text)"

echo ""

# =============================================================================
# STEP 2: Add fields to Payments
# =============================================================================

echo "📋 Adding fields to Payments object..."
echo ""

# Field 1: rentCharge (Relation to Lease Charge) - CRITICAL
execute_mutation '{
  "query": "mutation { createOneFieldMetadata(input: { field: { name: \"rentCharge\", label: \"Rent Charge\", description: \"The charge this payment applies to\", type: RELATION, objectMetadataId: \"PAYMENTS_OBJECT_ID\" } }) { id } }"
}' "Adding 'rentCharge' field (Relation to Lease Charge) ⚠️ CRITICAL"

# Field 2: referenceNumber (Short Text)
execute_mutation '{
  "query": "mutation { createOneFieldMetadata(input: { field: { name: \"referenceNumber\", label: \"Reference Number\", description: \"Check number, transaction ID, etc.\", type: TEXT, objectMetadataId: \"PAYMENTS_OBJECT_ID\" } }) { id } }"
}' "Adding 'referenceNumber' field (Short Text)"

# Field 3: memo (Long Text)
execute_mutation '{
  "query": "mutation { createOneFieldMetadata(input: { field: { name: \"memo\", label: \"Memo\", description: \"Internal notes\", type: TEXT, objectMetadataId: \"PAYMENTS_OBJECT_ID\" } }) { id } }"
}' "Adding 'memo' field (Long Text)"

echo ""

# =============================================================================
# STEP 3: Add field to Lease
# =============================================================================

echo "📋 Adding fields to Lease object..."
echo ""

# Field 1: rentDueDay (Number)
execute_mutation '{
  "query": "mutation { createOneFieldMetadata(input: { field: { name: \"rentDueDay\", label: \"Rent Due Day\", description: \"Day of month rent is due (1-31)\", type: NUMBER, objectMetadataId: \"LEASE_OBJECT_ID\", defaultValue: 1 } }) { id } }"
}' "Adding 'rentDueDay' field (Number)"

echo ""
echo "✨ All fields added successfully!"
echo ""
echo "📌 Next steps:"
echo "   1. Run: npx nx run twenty-server:command workspace:sync-metadata"
echo "   2. Restart the server to see the new fields"
echo "   3. Check Settings → Data Model → Objects to verify"
echo ""
