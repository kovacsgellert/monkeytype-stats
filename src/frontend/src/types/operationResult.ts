export type OperationResult<T> = {
  data: T | null;
  errors: string[];
  isValid: boolean;
};
