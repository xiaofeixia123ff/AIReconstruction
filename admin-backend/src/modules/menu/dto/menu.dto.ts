import {
  IsString, IsNotEmpty, IsOptional, IsNumber,
  MaxLength, Min, Max,
} from 'class-validator';

export class CreateMenuDto {
  @IsNumber()
  parentId: number;

  @IsString()
  @IsNotEmpty({ message: 'Menu name cannot be empty' })
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  path?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  component?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  permission?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsNumber()
  @Min(0)
  @Max(2)
  type: number; // 0=directory, 1=menu, 2=button

  @IsOptional()
  @IsNumber()
  @Min(0)
  sort?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  visible?: number;
}

export class UpdateMenuDto {
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  path?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  component?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  permission?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  type?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sort?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  status?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  visible?: number;
}
