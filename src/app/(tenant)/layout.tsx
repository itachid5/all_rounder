import { getBusinessNavigation, getCurrentUser } from "@/shared/actions/navigation";
import { getTemplateSlug } from "@/shared/actions/navigation";
import { getTenantBrandingAction } from "@/shared/actions/branding";
import { getRegionalSettingsAction } from "@/shared/actions/regional";
import { getCurrentUserPermissionsAction } from "@/shared/actions/rbac";
import { loadTemplateContract } from "@/platform/template-engine/loader";

export const dynamic = 'force-dynamic';

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    navigation,
    user,
    templateSlug,
    brandingRes,
    regionalRes,
    permsRes
  ] = await Promise.all([
    getBusinessNavigation(),
    getCurrentUser(),
    getTemplateSlug(),
    getTenantBrandingAction(),
    getRegionalSettingsAction(),
    getCurrentUserPermissionsAction()
  ]);

  const contract = await loadTemplateContract(templateSlug);
  const branding = brandingRes.success ? brandingRes.data : {};
  const regional = regionalRes.success ? regionalRes.data : { currency: 'BDT', currencySymbol: '৳', timezone: 'Asia/Dhaka', language: 'en' };
  const userPermissions = permsRes.permissions || [];
  const isOwner = permsRes.isOwner || false;

  const Layout = contract.Layout;

  return (
    <Layout 
      navigation={navigation} 
      user={user} 
      branding={branding}
      regional={regional}
      userPermissions={userPermissions}
      isOwner={isOwner}
    >
      {children}
    </Layout>
  );
}
