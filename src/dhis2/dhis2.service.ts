import { Injectable } from '@nestjs/common';
import { CreateDataElementsDto } from './dto';

@Injectable()
export class Dhis2Service {
  async create(
    createDataElementsDto: CreateDataElementsDto,
  ): Promise<CreateDataElementsDto> {
    return createDataElementsDto;
  }
}
