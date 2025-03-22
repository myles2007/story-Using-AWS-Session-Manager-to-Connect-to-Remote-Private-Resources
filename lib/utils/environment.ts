class MissingEnvVarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingEnvVarError";
  }
}
export const tryGetEnvVar = (name: string): string => {
  const value = process.env[name];
  if (typeof value == "undefined") {
    throw new MissingEnvVarError(`Missing environment variabl: ${name}`);
  }
  return value;
};

export const getEnvVarOrDefault = ({
  name,
  default: defaultValue,
}: {
  name: string;
  default: string;
}): string => {
  try {
    return tryGetEnvVar(name);
  } catch (e) {
    if (e instanceof MissingEnvVarError) {
      return defaultValue;
    }
    throw e; // rethrow any other errors
  }
};
