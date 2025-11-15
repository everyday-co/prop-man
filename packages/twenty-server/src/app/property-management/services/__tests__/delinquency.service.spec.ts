import { DelinquencyService } from 'src/app/property-management/services/delinquency.service';
import { type PropertyManagementObjectService } from 'src/app/property-management/services/property-management-object.service';

const createObjectServiceMock = () =>
  ({
    fetchLeaseCharges: jest.fn(),
    fetchPayments: jest.fn(),
  }) as unknown as jest.Mocked<PropertyManagementObjectService>;

describe('DelinquencyService', () => {
  const month = '2025-02';
  let objectService: jest.Mocked<PropertyManagementObjectService>;
  let service: DelinquencyService;

  beforeEach(() => {
    objectService = createObjectServiceMock();
    service = new DelinquencyService(objectService);
  });

  it('returns leases with outstanding balances', async () => {
    objectService.fetchLeaseCharges.mockResolvedValue([
      { leaseId: 'lease-a', amount: 1200, propertyId: 'prop-1' },
      { leaseId: 'lease-b', amount: 900, propertyId: 'prop-2' },
      { leaseId: 'lease-a', amount: 100, propertyId: 'prop-1' },
    ] as never);
    objectService.fetchPayments.mockResolvedValue([
      { leaseId: 'lease-a', amount: 1000 },
    ] as never);

    const delinquencies = await service.getDelinquentLeases(month);

    expect(delinquencies).toEqual(
      expect.arrayContaining([
        {
          leaseId: 'lease-a',
          propertyId: 'prop-1',
          outstandingAmount: 300,
        },
        {
          leaseId: 'lease-b',
          propertyId: 'prop-2',
          outstandingAmount: 900,
        },
      ]),
    );
    expect(objectService.fetchLeaseCharges).toHaveBeenCalledWith(
      expect.objectContaining({
        chargeType: { eq: 'Rent' },
        status: { in: ['Open', 'Partially Paid'] },
        dueDate: {
          gte: expect.stringMatching(/^2025-02/),
          lt: expect.stringMatching(/^2025-03/),
        },
      }),
    );
    expect(objectService.fetchPayments).toHaveBeenCalledWith(
      expect.objectContaining({
        status: { eq: 'Completed' },
        paymentDate: {
          gte: expect.stringMatching(/^2025-02/),
          lt: expect.stringMatching(/^2025-03/),
        },
      }),
    );
  });

  it('aggregates delinquency per property', async () => {
    const delinquencies = [
      { leaseId: 'a', propertyId: 'prop', outstandingAmount: 400 },
      { leaseId: 'b', propertyId: 'prop', outstandingAmount: 125 },
    ];

    jest
      .spyOn(service, 'getDelinquentLeases')
      .mockResolvedValue(delinquencies as never);

    const total = await service.getDelinquentByProperty('prop', month);

    expect(total).toBe(525);
    expect(service.getDelinquentLeases).toHaveBeenCalledWith(month, 'prop');
  });
});
