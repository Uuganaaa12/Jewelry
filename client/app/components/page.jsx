import { Button } from '@/components/ui/button';
import CategoryUploadForm from '../components/admin/category/AddCategory';
import ProductUploadForm from '../components/admin/product/AddProduct';

export default function Components() {
  return (
    <div className='mx-20'>
      <div className='flex justify-center items-center'>
        <h1 className='mt-10 text-3xl font-semibold tracking-tight'>
          Components alternatives
        </h1>
      </div>

      <div>
        <div className='flex gap-20  justify-center mt-20 border-1 p-4'>
          <Button>Click me</Button>
          <Button variant='outline'>Outline</Button>
          <Button variant='destructive'>Delete</Button>
          
        </div>
      </div>
    </div>
  );
}
