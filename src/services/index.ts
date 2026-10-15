/**
 * Service registry — the single seam between UI and data.
 *
 * Frontend phase: demo implementations (localStorage + simulated payments).
 * Backend phase: swap these exports for the services/api implementations
 * that satisfy the same interfaces in services/contracts.ts.
 */
import type { AuthService, JolliFlowService, PaymentProvider } from './contracts';
import { demoService } from './demo/demoService';
import { demoAuth } from './demo/demoAuth';
import { demoPaymentProvider } from './demo/demoPaymentProvider';
import { demoStore } from './demo/demoStore';

export const DATA_MODE = 'demo' as const;

export const service: JolliFlowService = demoService;
export const auth: AuthService = demoAuth;
export const payments: PaymentProvider = demoPaymentProvider;

/** Read model for the UI. The API phase will replace this with a query cache. */
export const dataStore = demoStore;