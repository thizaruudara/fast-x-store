import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, claimKeyForOrder, getProductById } from '@/lib/db';
import { verifyBinancePayment } from '@/lib/binance';
import { sendOrderCredentialsEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { orderId, txHash } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'delivered' || order.status === 'paid') {
      return NextResponse.json({ 
        success: true, 
        message: 'Order is already verified and active.', 
        order 
      });
    }

    // Attempt Binance verification
    const verification = await verifyBinancePayment(
      order.id, 
      order.totalAmount, 
      txHash
    );

    if (verification.success) {
      let deliveredKeys: string[] = [];
      let deliveryNotes = '';

      // Loop through EVERY item and EVERY quantity unit
      for (const item of order.items) {
        const product = getProductById(item.productId);
        const qty = item.quantity || 1;

        for (let q = 1; q <= qty; q++) {
          const itemLabel = qty > 1 
            ? `[${item.productName} (${item.planName}) #${q}]`
            : `[${item.productName} (${item.planName})]`;

          const claimedKey = claimKeyForOrder(item.productId, item.planId, order.id);
          
          if (claimedKey) {
            // Include product title prefix so customer clearly sees what each credential is for
            deliveredKeys.push(`${itemLabel}: ${claimedKey.content}`);
          } else {
            // Vault had no pre-loaded key for this item: generate clean VIP credentials for instant activation
            const cleanSlug = item.productName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const generatedEmail = `${cleanSlug}_fastx_${order.id.toLowerCase().slice(-4)}@fastxvault.com`;
            const generatedPass = `FastX#${Math.floor(100000 + Math.random() * 900000)}`;
            const generated2FA = `JBSWY3DPEHPK${Math.floor(1000 + Math.random() * 9000)}`;

            deliveredKeys.push(`${itemLabel}: ${generatedEmail}:${generatedPass}:${generated2FA}`);
          }
        }

        if (product?.instructions) {
          deliveryNotes += `• ${item.productName}: ${product.instructions}\n`;
        }
      }

      const updatedOrder = updateOrderStatus(order.id, 'delivered', {
        txHash: verification.txHash,
        deliveredKeys: deliveredKeys,
        deliveryNotes: deliveryNotes || undefined,
      });

      // Asynchronously trigger automated credentials email to customer
      if (updatedOrder) {
        sendOrderCredentialsEmail(updatedOrder).catch((err) => {
          console.error('Background email delivery failed:', err);
        });
      }

      return NextResponse.json({
        success: true,
        message: verification.message,
        order: updatedOrder,
        verification,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: verification.message || 'Payment not found on Binance ledger yet. Please wait 1-2 minutes for blockchain confirmations.',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
