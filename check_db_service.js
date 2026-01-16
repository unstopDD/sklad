
const https = require('https');

const supabaseUrl = 'https://ukowrjpgixunmscypirh.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrb3dyanBnaXh1bm1zY3lwaXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ5MzM2MCwiZXhwIjoyMDg0MDY5MzYwfQ.aci2Q0Zr0Rm1m-qbK54ujybhP4_CWSY0o47igQKTpVc';

// Helper to make a request
function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: supabaseUrl.replace('https://', '').replace(/\/$/, ''),
            path: `/rest/v1${path}`,
            method: method,
            headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(data));
                    } else {
                        console.error(`Request failed: ${res.statusCode} ${res.statusMessage}`);
                        console.error('Response:', data);
                        resolve(null); // Resolve null on error to keep flow going
                    }
                } catch (e) {
                    console.error('JSON Parse Error:', e);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error('Network Error:', e);
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function check() {
    console.log('--- DIAGNOSTIC START (Raw HTTPS) ---');

    // 1. Fetch products
    console.log('1. Fetching product...');
    const products = await makeRequest('GET', '/products?limit=1&select=*');

    if (!products || products.length === 0) {
        console.log('No products found or error.');
        // Try update on dummy ID just to see if column exists error occurs
        // But wait, if products empty, we can't test update on existing.
        return;
    }

    const product = products[0];
    console.log('Product Found Keys:', Object.keys(product));

    // 2. Try update
    console.log(`2. Attempting update on product ${product.id}...`);
    const updateRes = await makeRequest('PATCH', `/products?id=eq.${product.id}`, { quantity: (product.quantity || 0) + 1 });

    if (updateRes) {
        console.log('Update SUCCESS:', updateRes);
    } else {
        console.log('Update FAILED.');
    }

    console.log('--- DIAGNOSTIC END ---');
}

check();
