export const omit = (obj: object, key: string) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));
