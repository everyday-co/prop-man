import { RentRollService } from 'src/app/property-management/services/rent-roll.service';
import { type PropertyManagementObjectService } from 'src/app/property-management/services/property-management-object.service';

const buildMockObjectService = () =>
  ({
    fetchLeaseCharges: jest.fn(),
    fetchPayments: jest.fn(),
  }) as unknown as jest.Mocked<PropertyManagementObjectService>;

describe('RentRollService', () => {
  const propertyId = 'property-123';
  const month = '2025-01';
  let objectService: jest.Mocked<PropertyManagementObjectService>;
  let service: RentRollService;

  beforeEach(() => {
    objectService = buildMockObjectService();
    service = new RentRollService(objectService);
  });

  it('sums rent charges for the selected month', async () => {
    objectService.fetchLeaseCharges.mockResolvedValue([
      { amount: 1200 },
      { amount: { amountMicros: 800_000_000 } },
    ] as never);

    const rentRoll = await service.getPropertyRentRoll(propertyId, month);

    expect(rentRoll).toBe(2000);
    expect(objectService.fetchLeaseCharges).toHaveBeenCalledWith(
      expect.objectContaining({
        chargeType: { eq: 'Rent' },
        status: { in: ['Open', 'Partially Paid', 'Paid'] },
        propertyId: { eq: propertyId },
        dueDate: {
          gte: expect.stringMatching(/^2025-01/),
          lt: expect.stringMatching(/^2025-02/),
        },
      }),
    );
  });

  it('only counts completed payments when computing collections', async () => {
    objectService.fetchPayments.mockResolvedValue([
      { amount: 1000 },
      { amount: { amountMicros: 500_000_000 } },
    ] as never);

    const collected = await service.getPropertyCollected(propertyId, month);

    expect(collected).toBe(1500);
    expect(objectService.fetchPayments).toHaveBeenCalledWith(
      expect.objectContaining({
        status: { eq: 'Completed' },
        propertyId: { eq: propertyId },
        paymentDate: {
          gte: expect.stringMatching(/^2025-01/),
          lt: expect.stringMatching(/^2025-02/),
        },
      }),
    );
  });

  it('floors delinquent balance at zero', async () => {
    const rentRollSpy = jest
      .spyOn(service, 'getPropertyRentRoll')
      .mockResolvedValue(3000);
    const collectedSpy = jest
      .spyOn(service, 'getPropertyCollected')
      .mockResolvedValue(3500);

    const delinquent = await service.getPropertyDelinquent(propertyId, month);

    expect(delinquent).toBe(0);
    expect(rentRollSpy).toHaveBeenCalledWith(propertyId, month);
    expect(collectedSpy).toHaveBeenCalledWith(propertyId, month);
  });
});
