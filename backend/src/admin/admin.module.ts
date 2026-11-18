import { Controller, Get, HttpCode, Module, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { CONTACT_METHODS, CONTACT_TOPICS, INQUIRY_STATUSES, MESSAGE_STATUSES, TONES } from '../common/constants';
import { ContactModule, ContactService } from '../contact/contact.module';
import { DatabaseService } from '../database/database.service';
import { EventsModule, EventsService } from '../events/events.module';
import { InquiriesModule, InquiriesService } from '../inquiries/inquiries.module';

@Controller()
export class AdminController {
  constructor(
    private readonly db: DatabaseService,
    private readonly inquiries: InquiriesService,
    private readonly contact: ContactService,
    private readonly events: EventsService,
  ) {}

  /** Lets the dashboard confirm a token before storing it. */
  @Post('auth/verify')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  verify() {
    return { ok: true };
  }

  @Get('admin/stats')
  @UseGuards(AdminGuard)
  stats() {
    const count = (table: string, where = '') => this.db.get<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table} ${where}`)?.n ?? 0;
    return {
      inquiries: this.inquiries.countByStatus(),
      messages: this.contact.countByStatus(),
      programs: count('programs', 'WHERE published = 1'),
      instructors: count('instructors', 'WHERE published = 1'),
      resources: count('resources', 'WHERE published = 1'),
      upcomingEvents: this.events.upcomingCount(),
      placeholders:
        count('programs', 'WHERE is_placeholder = 1') +
        count('instructors', 'WHERE is_placeholder = 1') +
        count('resources', 'WHERE is_placeholder = 1') +
        count('faqs', 'WHERE is_placeholder = 1') +
        count('requirements', 'WHERE is_placeholder = 1'),
    };
  }

  /** Allowed values for select fields in the dashboard. */
  @Get('meta')
  meta() {
    return { tones: TONES, contactMethods: CONTACT_METHODS, contactTopics: CONTACT_TOPICS, inquiryStatuses: INQUIRY_STATUSES, messageStatuses: MESSAGE_STATUSES };
  }

  @Get('health')
  health() {
    return { ok: true, time: new Date().toISOString() };
  }
}

@Module({
  imports: [InquiriesModule, ContactModule, EventsModule],
  controllers: [AdminController],
})
export class AdminModule {}
