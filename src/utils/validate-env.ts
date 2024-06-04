import * as fs from 'fs';

function parseEnvFile(filePath: string): Record<string, string> {
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const envConfig: Record<string, string> = {};

  fileContent.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      envConfig[key.trim()] = value;
    }
  });

  return envConfig;
}

function validateEnv(path: string, sampleEnvPath: string) {
  const envConfig = parseEnvFile(path);
  const sampleEnvConfig = parseEnvFile(sampleEnvPath);

  const missingVariables = Object.keys(sampleEnvConfig).filter(
    (key) => !envConfig.hasOwnProperty(key),
  );

  return missingVariables.length > 0
    ? `Error during initialization. This is often due to a missing environment variable. Check your .env file for the following variables: ${missingVariables.join(', ')}`
    : false;
}

export default validateEnv;
