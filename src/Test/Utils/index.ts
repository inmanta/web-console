export const getById = (id: string): HTMLElement => {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`No element found with id: "${id}"`);
  }

  return el;
};
