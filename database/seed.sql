-- The Learning Loft — initial content.
-- Only the supplied business details are real. Everything else is a clearly marked
-- placeholder (is_placeholder = 1) for the center to replace through the admin dashboard.
-- No testimonials and no events are seeded: the site shows its empty states until real ones exist.

INSERT OR REPLACE INTO settings (key, value) VALUES
  ('site.name',          'The Learning Loft'),
  ('site.tagline',       'Where curiosity grows and learning takes flight.'),
  ('contact.phone',      '+1 (421) 574-7385'),
  ('contact.phoneHref',  '+14215747385'),
  ('contact.email',      'thelearningloft@hotmail.com'),
  ('contact.street',     '1572 Lake Boulevard'),
  ('contact.city',       'Oxnard, CA 93030'),
  ('contact.country',    'USA'),
  ('contact.mapQuery',   '1572 Lake Boulevard, Oxnard, CA 93030'),
  ('contact.hours',      ''),
  ('privacy.url',        '');

INSERT INTO programs (slug, name, category, age_group, level, summary, introduction, objectives, activities, image, tone, featured, sort_order, is_placeholder) VALUES
  ('program-1', '[Program Name 1]', '[Category A]', '[Age group 1]', '[Learning level]', '[Short program description — supplied by The Learning Loft.]', '[Program introduction — a short overview in the center''s own words.]', '["[Objective 1]","[Objective 2]","[Objective 3]"]', '[Examples of what students do in a typical session.]', '/art/art-reading.svg',  'cream', 1, 1, 1),
  ('program-2', '[Program Name 2]', '[Category A]', '[Age group 2]', '[Learning level]', '[Short program description — supplied by The Learning Loft.]', '[Program introduction — a short overview in the center''s own words.]', '["[Objective 1]","[Objective 2]","[Objective 3]"]', '[Examples of what students do in a typical session.]', '/art/art-explore.svg',  'lav',   1, 2, 1),
  ('program-3', '[Program Name 3]', '[Category B]', '[Age group 2]', '[Learning level]', '[Short program description — supplied by The Learning Loft.]', '[Program introduction — a short overview in the center''s own words.]', '["[Objective 1]","[Objective 2]","[Objective 3]"]', '[Examples of what students do in a typical session.]', '/art/art-create.svg',   'yel',   1, 3, 1),
  ('program-4', '[Program Name 4]', '[Category B]', '[Age group 3]', '[Learning level]', '[Short program description — supplied by The Learning Loft.]', '[Program introduction — a short overview in the center''s own words.]', '["[Objective 1]","[Objective 2]","[Objective 3]"]', '[Examples of what students do in a typical session.]', '/art/art-grow.svg',     'sky',   1, 4, 1),
  ('program-5', '[Program Name 5]', '[Category C]', '[Age group 3]', '[Learning level]', '[Short program description — supplied by The Learning Loft.]', '[Program introduction — a short overview in the center''s own words.]', '["[Objective 1]","[Objective 2]","[Objective 3]"]', '[Examples of what students do in a typical session.]', '/art/art-together.svg', 'lav',   0, 5, 1),
  ('program-6', '[Program Name 6]', '[Category C]', '[Age group 3]', '[Learning level]', '[Short program description — supplied by The Learning Loft.]', '[Program introduction — a short overview in the center''s own words.]', '["[Objective 1]","[Objective 2]","[Objective 3]"]', '[Examples of what students do in a typical session.]', '/art/art-notebook.svg', 'cream', 0, 6, 1);

