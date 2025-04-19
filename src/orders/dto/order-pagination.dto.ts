import { PaginationDto } from 'src/common';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatusList } from '../enum/order.enum';
import { OrderStatus } from 'generated/prisma';

export class OrderPaginationDto extends PaginationDto {
  @IsEnum(OrderStatusList, {
    message: `Possible status values are ${OrderStatusList}`,
  })
  @IsOptional()
  status: OrderStatus;
}
