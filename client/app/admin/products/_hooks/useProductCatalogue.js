import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getProductsByCategory } from '../../_store/adminStore';

const computeActiveId = (data, previous, preserve, preferred) => {
  const fallback =
    data.categories[0]?.id ||
    (data.unassigned.length > 0 ? 'unassigned' : null);

  if (preferred) {
    if (preferred === 'unassigned') {
      return data.unassigned.length > 0 ? 'unassigned' : fallback;
    }
    const match = data.categories.some(category => category.id === preferred);
    if (match) return preferred;
  }

  if (preserve && previous) {
    if (previous === 'unassigned') {
      return data.unassigned.length > 0 ? 'unassigned' : fallback;
    }
    const exists = data.categories.some(category => category.id === previous);
    if (exists) return previous;
  }

  return fallback;
};

export function useProductCatalogue() {
  const [loading, setLoading] = useState(true);
  const [catalogue, setCatalogue] = useState({
    categories: [],
    unassigned: [],
  });
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const isMountedRef = useRef(true);

  const refreshCatalogue = useCallback(
    async ({ preserveActive = true, preferredId = null } = {}) => {
      if (!isMountedRef.current) return;
      setLoading(true);
      try {
        const data = await getProductsByCategory();
        if (!isMountedRef.current) return;
        setCatalogue(data);
        setActiveCategoryId(prev =>
          computeActiveId(data, prev, preserveActive, preferredId)
        );
      } catch (error) {
        if (isMountedRef.current) {
          console.error('Failed to refresh product catalogue', error);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    refreshCatalogue({ preserveActive: false });
  }, [refreshCatalogue]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const categoryTree = useMemo(() => {
    const nodes = new Map();
    catalogue.categories.forEach(category => {
      nodes.set(category.id, { ...category, children: [] });
    });

    const roots = [];
    nodes.forEach(node => {
      if (node.parentId && nodes.has(node.parentId)) {
        nodes.get(node.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortByName = (a, b) => a.name.localeCompare(b.name);
    roots.sort(sortByName);
    roots.forEach(root => root.children.sort(sortByName));
    return roots;
  }, [catalogue]);

  const categoryLookup = useMemo(() => {
    const map = new Map();
    catalogue.categories.forEach(category => {
      const parent = category.parentId
        ? catalogue.categories.find(item => item.id === category.parentId)
        : null;
      map.set(category.id, {
        name: category.name,
        parentId: category.parentId || null,
        parentName: category.parentName || parent?.name || null,
      });
    });
    return map;
  }, [catalogue]);

  const activeCategory =
    activeCategoryId && activeCategoryId !== 'unassigned'
      ? catalogue.categories.find(category => category.id === activeCategoryId)
      : null;

  const detailCategory = loading
    ? null
    : activeCategory
    ? { ...activeCategory }
    : {
        id: 'unassigned',
        type: 'unassigned',
        name: 'Unassigned catalogue',
        description: '',
        image: null,
      };

  const detailProducts = loading
    ? []
    : activeCategory
    ? activeCategory.products
    : catalogue.unassigned;

  const totalProducts = useMemo(() => {
    if (loading) return 0;
    const categoryCount = catalogue.categories.reduce(
      (sum, category) => sum + category.products.length,
      0
    );
    return categoryCount + catalogue.unassigned.length;
  }, [catalogue, loading]);

  const categoryCards = useMemo(() => {
    const cards = [];

    const addCard = (category, parentName = null) => {
      cards.push({
        id: category.id,
        name: category.name,
        count: category.products.length,
        image: category.image,
        parentId: category.parentId || null,
        parentName,
      });
    };

    categoryTree.forEach(main => {
      addCard(main, null);
      main.children.forEach(child => addCard(child, main.name));
    });

    if (catalogue.unassigned.length > 0) {
      cards.push({
        id: 'unassigned',
        name: 'Unassigned catalogue',
        count: catalogue.unassigned.length,
        image: null,
        parentId: null,
        parentName: null,
      });
    }
    return cards;
  }, [catalogue.unassigned.length, categoryTree]);

  useEffect(() => {
    if (!loading && !activeCategoryId && categoryCards.length > 0) {
      setActiveCategoryId(categoryCards[0].id);
    }
  }, [loading, activeCategoryId, categoryCards]);

  const allProducts = useMemo(() => {
    if (loading) return [];
    const buildPath = categoryId => {
      if (!categoryId) return 'Unassigned';
      const meta = categoryLookup.get(categoryId);
      if (!meta) return 'Unassigned';
      return meta.parentName ? `${meta.parentName} / ${meta.name}` : meta.name;
    };

    const fromCategories = catalogue.categories.flatMap(category =>
      category.products.map(product => ({
        ...product,
        categoryId: category.id,
        categoryPath: buildPath(category.id),
      }))
    );

    const unassigned = catalogue.unassigned.map(product => ({
      ...product,
      categoryId: 'unassigned',
      categoryPath: 'Unassigned',
    }));

    return [...fromCategories, ...unassigned].sort((a, b) => {
      const categoryCompare = a.categoryPath.localeCompare(b.categoryPath);
      return categoryCompare !== 0
        ? categoryCompare
        : a.name.localeCompare(b.name);
    });
  }, [catalogue.categories, catalogue.unassigned, categoryLookup, loading]);

  return {
    loading,
    categoryCards,
    detailCategory,
    detailProducts,
    totalProducts,
    activeCategoryId,
    setActiveCategoryId,
    categoryTree,
    allProducts,
    refreshCatalogue,
  };
}
