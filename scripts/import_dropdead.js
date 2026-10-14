const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
  supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';
}

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Map dropdead productType to LENWINE clothingType
function mapClothingType(type, name = '') {
  const t = (type || '').toLowerCase();
  const n = (name || '').toLowerCase();

  if (t === 'shoes' || n.includes('boot') || n.includes('sneaker') || n.includes('derby') || n.includes('shoe')) return 'shoes';
  if (t === 'jacket' || n.includes('jacket') || n.includes('coat') || n.includes('bomber') || n.includes('vest')) return 'jackets';
  if (t === 'tshirt' || n.includes('tee') || n.includes('t-shirt') || n.includes('shirt') || n.includes('longsleeve')) return 'tshirts';
  if (t === 'pants' || n.includes('pant') || n.includes('jean') || n.includes('trouser')) return 'pants';
  if (t === 'sweater' || t === 'hoodie' || n.includes('sweater') || n.includes('hoodie') || n.includes('zip') || n.includes('cardigan')) return 'sweaters';
  if (t === 'shorts' || n.includes('short')) return 'shorts';
  if (t === 'cap' || n.includes('cap') || n.includes('hat') || n.includes('beanie')) return 'headwear';
  if (t === 'accessory' || n.includes('belt') || n.includes('bag') || n.includes('wallet') || n.includes('chain') || n.includes('ring')) return 'accessories';

  return 'tshirts';
}

// Clean and normalize brand names
function normalizeBrand(brandRaw, name = '') {
  let b = (brandRaw || '').trim().toUpperCase();
  const n = (name || '').toUpperCase();

  if (b === 'ERD' || n.includes('ENFANTS RICHES DÉPRIMÉS') || n.includes('ENFANTS')) return 'ENFANTS RICHES DÉPRIMÉS';
  if (b === 'SAINT LAUREN' || b === 'YSL') return 'SAINT LAURENT';
  if (b === 'NUMBER NINE') return 'NUMBER (N)INE';
  if (b === 'DEAD DROP') {
    if (n.includes('NUMBER')) return 'NUMBER (N)INE';
    if (n.includes('BALENCIAGA')) return 'BALENCIAGA';
    if (n.includes('RICK')) return 'RICK OWENS';
    return 'LENWINE';
  }
  if (b === 'CINIZIA ARAIA') return 'CINZIA ARAIA';
  if (b === 'GEVENCHY') return 'GIVENCHY';
  if (b === 'JUNYA WATANABET') return 'JUNYA WATANABE';
  if (b === 'VIVIEN WWESTWOOD') return 'VIVIENNE WESTWOOD';
  if (b === 'MAISON MIHARA YAUSHIRO') return 'MIHARA YASUHIRO';
  if (b === 'Kmiri' || b === 'KMIRI') return 'KMRII';
  if (b === '032C') return '032C';
  if (b === '14TH ADDICTION') return '14TH ADDICTION';

  if (!b || b === 'NO_BRAND') {
    if (n.includes('BALENCIAGA')) return 'BALENCIAGA';
    if (n.includes('RICK OWENS')) return 'RICK OWENS';
    if (n.includes('MARGIELA')) return 'MAISON MARGIELA';
    if (n.includes('UNDERCOVER')) return 'UNDERCOVER';
    if (n.includes('VETEMENTS')) return 'VETEMENTS';
    return 'LENWINE';
  }

  return b;
}

function buildDescriptionWithMeta(description, brand, clothingType) {
  const clean = (description || '').replace(/<!--meta:[\s\S]*?-->/g, '').trim();
  if (!brand && !clothingType) return clean;
  const metaStr = `<!--meta:${JSON.stringify({ brand: brand || '', clothingType: clothingType || '' })}-->`;
  return clean ? `${metaStr}\n${clean}` : metaStr;
}

async function fetchAllDropdeadProducts() {
  let allDocs = [];
  let pageToken = '';
  let page = 1;

  console.log('Fetching all products from dropdeadua firestore...');
  while (true) {
    let url = 'https://firestore.googleapis.com/v1/projects/deaddropua-com/databases/(default)/documents/products?pageSize=100';
    if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch page ${page}: ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.documents || data.documents.length === 0) break;
    
    allDocs = allDocs.concat(data.documents);
    console.log(`Page ${page}: received ${data.documents.length} items (Total: ${allDocs.length})`);
    
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
    page++;
  }

  return allDocs;
}

