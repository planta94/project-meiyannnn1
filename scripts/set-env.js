const fs = require('fs');
const path = require('path');

// Read local .env file if it exists
const envFilePath = path.join(__dirname, '../.env');
if (fs.existsSync(envFilePath)) {
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valParts] = trimmed.split('=');
      const varKey = key.trim();
      const varVal = valParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (varKey && varVal && !process.env[varKey]) {
        process.env[varKey] = varVal;
      }
    }
  });
}

const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
const username = process.env.APP_USERNAME || 'pandan';
const password = process.env.APP_PASSWORD || 'pandanyan2026';

if (!apiKey) {
  console.warn('⚠️ WARNING: GOOGLE_MAPS_API_KEY is not defined in .env or environment variables!');
}

const envProdContent = `export const environment = {
  production: true,
  googleMapsApiKey: '${apiKey}',
  appUsername: '${username}',
  appPassword: '${password}'
};
`;

const envDevContent = `export const environment = {
  production: false,
  googleMapsApiKey: '${apiKey}',
  appUsername: '${username}',
  appPassword: '${password}'
};
`;

const prodPath = path.join(__dirname, '../src/environments/environment.prod.ts');
const devPath = path.join(__dirname, '../src/environments/environment.ts');

fs.writeFileSync(prodPath, envProdContent);
fs.writeFileSync(devPath, envDevContent);

console.log(`Successfully generated environment files (Key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'NOT SET'}, User: ${username}).`);
