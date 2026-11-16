/* courses_data.js - EVERYTHING the university pages show about courses lives here.
   To add a course: copy the British Studies block, change the details, done. It appears automatically on the
   home page, the course finder, its own course page (course.html?c=<slug>) and the application form.
   To add a school: add it to SCHOOLS and use its id in a course's `school`. */
window.UOB = {
  CLOSE: '2026-12-28',               /* applications end on 27 Dec: this is the day AFTER the last day */
  CLOSE_TEXT: '27 December 2026',
  START_TEXT: 'January 2027',
  SCHOOLS: [
    { id: 'biscuits', name: 'School of Biscuits & Brewing', blurb: 'Home to the University\u2019s first course, British Studies.', head: 'Bestie Tristan, Dean' },
  ],
  COURSES: [
    {
      slug: 'british-studies', title: 'British Studies', award: 'BA (Hons)', school: 'biscuits',
      level: 'Level 4', credits: 120, mode: 'Online', start: 'January 2027', fee: 'Nil',
      tagline: 'Learn Britain, one brew at a time.',
      summary: 'A broad, accurate and enjoyable introduction to Britain, its institutions and everyday culture, with a specialist focus on Lancashire, Yorkshire and the friendly rivalry between them.',
      overview: [
        'Start with the map: what the difference between Britain, the UK and England really is. Then move through history and institutions to how people actually behave day to day, before two regional deep dives into the Red Rose and White Rose counties.',
        'Teaching is delivered through twelve short lectures on BestieBoard, each ending with a check-your-understanding quiz. Assessment is practical, oral and exam-based, so there are no essays.'
      ],
      highlights: ['3 modules, 40 credits each', '12 lectures and 4 assessments', 'No essays: practical, oral and exam-based assessment', 'Classified in line with the UK degree system'],
      modules: [
        { code: 'BT1001', title: 'Introduction to Britain', credits: 40, exam: 'Exam 1', weight: 20,
          summary: 'The foundation for everything else: geography, history, institutions and everyday culture, including the often-misunderstood difference between Britain, the UK and England.',
          lectures: [['The Lay of the Land', 'Geography, the four nations, counties and the North/South divide'], ['A Very Quick History', 'Romans to the modern day'], ['How Britain Works', 'Monarchy, Parliament, the NHS'], ['Everyday Britain', 'Tea, queuing, pubs, sarcasm, and what "not bad" really means']],
          outcomes: ['Distinguish the four nations and their relationship', 'Outline the key periods of British history', 'Interpret everyday etiquette and idiom'],
          assessed: ['Make a Proper Brew (practical)', 'What Would a Brit Say? (exam)'] },
        { code: 'BT1002', title: 'Lancashire', credits: 40, exam: 'Exam 2', weight: 20,
          summary: 'The Red Rose county: its borders and identity, its central role in the Industrial Revolution, its food, football and folk traditions, and its dialect.',
          lectures: [['The Red Rose County', 'Borders, the Duchy and Lancashire Day on 27 November'], ['Cotton, Mills & the North', 'How Lancashire powered the modern world'], ['Food, Football and Folk', 'Hotpot, Lancashire cheese, Eccles cakes'], ['Speaking Lancashire', 'Dialect, and the correct use of "love"']],
          outcomes: ['Describe the historic county and its identity', 'Explain the role of cotton and the mills', 'Translate common Lancashire dialect'],
          assessed: ['Spot the Lancastrian (practical)', 'Dialect Translation (exam)'] },
        { code: 'BT1003', title: 'Yorkshire', credits: 40, exam: 'Exam 3', weight: 20,
          summary: 'The White Rose county: the largest historic county in England, its rivalry with Lancashire, its food and traditions, and its dialect, treated comparatively.',
          lectures: [['The White Rose County', 'The Ridings, the Dales and Yorkshire Day on 1 August'], ['The Great Rivalry', 'From the Wars of the Roses to modern-day banter'], ['Puddings, Tea and Pride', 'Yorkshire pudding, Yorkshire Tea, local pride'], ['Speaking Yorkshire', 'Dialect, and how it compares with Lancashire']],
          outcomes: ['Describe Yorkshire and its identity', 'Explain the Wars of the Roses and modern rivalry', 'Compare Lancashire and Yorkshire culture'],
          assessed: ['Pick a Side (practical)', 'Yorkshire dialect (oral exam)'] },
      ],
      finalExam: { title: 'Final Exam', weight: 40, text: 'A mixed exam across all three modules. The pass mark is 40%.' },
      assessmentNote: 'Marks are combined using the weightings above and classified in line with the UK system: First 70%+, 2:1 60%+, 2:2 50%+, Third 40%+. Feedback follows every assessment, and resits are supported with additional biscuits.',
      entry: ['No prior knowledge of Britain required', 'A willingness to learn', 'A working relationship with tea', 'A tolerance for biscuits'],
      entryNote: 'Applicants who have already attempted Lancashire dialect will be considered favourably.',
      feeNote: 'There are no fees. The University is funded by the ventures of PROTEIN BESTIES™, and library, IT and support services are included. The University accepts donations in biscuits, though this is entirely optional.',
      staff: [{ name: 'Bestie Tristan', role: 'Module leader, all modules (BT1003 under protest)' }],
    },
  ],
  STAFF: [
    { name: 'Becky the Spring Chicken', role: 'Chancellor', text: 'Ceremonial head of the University. Office hours: whenever perched.', ini: 'B' },
    { name: 'Bestie Tristan, First Class Bestie', role: 'Vice-Chancellor & Dean', text: 'Leads the University and the School of Biscuits & Brewing. Office hours: by message, any time.', ini: 'T' },
    { name: 'Vacant', role: 'Head of Biscuits', text: 'Responsible for biscuit policy and tin security. Applications via the tin.', ini: '?', vacant: true },
  ],
  SUPPORT: [
    ['BestieBoard', 'Library & learning', 'All lectures, exams, results and archived materials, available around the clock.'],
    ['Dean\u2019s Office', 'Academic & personal support', 'Contact by message at any time; expect a reply with a brew.'],
    ['The Biscuit Tin', 'Hardship fund', 'Emergency biscuit support for students in genuine need.'],
    ['Tea & Friendship', 'Wellbeing', 'A good chat and a hot drink. Talk to someone if you are struggling.'],
  ],
};
