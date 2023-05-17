import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from './validation.service';
import { FacilityService } from '../registry/facility/facility.service';
import { ProductService } from '../registry/product/product.service';
import { ConfigService } from '@nestjs/config';

describe('ValidationService', () => {
  let service: ValidationService;
  const moqConfigService = {
    provide: ConfigService,
    useValue: {
      get: <T>(variable: string) => {
        return null;
      },
    },
  };
  const moqFacilityService = {
    provide: FacilityService,
    useValue: {
      getFacilities: () => {
        const facilities = new Map<string, string>();
        facilities.set('001', 'qqq');
        facilities.set('002', 'www');
        facilities.set('003', 'eee');
        return facilities;
      },
    },
  };
  const moqProductService = {
    provide: ProductService,
    useValue: {
      getProducts: () => {
        const products = new Map<string, string>();
        products.set('001', 'qqq');
        products.set('002', 'www');
        products.set('003', 'eee');
        return products;
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        moqFacilityService,
        moqProductService,
        moqConfigService,
        ValidationService,
      ],
    }).compile();

    service = module.get<ValidationService>(ValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an empty DHIS2 Payload for the given input', async () => {
    // arrange and act
    const dhis2Payload = await service.validate(
      {
        'reporting-period': '',
        description: '',
        facilities: [
          {
            'facility-code': 'abc',
            values: [
              {
                'product-code': '123',
                value: 0,
              },
            ],
          },
        ],
      },
      'sample',
    );

    // assert
    expect(dhis2Payload.payload.length).toBe(0);
  });

  it('should return a non empty DHI2 Payload for the given input', async () => {
    // arrange and act
    const dhis2Payload = await service.validate(
      {
        'reporting-period': '',
        description: '',
        facilities: [
          {
            'facility-code': '001',
            values: [
              {
                'product-code': '001',
                value: 0,
              },
            ],
          },
          {
            'facility-code': '002',
            values: [
              {
                'product-code': '002',
                value: 0,
              },
            ],
          },
        ],
      },
      'sample',
    );
    expect(dhis2Payload.payload.length).toBeGreaterThan(0);
    expect(dhis2Payload.missingFacilities.length).toBe(0);
    expect(dhis2Payload.missingProducts.length).toBe(0);
  });
});
