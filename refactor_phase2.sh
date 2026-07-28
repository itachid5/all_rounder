#!/bin/bash
set -e

mkdir -p src/templates/egg-tasta/app
mkdir -p src/templates/egg-tasta/components
mkdir -p src/templates/egg-tasta/actions
mkdir -p src/templates/egg-tasta/repositories

# Move business routes
mv src/app/\(business\)/app/* src/templates/egg-tasta/app/ 2>/dev/null || true

# Move business components
mv src/components/business/* src/templates/egg-tasta/components/ 2>/dev/null || true
rm -rf src/components/business

# Move actions
mv src/app/actions/* src/templates/egg-tasta/actions/ 2>/dev/null || true
rm -rf src/app/actions

# Move repositories
mv src/lib/repositories/* src/templates/egg-tasta/repositories/ 2>/dev/null || true
rm -rf src/lib/repositories

# Update imports globally inside src/templates/egg-tasta
find src/templates/egg-tasta -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  -e 's|@/components/business|@/templates/egg-tasta/components|g' \
  -e 's|@/app/actions|@/templates/egg-tasta/actions|g' \
  -e 's|@/lib/repositories|@/templates/egg-tasta/repositories|g' \
  -e 's|@/app/(business)/app|@/templates/egg-tasta/app|g' {} +

# Since we moved the pages, we need to create the catch-all router in src/app/(business)/app
mkdir -p src/app/\(business\)/app/\[\[...slug\]\]
cat << 'ROUTER' > src/app/\(business\)/app/\[\[...slug\]\]/page.tsx
import { getTenantInfo } from "@/shared/utils/auth";
import { notFound } from "next/navigation";

export default async function DynamicAppRoute({ params }: { params: { slug?: string[] } }) {
  const { templateSlug } = await getTenantInfo();
  
  const path = params.slug ? params.slug.join('/') : 'dashboard';
  
  try {
    // Determine if it's an index route (needs /page) or if we just import the page
    // Next.js components are default exports
    const TemplatePage = (await import(`@/templates/${templateSlug}/app/${path}/page`)).default;
    return <TemplatePage />;
  } catch (error) {
    console.error(`Route not found in template ${templateSlug}: ${path}`);
    notFound();
  }
}
ROUTER

echo "Phase 2 move complete."
