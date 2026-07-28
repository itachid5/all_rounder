import { getTemplateSlug } from "@/shared/actions/navigation";
import { notFound } from "next/navigation";

export default async function DynamicAppRoute({ params }: { params: { slug?: string[] } }) {
  const templateSlug = await getTemplateSlug();
  
  const path = params.slug ? params.slug.join('/') : 'dashboard';
  
  try {
    const TemplatePage = (await import(`@/templates/${templateSlug}/app/${path}/page`)).default;
    return <TemplatePage />;
  } catch (error) {
    console.error(`Route not found in template ${templateSlug}: ${path}`);
    notFound();
  }
}
