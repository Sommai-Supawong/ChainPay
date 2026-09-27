export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function requireValue(value: string | undefined, name: string): string {
  if (!value)
    throw new AppError(503, `${name} is not configured. See the setup guide.`);
  return value;
}
