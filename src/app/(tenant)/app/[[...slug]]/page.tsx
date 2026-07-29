import { getTemplateSlug } from "@/shared/actions/navigation";
import { loadTemplatePage } from "@/platform/template-engine/loader";

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
  
  // Create synthetic params so template pages can access params.id seamlessly
  const syntheticParams = Promise.resolve({
    ...(slug ? { slug } : {}),
    ...(extractedId ? { id: extractedId } : {})
  });

  const TemplatePage = await loadTemplatePage(templateSlug, path);
  return <TemplatePage params={syntheticParams} searchParams={searchParams} />;
}
