import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { ContactModule } from './contact/contact.module';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { InstructorsModule } from './instructors/instructors.module';
import { ProgramsModule } from './programs/programs.module';
import { ResourcesModule } from './resources/resources.module';
import { SettingsModule } from './settings/settings.module';
import { SiteContentModule } from './site-content/site-content.module';

@Module({
  imports: [
    DatabaseModule,
    SettingsModule,
    ProgramsModule,
    InstructorsModule,
    ResourcesModule,
    EventsModule,
    SiteContentModule,
    InquiriesModule,
    ContactModule,
    AdminModule,
  ],
})
export class AppModule {}
