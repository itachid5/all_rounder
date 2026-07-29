import { getTemplateSlug } from "@/shared/actions/navigation";
import { loadTemplatePage } from "@/platform/template-engine/loader";

export default async function DynamicAppRoute({ params }: { params: Promise<{ slug?: string[] }> }) {
  const templateSlug = await getTemplateSlug();
  const { slug } = await params;
  const path = slug ? slug.join('/') : 'dashboard';
  
  const TemplatePage = await loadTemplatePage(templateSlug, path);
  return <TemplatePage />;
}
