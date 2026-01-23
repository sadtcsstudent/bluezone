const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const flattenMessages = (messages, prefix = '', result = {}) => {
  if (!isPlainObject(messages)) return result;

  Object.entries(messages).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      flattenMessages(value, path, result);
    } else {
      result[path] = String(value);
    }
  });

  return result;
};

export const unflattenMessages = (flatMessages = {}) => {
  const result = {};

  Object.entries(flatMessages).forEach(([path, value]) => {
    const segments = path.split('.');
    let current = result;

    segments.forEach((segment, index) => {
      if (index === segments.length - 1) {
        current[segment] = value;
      } else {
        if (!current[segment] || typeof current[segment] !== 'object') {
          current[segment] = {};
        }
        current = current[segment];
      }
    });
  });

  return result;
};
