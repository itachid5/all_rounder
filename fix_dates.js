const fs = require('fs');
const glob = require('glob');

const files = [
  "src/app/(platform)/platform/tenants/page.tsx",
  "src/templates/egg-tasta/app/accounts/bank/transactions/page.tsx",
  "src/templates/egg-tasta/app/accounts/cash/page.tsx",
  "src/templates/egg-tasta/components/customers/CustomerProfileDrawer.tsx",
  "src/templates/egg-tasta/components/customers/customer-ledger-client.tsx",
  "src/templates/egg-tasta/components/customers/manage-customers-client.tsx",
  "src/templates/egg-tasta/components/expenses/manage-expenses-client.tsx",
  "src/templates/egg-tasta/components/payments/customer-collection-report-client.tsx",
  "src/templates/egg-tasta/components/payments/manage-collections-client.tsx",
  "src/templates/egg-tasta/components/payments/manage-payments-client.tsx",
  "src/templates/egg-tasta/components/purchases/manage-purchases-client.tsx",
  "src/templates/egg-tasta/components/sales/manage-sales-client.tsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('toLocaleDateString')) {
    // Replace new Date(X).toLocaleDateString(...) with formatDate(X)
    content = content.replace(/new Date\(([^)]+)\)\.toLocaleDateString\(([^)]*)\)/g, 'formatDate($1)');
    
    // Also remove suppressHydrationWarning if it was used for dates
    content = content.replace(/<span suppressHydrationWarning>\{formatDate\(([^)]+)\)\}<\/span>/g, '{formatDate($1)}');
    
    // Add import
    if (!content.includes('import { formatDate }')) {
      const importStmt = "import { formatDate } from \"@/shared/utils/date\";\n";
      // insert after last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfLine = content.indexOf('\n', lastImportIndex);
        content = content.substring(0, endOfLine + 1) + importStmt + content.substring(endOfLine + 1);
      } else {
        content = importStmt + content;
      }
    }
    
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
}
