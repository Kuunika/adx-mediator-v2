import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../logging/logging.service';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface Product {
  code: string;
  dhis2_code: string;
}

@Injectable()
export class ProductService {
  constructor(private readonly log: LoggingService) {}

  async getProducts(client: string): Promise<Map<string, string>> {
    const products = new Map<string, string>();
    const pathToFile = join(process.cwd(), 'products', `${client}.json`);
    if (!existsSync(pathToFile)) {
      this.log.error('The product file for the given client does not exist', {
        client,
        timestamp: new Date().toISOString(),
      });
      throw new Error('The product file for the given client does not exist');
    }
    const raw = await readFile(pathToFile, 'utf-8');
    const productsFromFile = JSON.parse(raw) as Product[];
    productsFromFile.forEach((product) => {
      products.set(product.code, product.dhis2_code);
    });
    return products;
  }
}
