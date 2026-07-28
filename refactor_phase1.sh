#!/bin/bash
set -e

# Move components
echo "Moving components..."
mv src/components/ui/* src/shared/components/ 2>/dev/null || true
mv src/components/shared/* src/shared/components/ 2>/dev/null || true
rm -rf src/components/ui src/components/shared

# Move utils
echo "Moving utils..."
mv src/lib/utils.ts src/shared/utils/ 2>/dev/null || true
mv src/lib/auth.ts src/shared/utils/ 2>/dev/null || true
mv src/lib/utils/* src/shared/utils/ 2>/dev/null || true
mv src/lib/errors src/shared/utils/ 2>/dev/null || true
mv src/lib/logger src/shared/utils/ 2>/dev/null || true
rm -rf src/lib/utils

# Update imports
echo "Updating imports globally..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  -e 's|@/components/ui|@/shared/components|g' \
  -e 's|@/components/shared|@/shared/components|g' \
  -e 's|@/lib/utils\.ts|@/shared/utils/utils\.ts|g' \
  -e 's|@/lib/utils|@/shared/utils|g' \
  -e 's|@/lib/auth|@/shared/utils/auth|g' \
  -e 's|@/lib/errors|@/shared/utils/errors|g' \
  -e 's|@/lib/logger|@/shared/utils/logger|g' {} +

echo "Phase 1 move complete."
