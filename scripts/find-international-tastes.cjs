const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'verynice',
  api_key: '795653376351388',
  api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

const queries = [
  'public_id:bibimbap*',
  'public_id:sushi*',
  'public_id:content/pages/foodDrinks/internationalTastes*',
  'public_id:foodDrinks/internationalTastes*'
];

async function search(expression) {
  console.log(`Searching: ${expression}...`);
  const result = await cloudinary.search
    .expression(expression)
    .max_results(5)
    .execute();
  return result.resources || [];
}

async function run() {
  for (const expression of queries) {
    const resources = await search(expression);
    console.log(`\nExpression: ${expression} => ${resources.length} found`);
    for (const resource of resources) {
      console.log(`- ${resource.public_id}`);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
