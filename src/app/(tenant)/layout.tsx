import { getBusinessNavigation, getCurrentUser } from "@/shared/actions/navigation";
import { getTemplateSlug } from "@/shared/actions/navigation";
import { loadTemplateContract } from "@/platform/template-engine/loader";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = await getBusinessNavigation();
  const user = await getCurrentUser();
  const templateSlug = await getTemplateSlug();
  const contract = await loadTemplateContract(templateSlug);
  const Layout = contract.Layout;

  return (
    <Layout navigation={navigation} user={user}>
      {children}
    </Layout>
  );
}
