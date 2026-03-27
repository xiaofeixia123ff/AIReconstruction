import { IsString, IsNotEmpty, IsOptional, IsNumber, MaxLength, Min, Max } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'Role name cannot be empty' })
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Role code cannot be empty' })
  @MaxLength(100)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sort?: number;

  @IsOptional()
  menuIds?: number[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

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
  menuIds?: number[];
}
