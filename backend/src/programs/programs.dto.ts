import { PartialType } from '@nestjs/mapped-types';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { TONES } from '../common/constants';
import { QueryBool, Trim } from '../common/validation';

export class CreateProgramDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Program name is required.' }) @MaxLength(120)
  name: string;

  @IsOptional() @Trim() @Matches(/^[a-z0-9-]*$/, { message: 'Slug may only contain lowercase letters, numbers and hyphens.' }) @MaxLength(80)
  slug?: string;

  @IsOptional() @Trim() @IsString() @MaxLength(80) category?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(80) ageGroup?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(80) level?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(400) summary?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(4000) introduction?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(12) @IsString({ each: true }) @MaxLength(200, { each: true })
  objectives?: string[];

  @IsOptional() @Trim() @IsString() @MaxLength(4000) activities?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(300) image?: string;
  @IsOptional() @IsIn(TONES) tone?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isPlaceholder?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateProgramDto extends PartialType(CreateProgramDto) {}

export class ProgramQueryDto {
  @IsOptional() @IsString() @MaxLength(80) category?: string;
  @IsOptional() @IsString() @MaxLength(80) ageGroup?: string;
  @IsOptional() @IsString() @MaxLength(80) level?: string;
  @IsOptional() @IsString() @MaxLength(80) q?: string;
  @IsOptional() @QueryBool() @IsBoolean() featured?: boolean;
}
