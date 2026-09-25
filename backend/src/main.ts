import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Strict request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // OpenAPI Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Panchayat Weather Intelligence API')
    .setDescription(
      'Backend Gateway for Panchayat-level weather intelligence, XGBoost precipitation downscaling, and Split-Conformal uncertainty intervals.\n\n' +
        '**Scientific Notice**: Target variable is ERA5-Land reanalysis reference proxy (0.1°), not physical ground gauge stations. ' +
        'Currently executes retrospective spatial downscaling on historical MERRA-2 block weather proxies.',
    )
    .setVersion('0.1.0')
    .addTag('Predictions', 'Panchayat-level downscaling inference and uncertainty')
    .addTag('Health', 'Backend and service dependency health probes')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = process.env.BACKEND_PORT || process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Panchayat Weather Backend service running on http://localhost:${port}/api`);
  logger.log(`Swagger Documentation: http://localhost:${port}/api/docs`);
  logger.log(`Health endpoint: http://localhost:${port}/api/health`);
}
bootstrap();
