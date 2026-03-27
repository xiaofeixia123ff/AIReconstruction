import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category/category.entity';
import { CategoryService } from './category/category.service';
import { CategoryController } from './category/category.controller';
import { Product } from './product/product.entity';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product])],
  controllers: [CategoryController, ProductController],
  providers: [CategoryService, ProductService],
  exports: [CategoryService, ProductService],
})
export class ProductModule {}
