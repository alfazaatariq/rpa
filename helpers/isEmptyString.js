export const isEmptyString = (str) => {
  if (str === null || str === undefined || str === "".trim()) {
    return true;
  }
  return false;
};
