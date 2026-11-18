import { Body, Controller, Get, Injectable, Module, Put, UseGuards } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { AdminGuard } from '../common/admin.guard';
import { Trim } from '../common/validation';
import { DatabaseService } from '../database/database.service';

/** DTO field → settings key. */
const KEYS = {
  name: 'site.name',
  tagline: 'site.tagline',
  phone: 'contact.phone',
  phoneHref: 'contact.phoneHref',
  email: 'contact.email',
  street: 'contact.street',
  city: 'contact.city',
  country: 'contact.country',
  mapQuery: 'contact.mapQuery',
  hours: 'contact.hours',
  privacyUrl: 'privacy.url',
} as const;
type SettingField = keyof typeof KEYS;

export class UpdateSettingsDto {
  @IsOptional() @Trim() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(200) tagline?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(20) phoneHref?: string;
  @IsOptional() @Trim() @IsEmail({}, { message: 'Enter a valid email address.' }) email?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(160) street?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(160) city?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(80) country?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(200) mapQuery?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(400) hours?: string;
  @IsOptional() @Trim() @ValidateIf((_, v) => v !== '') @IsString() @MaxLength(300) privacyUrl?: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  email: string;
  street: string;
  city: string;
  country: string;
  mapQuery: string;
  hours: string;
  privacyUrl: string;
  mapsUrl: string;
  directionsUrl: string;
}

@Injectable()
export class SettingsService {
  constructor(private readonly db: DatabaseService) {}

  get(): SiteSettings {
    const rows = this.db.all<{ key: string; value: string }>('SELECT key, value FROM settings');
    const byKey = new Map(rows.map((r) => [r.key, r.value]));
    const out = {} as SiteSettings;
    for (const [field, key] of Object.entries(KEYS) as [SettingField, string][]) out[field] = byKey.get(key) ?? '';
    const q = encodeURIComponent(out.mapQuery || `${out.street}, ${out.city}`);
    out.mapsUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;
    out.directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
    return out;
  }

  update(dto: UpdateSettingsDto): SiteSettings {
    this.db.transaction(() => {
      for (const [field, key] of Object.entries(KEYS) as [SettingField, string][]) {
        const value = dto[field];
        if (value === undefined) continue;
        this.db.run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]);
      }
    });
    return this.get();
  }
}

@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('site')
  site() {
    return this.settings.get();
  }

  @Put('admin/site')
  @UseGuards(AdminGuard)
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }
}

@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
