import { getTemplateSlug } from "@/shared/actions/navigation";
import { loadTemplatePage } from "@/platform/template-engine/loader";
import { getCurrentUserPermissionsAction } from "@/shared/actions/rbac";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function DynamicAppRoute({ 
  params,
  searchParams
}: { 
  params: Promise<{ slug?: string[] }>,
  searchParams: Promise<any>
}) {
  const templateSlug = await getTemplateSlug();
  const { slug } = await params;
  
  // Normalize UUIDs to [id] for template routing
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let extractedId: string | undefined = undefined;
  
  const path = slug 
    ? slug.map(segment => {
        if (uuidRegex.test(segment)) {
          extractedId = segment;
          return '[id]';
        }
        return segment;
      }).join('/') 
    : 'dashboard';

  // Check Page Permission Guard
  const permsRes = await getCurrentUserPermissionsAction();
  const userPerms = permsRes.permissions || [];
  const isOwner = permsRes.isOwner || false;

  const routePermMap: Record<string, string> = {
    'dashboard': 'view:dashboard',
    'products': 'view:products',
    'suppliers': 'view:suppliers',
    'supplier-payments': 'view:supplier_payments',
    'customers': 'view:customers',
    'customer-collection': 'view:customer_collections',
    'purchases': 'view:purchases',
    'sales': 'view:sales',
    'sales-return': 'view:sales_returns',
    'inventory': 'view:inventory',
    'expenses': 'view:expenses',
    'cashbook': 'view:cashbook',
    'ledger': 'view:reports',
    'reports': 'view:reports',
    'users': 'view:users',
    'data': 'view:data_management',
    'settings/branding': 'view:branding',
    'settings': 'view:settings',
    'profile': 'view:profile',
  };

  const firstSegment = path.split('/')[0];
  const requiredPerm = routePermMap[path] || routePermMap[firstSegment];

  if (!isOwner && requiredPerm && !userPerms.includes(requiredPerm)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">403 - Access Denied</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          You do not have permission to view this page. Please contact your business administrator if you believe this is an error.
        </p>
        <Link 
          href="/app/dashboard" 
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  // Create synthetic params so template pages can access params.id seamlessly
  const syntheticParams = Promise.resolve({
    ...(slug ? { slug } : {}),
    ...(extractedId ? { id: extractedId } : {})
  });

  const TemplatePage = await loadTemplatePage(templateSlug, path);
  return <TemplatePage params={syntheticParams} searchParams={searchParams} />;
}
