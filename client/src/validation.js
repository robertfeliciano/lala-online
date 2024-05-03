export const checkString = (str, field) => {
  if (!str) throw `You must provide a ${field}`;
  if (typeof str !== 'string') throw `${field} must be a string`;
  str = str.trim();
  if (str.length === 0)
    throw `${field} cannot be an empty string or just spaces`;
  return str;
}