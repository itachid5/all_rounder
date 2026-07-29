const fs = require('fs');

const files = [
  'src/templates/egg-tasta/app/supplier-payments/report/page.tsx',
  'src/templates/egg-tasta/app/purchases/report/page.tsx',
  'src/templates/egg-tasta/app/expenses/report/page.tsx',
  'src/templates/egg-tasta/app/accounts/report/page.tsx',
  'src/templates/egg-tasta/app/sales/report/page.tsx',
  'src/templates/egg-tasta/app/customer-collection/report/page.tsx'
];

for (const file of files) {
  const fullPath = '/workspaces/all_rounder/erp-platform/' + file;
  let content = fs.readFileSync(fullPath, 'utf8');

  // Find the exact button structure
  const regex = /<button[^>]*onClick={\(\) => alert\("([^"]+)"\)}[^>]*>([\s\S]*?)<\/button>/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, (match, message, label) => {
      const cleanLabel = label.trim();
      return `<ReportExportButton message="${message}" label="${cleanLabel}" />`;
    });
    
    // Add import statement at the top (after other imports)
    const importStatement = `import { ReportExportButton } from "@/templates/egg-tasta/components/reports/report-export-button";\n`;
    
    // Insert import after the last import statement
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
    } else {
      content = importStatement + content;
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Refactored', file);
  }
}
