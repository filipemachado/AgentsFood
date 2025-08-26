import { IsString, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WhatsAppContactDto {
  @ApiProperty()
  @IsString()
  profile: {
    name: string;
  };

  @ApiProperty()
  @IsString()
  wa_id: string;
}

export class WhatsAppTextDto {
  @ApiProperty()
  @IsString()
  body: string;
}

export class WhatsAppMessageDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  from: string;

  @ApiProperty()
  @IsString()
  timestamp: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppTextDto)
  text?: WhatsAppTextDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  image?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  audio?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  video?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  document?: any;
}

export class WhatsAppChangeDto {
  @ApiProperty()
  @IsString()
  field: string;

  @ApiProperty()
  @IsObject()
  value: {
    messaging_product: string;
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts?: WhatsAppContactDto[];
    messages?: WhatsAppMessageDto[];
  };
}

export class WhatsAppEntryDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppChangeDto)
  changes: WhatsAppChangeDto[];
}

export class WhatsAppWebhookDto {
  @ApiProperty()
  @IsString()
  object: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppEntryDto)
  entry: WhatsAppEntryDto[];
}

export class SendMessageDto {
  @ApiProperty({ example: '5511999999999' })
  @IsString()
  to: string;

  @ApiProperty({ example: 'Olá! Como posso ajudá-lo hoje?' })
  @IsString()
  message: string;
}

export class WhatsAppConfigDto {
  @ApiProperty({ example: '1234567890' })
  @IsOptional()
  @IsString()
  whatsappPhoneNumberId?: string;

  @ApiProperty({ example: '987654321' })
  @IsOptional()
  @IsString()
  whatsappBusinessAccountId?: string;

  @ApiProperty({ example: 'EAAxxxxxxxxxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString()
  whatsappToken?: string;
}

export class TestConnectionDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  phoneNumberId: string;

  @ApiProperty({ example: 'EAAxxxxxxxxxxxxxxxxxxxxxx' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: '987654321' })
  @IsOptional()
  @IsString()
  businessAccountId?: string;
}