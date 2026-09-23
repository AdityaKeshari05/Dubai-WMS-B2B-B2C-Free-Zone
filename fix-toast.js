const fs = require('fs');
const files = [
  'src/components/wms/inventory/TransferModal.tsx',
  'src/components/wms/inventory/AdjustStockModal.tsx',
  'src/components/wms/inventory/MarkDamagedModal.tsx',
  'src/components/wms/inventory/NewAdjustmentModal.tsx',
  'src/components/wms/inventory/NewCycleCountModal.tsx',
  'src/app/inventory/wms-counts/[id]/page.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/import \{ useToast \} from "@\/hooks\/use-toast";\n/g, 'import toast from "react-hot-toast";\n');
  content = content.replace(/.*const \{ toast \} = useToast\(\);\n/g, '');
  
  // replace toast({ variant: "destructive", title: "...", description: "..." })
  content = content.replace(/toast\(\{\s*variant:\s*"destructive",\s*title:\s*"[^"]*",\s*description:\s*(.*?)\s*\}\);/g, 'toast.error($1);');
  
  // replace toast({ title: "...", description: "..." })
  content = content.replace(/toast\(\{\s*title:\s*"[^"]*",\s*description:\s*(.*?)\s*\}\);/g, 'toast.success($1);');

  fs.writeFileSync(f, content);
  console.log('Fixed', f);
});
