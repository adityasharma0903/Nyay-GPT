const fs = require('fs');
const path = require('path');

const structure = [
  'config',
  'controllers', 
  'services',
  'middleware',
  'routes',
  'models',
  'utils',
  'data/legal_docs/hindi',
  'data/legal_docs/english', 
  'data/vector_store/hindi_embeddings',
  'data/vector_store/english_embeddings',
  'data/prompts',
  'data/cache/audio_cache',
  'data/cache/response_cache',
  'tests/unit/services',
  'tests/unit/controllers', 
  'tests/unit/utils',
  'tests/integration',
  'tests/fixtures',
  'scripts',
  'docs',
  'logs',
  'uploads/audio',
  'uploads/temp'
];

structure.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  }
});

console.log('🎉 Backend structure created sucess');