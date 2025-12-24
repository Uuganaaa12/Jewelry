import CategoryUploadForm from '@/components/admin/category/AddCategory';
import ProductUploadForm from '@/components/admin/product/AddProduct';

export default function Admin() {
  return (
    <>
      {' '}
      <h1 className='text-4xl font-bold text-blue-600'>Admin dashboard</h1>
      {/* <ProductUploadForm /> */}
      <CategoryUploadForm />
    </>
  );
}
