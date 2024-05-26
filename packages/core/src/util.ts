export function createHash(obj: unknown) {
  const jsonString = JSON.stringify(obj);

  let hashValue = 0;

  for (let i = 0; i < jsonString.length; i++) {
    const charCode = jsonString.charCodeAt(i);
    hashValue = (hashValue << 5) - hashValue + charCode;
    hashValue &= 0x7fffffff;
  }

  return hashValue.toString(36);
}
