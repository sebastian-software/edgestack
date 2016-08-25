export function notEmpty(x, message) {
  if (x == null) {
    throw new Error(message);
  }

  return x;
}

export function envVarExists(envVarName) {
  const message =
    `The "${envVarName}" env variable was not found.  Please ensure you have ` +
    'set the environment variable. If you have but you are still seeing this ' +
    'error message then you may have forgotten to add the env variable to ' +
    'the "DefinePlugin" plugin within the webpack configFactory.';

  return notEmpty(process.env[envVarName], message);
}
