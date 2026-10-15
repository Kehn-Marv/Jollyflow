import type { PaymentProvider, PaymentRequest, PaymentResult } from '../contracts';

/**
 * DemoPaymentProvider — a local SIMULATION. No money moves, no bank is contacted.
 * The future backend will initiate real payments server-side (keys never reach the browser)
 * and confirm them via verified webhooks before any record is marked successful.
 */
export const demoPaymentProvider: PaymentProvider = {
  name: 'DemoPaymentProvider (simulation)',
  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    await new Promise((r) => setTimeout(r, 1400));
    const status = request.simulate ?? 'success';
    const message =
    status === 'success' ?
    'Simulated payment approved.' :
    status === 'failed' ?
    'Simulated payment declined. No money was moved.' :
    'Simulated provider did not confirm in time. The payment stays pending.';
    return { reference: request.reference, status, message, simulated: true };
  }
};