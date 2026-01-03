const pickImage = item =>
  Array.isArray(item?.images) && item.images.length > 0 ? item.images[0] : null;

const isSaleCurrentlyActive = product => {
  if (!product) return false;
  if (!product.saleActive) return false;
  const price = Number(product.salePrice);
  if (!Number.isFinite(price)) return false;

  const now = Date.now();
  const start = product.saleStart
    ? new Date(product.saleStart).getTime()
    : null;
  const end = product.saleEnd ? new Date(product.saleEnd).getTime() : null;

  if (start && start > now) return false;
  if (end && end < now) return false;
  return true;
};

export { pickImage, isSaleCurrentlyActive };
