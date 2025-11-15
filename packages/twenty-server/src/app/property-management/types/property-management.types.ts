import { type CurrencyMetadata } from 'twenty-shared/types';

export type PropertyRecord = Record<string, unknown> & {
  id: string;
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  unitCount?: number;
  status?: string;
};

export type UnitRecord = Record<string, unknown> & {
  id: string;
  propertyId?: string;
  unitNumber?: string;
  status?: string;
  bedrooms?: number;
  bathrooms?: number;
  marketRent?: CurrencyMetadata | number | null;
  currentRent?: CurrencyMetadata | number | null;
  readyDate?: string | null;
};

export type LeaseRecord = Record<string, unknown> & {
  id: string;
  propertyId?: string;
  unitId?: string;
  startDate?: string | null;
  endDate?: string | null;
  leaseStatus?: string;
  rentAmount?: CurrencyMetadata | number | null;
};

export type WorkOrderRecord = Record<string, unknown> & {
  id: string;
  propertyId?: string;
  unitId?: string;
  status?: string;
  requestedAt?: string | null;
  completedAt?: string | null;
};

export type LeaseChargeRecord = Record<string, unknown> & {
  id: string;
  leaseId?: string;
  propertyId?: string;
  unitId?: string;
  chargeType?: string;
  amount?: CurrencyMetadata | number | null;
  dueDate?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  status?: string;
};

export type PaymentRecord = Record<string, unknown> & {
  id: string;
  leaseId?: string;
  propertyId?: string;
  unitId?: string;
  amount?: CurrencyMetadata | number | null;
  paymentDate?: string | null;
  status?: string;
};

export type DelinquentLease = {
  leaseId: string;
  propertyId: string | null;
  outstandingAmount: number;
};
