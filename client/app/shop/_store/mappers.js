const parseNumber = value => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const normaliseImages = images =>
  Array.isArray(images) ? images.filter(Boolean) : [];

const firstImage = images => (images.length > 0 ? images[0] : null);

const mapCategoryRef = category => {
  if (!category) return null;
  if (typeof category === 'object') {
    return {
      id: category._id || category.id || null,
      name: category.name || null,
      description: category.description || null,
      optionTemplates: Array.isArray(category.optionTemplates)
        ? category.optionTemplates
        : [],
    };
  }
  return { id: category, name: null, description: null, optionTemplates: [] };
};

const isSaleActive = product => {
  if (!product || !product.saleActive) return false;
  const salePrice = parseNumber(product.salePrice);
  if (!Number.isFinite(salePrice)) return false;

  const now = Date.now();
  const start = product.saleStart
    ? new Date(product.saleStart).getTime()
    : null;
  const end = product.saleEnd ? new Date(product.saleEnd).getTime() : null;
  if (start && start > now) return false;
  if (end && end < now) return false;
  return true;
};

const mapProduct = product => {
  if (!product) return null;
  const images = normaliseImages(product.images);
  const basePrice = parseNumber(product.price) ?? 0;
  const salePrice = parseNumber(product.salePrice);
  const saleActive = isSaleActive(product);
  const effectivePrice =
    saleActive && Number.isFinite(salePrice) ? salePrice : basePrice;

  return {
    id: product._id || product.id,
    name: product.name || 'Нэргүй бүтээгдэхүүн',
    description: product.description || '',
    sku: product.sku || '',
    price: basePrice,
    salePrice: Number.isFinite(salePrice) ? salePrice : null,
    saleActive,
    saleStart: product.saleStart || null,
    saleEnd: product.saleEnd || null,
    effectivePrice,
    images,
    image: firstImage(images),
    stock: parseNumber(product.stock) ?? 0,
    sizes: Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [],
    colors: Array.isArray(product.colors) ? product.colors.filter(Boolean) : [],
    optionGroups: Array.isArray(product.optionGroups)
      ? product.optionGroups
      : [],
    productType: product.productType || '',
    category: mapCategoryRef(product.category),
  };
};

const mapCategory = category => {
  if (!category) return null;
  const images = normaliseImages(category.images);
  return {
    id: category._id || category.id,
    name: category.name || 'Нэргүй категори',
    description: category.description || '',
    parent: mapCategoryRef(category.parent),
    images,
    image: firstImage(images),
    optionTemplates: Array.isArray(category.optionTemplates)
      ? category.optionTemplates
      : [],
  };
};

export {
  parseNumber,
  normaliseImages,
  firstImage,
  mapCategoryRef,
  isSaleActive,
  mapProduct,
  mapCategory,
};
