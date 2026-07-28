import { Layers, CheckCircle } from "lucide-react";
import { db } from "@/db";
import { templates } from "@/db/schema";

export default async function TemplatesPage() {
  const allTemplates = await db.select().from(templates).all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">Installed business templates</p>
      </div>

      {allTemplates.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-full py-12 rounded-xl border border-dashed border-border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center">
            <Layers className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
            <p className="text-lg font-medium">No templates installed</p>
            <p className="text-sm text-muted-foreground">Install templates to provide modules to businesses.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allTemplates.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.slug}</p>
                  </div>
                </div>
                {t.status === 'ACTIVE' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <CheckCircle className="h-3 w-3" /> Active
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <div className="text-xs text-muted-foreground mt-auto">
                Version: {t.version}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
