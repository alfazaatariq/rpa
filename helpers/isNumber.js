export const isNumber = (value) => {
  return /^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(value.trim());
};
