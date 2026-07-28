import { getBusinessNavigation, getCurrentUser } from "@/shared/actions/navigation";
import { getTemplateSlug } from "@/shared/actions/navigation";

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = await getBusinessNavigation();
  const user = await getCurrentUser();
  const templateSlug = await getTemplateSlug();

  // Dynamically load the correct layout based on the tenant's template
  const Layout = (await import(`@/templates/${templateSlug}/components`)).BusinessLayout;

  return (
    <Layout navigation={navigation} user={user}>
      {children}
    </Layout>
  );
}
