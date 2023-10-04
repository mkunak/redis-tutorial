export class RetrievedDataValidator {
  isValid(data: Record<string, string>) {
    return Object.keys(data).length !== 0;
  }
}
