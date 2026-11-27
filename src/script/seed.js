const { testConfig } = require("../config/test-config");

async function main() {
  console.log(`[SEED] Test Type: ${testConfig.env}`);
  const seedModule = require(testConfig.datasetPath);
  await seedModule.runSeed();
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
