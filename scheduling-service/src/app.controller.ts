import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Sistema')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Verifica se o serviço de agendamento está ativo'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Serviço está funcionando',
    schema: {
      example: {
        message: 'Scheduling Service is running!',
        status: 'ok',
        timestamp: '2025-11-26T02:32:27.000Z'
      }
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
