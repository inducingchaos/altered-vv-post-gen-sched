export type Result<TValue, TError = Error> =
  | {
      data: TValue;
      ok: true;
    }
  | {
      error: TError;
      ok: false;
    };

export function ok<TValue>(data: TValue): Result<TValue> {
  return { data, ok: true };
}

export function err<TError>(error: TError): Result<never, TError> {
  return { error, ok: false };
}
