const dotenv = require("dotenv");
const path = require("path");

const targetEnv = process.env.TARGET_ENV || "regression";
const envPath = path.resolve(__dirname, "../../", `.env.${targetEnv}`);

const result = dotenv.config({
  path: envPath,
});

if (result.error) {
  throw new Error(`Cannot load environment file: ${envPath}`);
}

const allowedTestTypes = ["smoke", "regression"];

if (!allowedTestTypes.includes(targetEnv)) {
  throw new Error(`Invalid TEST_TYPE: ${targetEnv}`);
}

const seedName = process.env.DATABASE;
exports.testConfig = {
  env: process.env.ENV,
  baseURL: process.env.BASE_URL,
  datasetPath: path.resolve(__dirname, "../script", `${seedName}.js`),
};
