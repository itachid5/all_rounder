import { getTemplateSlug } from "@/shared/actions/navigation";
import { loadTemplatePage } from "@/platform/template-engine/loader";

export default async function DynamicAppRoute({ params }: { params: { slug?: string[] } }) {
  const templateSlug = await getTemplateSlug();
  const path = params.slug ? params.slug.join('/') : 'dashboard';
  
  const TemplatePage = await loadTemplatePage(templateSlug, path);
  return <TemplatePage />;
}
