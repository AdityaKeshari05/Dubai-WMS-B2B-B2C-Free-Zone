const fs = require('fs');
const files = [
  'src/app/inventory/wms-transfers/page.tsx',
  'src/app/inventory/wms-adjustments/page.tsx',
  'src/app/inventory/wms-counts/page.tsx',
  'src/app/inventory/wms-history/page.tsx',
  'src/app/inventory/wms-counts/[id]/page.tsx',
  'src/components/wms/inventory/NewAdjustmentModal.tsx',
  'src/components/wms/inventory/NewCycleCountModal.tsx',
  'src/components/wms/inventory/TransferModal.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');

  // Replace `const { products, locations } = useWmsLookups();`
  // with `const { products } = useWmsLookups();\n  const locations = useWmsDbSelector((s) => s.locations);`

  content = content.replace(/const \{([^}]*)locations([^}]*)\} = useWmsLookups\(\);/g, (match, p1, p2) => {
    return 'const {' + p1 + p2 + '} = useWmsLookups();\n  const locations = useWmsDbSelector((s) => s.locations);';
  });
  
  content = content.replace(/const \{([^}]*)batches([^}]*)\} = useWmsLookups\(\);/g, (match, p1, p2) => {
    return 'const {' + p1 + p2 + '} = useWmsLookups();\n  const batches = useWmsDbSelector((s) => s.batches);';
  });

  // Cleanup empty destructures and dangling commas
  content = content.replace(/const \{\s*,\s*\} = useWmsLookups\(\);\n/g, '');
  content = content.replace(/const \{\s*\} = useWmsLookups\(\);\n/g, '');
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/\{\s*,/g, '{ ');
  content = content.replace(/,\s*\}/g, ' }');

  if (content.includes('useWmsDbSelector((s) => s.locations)') && !content.includes('import { useWmsDbSelector }')) {
    content = 'import { useWmsDbSelector } from "@/lib/wms/useWmsDb";\n' + content;
  }

  fs.writeFileSync(f, content);
  console.log('Fixed', f);
});