INSERT INTO instructors (slug, name, position, qualification, short_bio, biography, experience, expertise, tone, sort_order, is_placeholder) VALUES
  ('instructor-1', '[Instructor Name 1]', '[Position]', '[Qualification, if supplied]', '[Short biography — two or three sentences approved by the instructor.]', '[Full approved biography.]', '[If supplied]', '[If supplied]', 'lav',   1, 1),
  ('instructor-2', '[Instructor Name 2]', '[Position]', '[Qualification, if supplied]', '[Short biography — two or three sentences approved by the instructor.]', '[Full approved biography.]', '[If supplied]', '[If supplied]', 'sky',   2, 1),
  ('instructor-3', '[Instructor Name 3]', '[Position]', '[Qualification, if supplied]', '[Short biography — two or three sentences approved by the instructor.]', '[Full approved biography.]', '[If supplied]', '[If supplied]', 'yel',   3, 1),
  ('instructor-4', '[Instructor Name 4]', '[Position]', '[Qualification, if supplied]', '[Short biography — two or three sentences approved by the instructor.]', '[Full approved biography.]', '[If supplied]', '[If supplied]', 'cream', 4, 1),
  ('instructor-5', '[Instructor Name 5]', '[Position]', '[Qualification, if supplied]', '[Short biography — two or three sentences approved by the instructor.]', '[Full approved biography.]', '[If supplied]', '[If supplied]', 'sky',   5, 1),
  ('instructor-6', '[Instructor Name 6]', '[Position]', '[Qualification, if supplied]', '[Short biography — two or three sentences approved by the instructor.]', '[Full approved biography.]', '[If supplied]', '[If supplied]', 'lav',   6, 1);

INSERT INTO resources (slug, title, category, summary, body, author, cover, tone, featured, is_placeholder) VALUES
  ('featured-article',  '[Featured article title]',                    'Student Development',    '[Short description of the featured article — one or two sentences.]', '[Opening paragraph — introduce the topic and why it matters to students and families.]

## [Section heading]

[Body paragraph — practical guidance, examples or activities.]

[Closing paragraph and suggested next step.]', '', '/art/art-grow.svg', 'sky', 1, 1),
  ('article-1', '[Article title 1 — Study Resources]',        'Study Resources',        '[Short description — supplied with the article.]', '[Article body — to be supplied.]', '', '/art/art-reading.svg',  'sky',   0, 1),
  ('article-2', '[Article title 2 — Learning Guides]',        'Learning Guides',        '[Short description — supplied with the article.]', '[Article body — to be supplied.]', '', '/art/art-notebook.svg', 'lav',   0, 1),
  ('article-3', '[Article title 3 — Parent Information]',     'Parent Information',     '[Short description — supplied with the article.]', '[Article body — to be supplied.]', '', '/art/art-together.svg', 'cream', 0, 1),
  ('article-4', '[Article title 4 — Educational Activities]', 'Educational Activities', '[Short description — supplied with the article.]', '[Article body — to be supplied.]', '', '/art/art-create.svg',   'yel',   0, 1),
  ('article-5', '[Article title 5 — Student Development]',    'Student Development',    '[Short description — supplied with the article.]', '[Article body — to be supplied.]', '', '/art/art-grow.svg',     'sky',   0, 1),
  ('article-6', '[Article title 6 — Study Resources]',        'Study Resources',        '[Short description — supplied with the article.]', '[Article body — to be supplied.]', '', '/art/art-explore.svg',  'sky',   0, 1),
  ('article-7', '[Article title 7 — Learning Guides]',        'Learning Guides',        '[Short description — supplied with the article.]', '[Article body — to be supplied.]', '', '/art/art-reading.svg',  'lav',   0, 1);

INSERT INTO faqs (question, answer, sort_order, is_placeholder) VALUES
  ('How do I begin enrollment?', 'Start by submitting the enrollment inquiry form on this page, or call +1 (421) 574-7385 or email thelearningloft@hotmail.com. Our team will follow up to discuss next steps.', 1, 0),
  ('Which programs are available?', '[Answer to be supplied — summary of current programs with a link to the Programs page.]', 2, 1),
  ('What ages or grades do you work with?', '[Answer to be supplied — age eligibility for each program.]', 3, 1),
  ('What do I need to register?', '[Answer to be supplied — confirmed registration requirements.]', 4, 1),
  ('Is there space in the program I want?', '[Answer to be supplied — how availability is shared, e.g. after an inquiry.]', 5, 1),
  ('How can I contact the center?', 'Call +1 (421) 574-7385, email thelearningloft@hotmail.com, or visit us at 1572 Lake Boulevard, Oxnard, CA 93030.', 6, 0);

INSERT INTO requirements (title, detail, sort_order, is_placeholder) VALUES
  ('[Required information or document 1]', '[Why it''s needed and how to provide it]', 1, 1),
  ('[Required information or document 2]', '[Why it''s needed and how to provide it]', 2, 1),
  ('[Required information or document 3]', '[Why it''s needed and how to provide it]', 3, 1);
