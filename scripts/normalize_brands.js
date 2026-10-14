const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

function buildDescriptionWithMeta(description, brand, clothingType) {
  const clean = (description || '').replace(/<!--meta:[\s\S]*?-->/g, '').trim();
  if (!brand && !clothingType) return clean;
  const metaStr = `<!--meta:${JSON.stringify({ brand: brand || '', clothingType: clothingType || '' })}-->`;
  return clean ? `${metaStr}\n${clean}` : metaStr;
}

const productsPath = path.join(process.cwd(), 'src/data/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

products.forEach(p => {
  if (p.brand) {
    p.brand = p.brand.trim().toUpperCase();
    if (p.brand === 'ERD') p.brand = 'ENFANTS RICHES DÉPRIMÉS';
  }
});

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
console.log('Normalized local products.json!');

async function sync() {
  if (!supabase) return;
  const batchSize = 50;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const rows = batch.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      original_price: p.originalPrice || null,
      category: p.category,
      description: buildDescriptionWithMeta(p.description, p.brand, p.clothingType),
      images: p.images,
      sizes: p.sizes,
      in_stock: p.inStock,
      is_featured: p.isFeatured
    }));
    await supabase.from('products').upsert(rows, { onConflict: 'id' });
  }
  console.log('Normalized Supabase brands successfully!');
}

sync();
