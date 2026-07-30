import AuthGate from '@/components/AuthGate';
import CheckoutClient from '@/components/CheckoutClient';

export default function CheckoutPage() {
  return (
    <AuthGate requiredRole="customer" title="Login before checkout." description="Create or open your customer account so your order, hand photos and tracking stay connected to you.">
      <CheckoutClient />
    </AuthGate>
  );
}
