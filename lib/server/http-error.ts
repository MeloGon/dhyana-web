import 'server-only';

/** Error esperado que un endpoint puede traducir a estado HTTP y mensaje público. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
