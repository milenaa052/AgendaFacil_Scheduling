import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('AgendaFacil - API de Agendamento')
    .setDescription('API para gerenciamento de agendamentos de clientes e empresas')
    .setVersion('1.0')
    .addTag('Agendamento de Clientes', 'Endpoints para criação e gerenciamento de agendamentos de clientes')
    .addTag('Agendamento de Empresas', 'Endpoints para gerenciamento de agendamentos das empresas')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT de autenticação',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'AgendaFacil API',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  await app.listen(3000, '0.0.0.0');
  console.log(`🚀 Aplicação rodando em: http://localhost:3000`);
  console.log(`📚 Documentação Swagger em: http://localhost:3000/api/docs`);
}

bootstrap();