'use client';

import { useState, useCallback, useEffect } from 'react';
import { Check } from 'lucide-react';
import ShippingForm from './ShippingForm';
import PaymentForm from './PaymentForm';
import SuccessScreen from './SuccessScreen';
import OrderSummary from './OrderSummary';
import ProgressIndicator from './ProgressIndicator';
import { fetchCart } from '../_store/shopActions';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    phone: '',
    address: '',
    city: '',
    district: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  console.log('Cart items', cartItems);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCart();
      console.log('data:', data);
      setCartItems(data?.items || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load cart.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.salePrice ?? item.product.price ?? 0;
    console.log('price', price);
     console.log('too', item.quantity);
    return sum + price * item.quantity;
  }, 0);

  console.log('sub total', subtotal);
  const shipping = 10.0;
  const total = subtotal + shipping;

  const handleShippingSubmit = info => {
    setShippingInfo(info);
    setStep(2);
  };

  const handlePaymentSubmit = async method => {
    setPaymentMethod(method);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.salePrice ?? item.product.price,
            name: item.product.name,
            size: item.size || null,
          })),
          phone: shippingInfo.phone,
          address: `${shippingInfo.address}, ${shippingInfo.city}${
            shippingInfo.district ? ', ' + shippingInfo.district : ''
          }`,
          totalAmount: total,
          paymentMethod: method,
        }),
      });

      if (!response.ok) {
        throw new Error('Захиалга үүсгэхэд алдаа гарлаа');
      }

      const order = await response.json();
      setOrderId(order._id || order.id);
      setStep(3);
    } catch (error) {
      console.error('Order error:', error);
      alert(error.message || 'Захиалга үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='flex flex-col gap-12 text-[#0d0d0d]'>
      <header className='flex flex-col gap-3'>
        <span className='text-xs uppercase tracking-[0.28em] text-[#4d5544]'>
          Order completion
        </span>
        <h1 className='text-3xl font-semibold uppercase tracking-[0.12em] sm:text-4xl'>
          Checkout
        </h1>

        <ProgressIndicator step={step} />
      </header>
      {error && (
        <div className='border border-[#b33a3a] bg-[#b33a3a]/10 px-6 py-4 text-sm uppercase tracking-[0.18em] text-[#b33a3a]'>
          {error}
        </div>
      )}
      <div className='grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]'>
        <div className='flex flex-col gap-6'>
          {step === 1 && (
            <ShippingForm
              initialData={shippingInfo}
              onSubmit={handleShippingSubmit}
            />
          )}

          {step === 2 && (
            <PaymentForm
              paymentMethod={paymentMethod}
              loading={loading}
              onBack={() => setStep(1)}
              onSubmit={handlePaymentSubmit}
            />
          )}

          {step === 3 && (
            <SuccessScreen orderId={orderId} paymentMethod={paymentMethod} />
          )}
        </div>

        <OrderSummary
          cartItems={cartItems}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
        />
      </div>
    </section>
  );
}
