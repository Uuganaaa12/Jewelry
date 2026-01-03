'use client';

import { useEffect, useState } from 'react';
import ProductUploadForm from '@/app/components/admin/product/AddProduct';
import CategoryUploadForm from '@/app/components/admin/category/AddCategory';
import CategorySidebar from './_components/CategorySidebar';
import CategoryDetail from './_components/CategoryDetail';
import CategoryEditor from './_components/CategoryEditor';
import ProductEditor from './_components/ProductEditor';
import AllProductsPanel from './_components/AllProductsPanel';
import { useProductCatalogue } from './_hooks/useProductCatalogue';
import {
  getCategoryDetail,
  getProductDetail,
  deleteCategory,
  deleteProduct,
} from '../_store/adminStore';

export default function AdminProductsPage() {
  const {
    loading,
    categoryCards,
    detailCategory,
    detailProducts,
    totalProducts,
    activeCategoryId,
    setActiveCategoryId,
    refreshCatalogue,
    allProducts,
  } = useProductCatalogue();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [viewMode, setViewMode] = useState('categories');
  const [categoryEditor, setCategoryEditor] = useState({
    id: '',
    data: null,
    loading: false,
  });
  const [productEditor, setProductEditor] = useState({
    id: '',
    data: null,
    loading: false,
  });
  const [deletingCategoryId, setDeletingCategoryId] = useState('');
  const [deletingProductId, setDeletingProductId] = useState('');
  const resetCategoryEditor = () =>
    setCategoryEditor({ id: '', data: null, loading: false });
  const resetProductEditor = () =>
    setProductEditor({ id: '', data: null, loading: false });
  useEffect(() => {
    if (!activeCategoryId) return;
    setShowProductForm(false);
  }, [activeCategoryId]);

  useEffect(() => {
    if (!categoryEditor.id) return;
    if (!detailCategory || detailCategory.id !== categoryEditor.id) {
      setCategoryEditor(previous =>
        previous.id && (!detailCategory || detailCategory.id !== previous.id)
          ? { id: '', data: null, loading: false }
          : previous
      );
    }
  }, [detailCategory?.id, categoryEditor.id]);

  useEffect(() => {
    if (!productEditor.id) return;
    const matched = detailProducts.some(item => item.id === productEditor.id);
    if (!matched) {
      setProductEditor(previous =>
        previous.id && !matched
          ? { id: '', data: null, loading: false }
          : previous
      );
    }
  }, [detailProducts, productEditor.id]);

  useEffect(() => {
    if (viewMode === 'all') {
      setShowCategoryForm(false);
      setShowProductForm(false);
      resetCategoryEditor();
    }
  }, [viewMode]);

  const handleEditCategory = async id => {
    if (!id) return;
    if (categoryEditor.id === id && !categoryEditor.loading) {
      resetCategoryEditor();
      return;
    }
    setShowCategoryForm(false);
    setCategoryEditor({ id, data: null, loading: true });
    try {
      const detail = await getCategoryDetail(id);
      if (!detail) {
        alert('Категори олдсонгүй.');
        resetCategoryEditor();
        return;
      }
      setCategoryEditor({ id, data: detail, loading: false });
    } catch (error) {
      console.error('Failed to load category detail', error);
      alert('Категорийн мэдээлэл татахад алдаа гарлаа.');
      resetCategoryEditor();
    }
  };

  const handleEditProduct = async id => {
    if (!id) return;
    if (productEditor.id === id && !productEditor.loading) {
      resetProductEditor();
      return;
    }
    setShowProductForm(false);
    setProductEditor({ id, data: null, loading: true });
    try {
      const detail = await getProductDetail(id);
      if (!detail) {
        alert('Бүтээгдэхүүн олдсонгүй.');
        resetProductEditor();
        return;
      }
      setProductEditor({ id, data: detail, loading: false });
    } catch (error) {
      console.error('Failed to load product detail', error);
      alert('Бүтээгдэхүүний мэдээлэл татахад алдаа гарлаа.');
      resetProductEditor();
    }
  };

  const handleDeleteCategory = async id => {
    if (!id || deletingCategoryId) return;
    if (!window.confirm('Энэ категорийг устгах уу?')) {
      return;
    }

    setDeletingCategoryId(id);
    try {
      await deleteCategory(id);
      alert('Категори устлаа.');
      resetCategoryEditor();
      resetProductEditor();
      setShowCategoryForm(false);
      setShowProductForm(false);
      const preserveActive = false;
      refreshCatalogue({ preserveActive, preferredId: null });
    } catch (error) {
      console.error('Failed to delete category', error);
      alert('Категори устгах үед алдаа гарлаа.');
    } finally {
      setDeletingCategoryId('');
    }
  };

  const handleDeleteProduct = async id => {
    if (!id || deletingProductId) return;
    if (!window.confirm('Энэ бүтээгдэхүүнийг устгах уу?')) {
      return;
    }

    setDeletingProductId(id);
    try {
      await deleteProduct(id);
      alert('Бүтээгдэхүүн устлаа.');
      resetProductEditor();
      const preferredId = detailCategory?.id || selectedCategoryId || null;
      refreshCatalogue({ preserveActive: true, preferredId });
    } catch (error) {
      console.error('Failed to delete product', error);
      alert('Бүтээгдэхүүн устгах үед алдаа гарлаа.');
    } finally {
      setDeletingProductId('');
    }
  };
  const selectedCategoryId =
    detailCategory && detailCategory.type !== 'unassigned'
      ? detailCategory.id
      : '';
  const handleToggleProductForm = () => {
    if (!selectedCategoryId) return;
    resetProductEditor();
    setShowProductForm(previous => !previous);
  };
  const handleCategorySuccess = newId => {
    setShowCategoryForm(false);
    resetCategoryEditor();
    refreshCatalogue({
      preserveActive: true,
      preferredId: newId || null,
    });
  };
  const handleProductSuccess = () => {
    setShowProductForm(false);
    resetProductEditor();
    refreshCatalogue({ preserveActive: true, preferredId: selectedCategoryId });
  };
  const handleToggleCategoryForm = () => {
    resetCategoryEditor();
    setShowCategoryForm(previous => !previous);
  };
  const handleCategoryUpdated = updated => {
    const preferredId =
      updated?._id || categoryEditor.id || detailCategory?.id || null;
    resetCategoryEditor();
    refreshCatalogue({ preserveActive: true, preferredId });
  };
  const handleProductUpdated = () => {
    const targetCategoryId = detailCategory?.id || selectedCategoryId || null;
    resetProductEditor();
    refreshCatalogue({ preserveActive: true, preferredId: targetCategoryId });
  };
  const productFormNode =
    showProductForm && selectedCategoryId ? (
      <div className='border border-[#0d0d0d] bg-[#ffffff] p-6'>
        <header className='mb-6 flex flex-col gap-1'>
          <h3 className='text-sm font-semibold uppercase tracking-[0.18em]'>
            Add product to {detailCategory?.name}
          </h3>
          <p className='text-xs leading-6 text-[#0d0d0d]/70'>
            Категорийн ID автоматаар оноогдож илгээгдэнэ.
          </p>
        </header>
        <ProductUploadForm
          defaultCategory={selectedCategoryId}
          onSuccess={handleProductSuccess}
        />
      </div>
    ) : null;
  const editingCategoryActive = Boolean(
    categoryEditor.id &&
      detailCategory &&
      detailCategory.id === categoryEditor.id
  );
  const categoryEditForm = editingCategoryActive ? (
    <div className='border border-[#0d0d0d] bg-[#ffffff] p-6'>
      {categoryEditor.loading ? (
        <div className='admin-placeholder h-48 border border-[#0d0d0d]' />
      ) : (
        <CategoryEditor
          category={categoryEditor.data}
          onCancel={resetCategoryEditor}
          onUpdated={handleCategoryUpdated}
        />
      )}
    </div>
  ) : null;
  const productEditForm = productEditor.id ? (
    <div className='border border-[#0d0d0d] bg-[#ffffff] p-6'>
      {productEditor.loading ? (
        <div className='admin-placeholder h-60 border border-[#0d0d0d]' />
      ) : (
        <ProductEditor
          product={productEditor.data}
          onCancel={resetProductEditor}
          onUpdated={handleProductUpdated}
        />
      )}
    </div>
  ) : null;

  return (
    <section className='flex flex-col gap-12 text-[#0d0d0d]'>
      <header className='flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold uppercase tracking-[0.16em]'>
          Product console
        </h1>
        <p className='max-w-2xl text-sm leading-7 text-[#0d0d0d]/70'>
          Review categories and adjust catalogue coverage while keeping imagery
          aligned.
          {!loading && (
            <span className='ml-2 font-semibold text-[#0d0d0d]'>
              {totalProducts} items synced.
            </span>
          )}
        </p>
        <div className='flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={() => setViewMode('categories')}
            className={`border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
              viewMode === 'categories'
                ? 'border-[#0d0d0d] bg-[#0d0d0d] text-[#ffffff]'
                : 'border-[#0d0d0d] text-[#0d0d0d] hover:bg-[#4d5544] hover:text-[#ffffff]'
            }`}>
            By category
          </button>
          <button
            type='button'
            onClick={() => setViewMode('all')}
            className={`border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
              viewMode === 'all'
                ? 'border-[#0d0d0d] bg-[#0d0d0d] text-[#ffffff]'
                : 'border-[#0d0d0d] text-[#0d0d0d] hover:bg-[#4d5544] hover:text-[#ffffff]'
            }`}>
            All products
          </button>
        </div>
      </header>
      {viewMode === 'categories' ? (
        <section className='border border-[#0d0d0d] bg-[#ffffff]'>
          <div className='grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]'>
            <CategorySidebar
              loading={loading}
              categories={categoryCards}
              activeId={activeCategoryId}
              onSelect={setActiveCategoryId}
              onCreateCategory={handleToggleCategoryForm}
              creating={showCategoryForm}
            />
            <div className='flex flex-col gap-6'>
              {showCategoryForm && (
                <div className='border-b border-[#0d0d0d] bg-[#ffffff] p-6'>
                  <header className='mb-6 flex flex-col gap-1'>
                    <h3 className='text-sm font-semibold uppercase tracking-[0.18em]'>
                      Create new category
                    </h3>
                    <p className='text-xs leading-6 text-[#0d0d0d]/70'>
                      Шинэ категорийг бүртгэхэд хэрэглэгчийн дэлгүүрт автоматаар
                      харагдана.
                    </p>
                  </header>
                  <CategoryUploadForm onSuccess={handleCategorySuccess} />
                </div>
              )}
              <CategoryDetail
                loading={loading}
                category={detailCategory}
                products={detailProducts}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onToggleAddProduct={handleToggleProductForm}
                showAddProduct={showProductForm && Boolean(selectedCategoryId)}
                addProductForm={productFormNode}
                editingCategory={editingCategoryActive}
                editingProductId={productEditor.id}
                categoryEditForm={categoryEditForm}
                productEditForm={productEditForm}
                deletingCategory={Boolean(
                  detailCategory?.id && detailCategory.id === deletingCategoryId
                )}
                deletingProductId={deletingProductId}
              />
            </div>
          </div>
        </section>
      ) : (
        <section className='border border-[#0d0d0d] bg-[#ffffff]'>
          <AllProductsPanel
            loading={loading}
            products={allProducts}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            editingProductId={productEditor.id}
            deletingProductId={deletingProductId}
            productEditForm={productEditForm}
          />
        </section>
      )}
    </section>
  );
}