function transformDocToProduct(doc, index) {
  const f = doc.fields || {};
  const docId = doc.name.split('/').pop();
  const rawName = (f.name?.stringValue || 'LENWINE Item').trim();
  const brand = normalizeBrand(f.brand?.stringValue, rawName);
  const clothingType = mapClothingType(f.productType?.stringValue, rawName);

  // Status & InStock
  const status = f.status?.stringValue || 'Pre-order';
  const inStock = status === 'In Stock';
  const category = inStock ? 'IN_STOCK' : 'PREORDER';

  // Price
  const price = Number(f.price?.integerValue || f.price?.doubleValue || 0) || 1990;
  
  // Original Price / Discount
  let originalPrice = undefined;
  if (f.discountActive?.booleanValue && f.discountPercent?.integerValue) {
    const percent = Number(f.discountPercent.integerValue);
    if (percent > 0 && percent < 90) {
      originalPrice = Math.round(price / (1 - percent / 100));
    }
  }

  // Images
  const images = [];
  if (f.image?.stringValue) images.push(f.image.stringValue.trim());
  if (f.images?.arrayValue?.values) {
    f.images.arrayValue.values.forEach(v => {
      const u = (v.stringValue || '').trim();
      if (u && !images.includes(u)) images.push(u);
    });
  }
  // Color variants images
  if (f.colorVariants?.arrayValue?.values) {
    f.colorVariants.arrayValue.values.forEach(cv => {
      const cvImages = cv.mapValue?.fields?.images?.arrayValue?.values || [];
      cvImages.forEach(v => {
        const u = (v.stringValue || '').trim();
        if (u && !images.includes(u)) images.push(u);
      });
    });
  }
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1000');
  }

  // Sizes
  let sizes = [];
  if (f.sizes?.arrayValue?.values) {
    sizes = f.sizes.arrayValue.values.map(v => (v.stringValue || '').trim()).filter(Boolean);
  }
  if (sizes.length === 0) {
    if (clothingType === 'shoes') {
      sizes = ['39', '40', '41', '42', '43', '44', '45'];
    } else if (clothingType === 'headwear' || clothingType === 'accessories') {
      sizes = ['ONE SIZE'];
    } else {
      sizes = ['S', 'M', 'L', 'XL'];
    }
  }

  // Description
  let desc = (f.description?.stringValue || '').trim();
  const delivery = f.delivery?.stringValue?.trim();
  if (delivery && !desc.includes(delivery)) {
    desc = desc ? `${desc}\n\nТермін доставки: ${delivery}` : `Термін доставки: ${delivery}`;
  }

  // Position ordering
  const pos = Number(f.position?.integerValue || index);

  return {
    id: `len-${docId}`,
    name: rawName,
    price,
    originalPrice,
    category,
    brand,
    clothingType,
    description: desc,
    images,
    sizes,
    inStock,
    isFeatured: index < 15,
    pos
  };
}

async function run() {
  try {
    const rawDocs = await fetchAllDropdeadProducts();
    console.log(`Fetched ${rawDocs.length} raw products.`);

    const products = rawDocs.map((doc, idx) => transformDocToProduct(doc, idx));

    // Sort products by position (same order as dropdead shop)
    products.sort((a, b) => a.pos - b.pos);

    // Remove temporary pos field
    const finalProducts = products.map(({ pos, ...rest }) => rest);

    console.log(`\nSample transformed product:`, JSON.stringify(finalProducts[0], null, 2));

    // 1. Write to local file src/data/products.json
    const productsPath = path.join(process.cwd(), 'src/data/products.json');
    fs.writeFileSync(productsPath, JSON.stringify(finalProducts, null, 2), 'utf8');
    console.log(`Successfully saved ${finalProducts.length} products to ${productsPath}`);

    // 2. Sync to Supabase in batches
    if (supabase) {
      console.log('\nSyncing all products to Supabase...');
      // Clear existing products in Supabase or upsert
      const batchSize = 50;
      let insertedCount = 0;

      for (let i = 0; i < finalProducts.length; i += batchSize) {
        const batch = finalProducts.slice(i, i + batchSize);
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

        const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' });
        if (error) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message);
        } else {
          insertedCount += rows.length;
          process.stdout.write(`Inserted ${insertedCount}/${finalProducts.length} into Supabase...\r`);
        }
      }
      console.log(`\nSupabase sync complete! ${insertedCount} products upserted.`);
    } else {
      console.log('No Supabase credentials found, skipped Supabase sync.');
    }

    console.log('\nALL DONE!');
  } catch (err) {
    console.error('Fatal error during import:', err);
  }
}

run();
