export default (error: unknown): string => {
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return 'Unknown error';
};
