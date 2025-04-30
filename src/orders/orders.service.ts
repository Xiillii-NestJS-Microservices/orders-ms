import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from 'generated/prisma';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto, OrderPaginationDto } from './dto';
import { PRODUCT_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrderService');

  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();

    this.logger.log('Database connected');
  }

  async create(createOrderDto: CreateOrderDto) {
    const ids = [5, 600];

    const products = await firstValueFrom(
      this.productsClient.send({ cmd: 'validate_products' }, ids),
    );

    return products;

    // return {
    //   service: 'Orders Microservice',
    //   createOrderDto: createOrderDto,
    // };
    // return this.order.create({
    //   data: createOrderDto,
    // });
  }

  async findAll(paginationDto: OrderPaginationDto) {
    const { page, limit, status } = paginationDto;

    const totalOrders = await this.order.count({ where: { status: status } });
    const lastPage = Math.ceil(totalOrders / (limit ?? 1));

    return {
      data: await this.order.findMany({
        skip: (page ?? 1 - 1) * (limit ?? 1),
        take: limit,
        where: { status: status },
      }),
      meta: {
        total: totalOrders,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: {
        id: id,
      },
    });

    if (!order) {
      throw new RpcException({
        message: `Order with id ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return order;
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;

    const order = await this.findOne(id);

    if (order.status === status) {
      return order;
    }

    return this.order.update({
      where: { id },
      data: {
        status: status,
      },
    });
  }
}
