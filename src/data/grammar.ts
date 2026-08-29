export interface Example {
  sv: string
  en: string
  /** Optional pointer at what the example is actually demonstrating. */
  note?: string
}

export interface Section {
  heading: string
  body: string
  examples?: Example[]
}

export interface QuizQuestion {
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

export interface Lesson {
  id: string
  title: string
  /** One line shown in the lesson list. */
  summary: string
  /** Rough ordering of difficulty; lessons are presented in this order. */
  level: 1 | 2 | 3
  sections: Section[]
  quiz: QuizQuestion[]
}

export const LESSONS: Lesson[] = [
  {
    id: 'pronunciation',
    title: 'Sounds and spelling',
    summary: 'The handful of letters that do not say what an English speaker expects.',
    level: 1,
    sections: [
      {
        heading: 'Three extra vowels',
        body:
          'Swedish has 29 letters. The three at the end of the alphabet — å, ä, ö — are separate letters, not decorated versions of a and o. Getting them wrong changes the word.',
        examples: [
          { sv: 'hall / håll / häl', en: 'hall / hold / heel', note: 'Three different words.' },
          { sv: 'mor / mör', en: 'mother / tender', note: 'ö is close to the vowel in English "bird".' },
          { sv: 'år', en: 'year', note: 'å sounds roughly like the "o" in "more".' },
        ],
      },
      {
        heading: 'The sj-sound',
        body:
          'Swedish has a breathy sound with no English equivalent, written many different ways: sj, sk (before e, i, y, ä, ö), stj, skj, ch. Think of blowing out a candle while saying "h". Do not read it as "sk".',
        examples: [
          { sv: 'sju', en: 'seven' },
          { sv: 'skön', en: 'nice, comfortable' },
          { sv: 'stjärna', en: 'star' },
          { sv: 'choklad', en: 'chocolate' },
        ],
      },
      {
        heading: 'The tj-sound',
        body:
          'A softer sound, close to English "sh" or the "ch" in "cheese". Written tj, k (before e, i, y, ä, ö), or kj.',
        examples: [
          { sv: 'tjugo', en: 'twenty' },
          { sv: 'kött', en: 'meat', note: 'k before ö → tj-sound.' },
          { sv: 'kaffe', en: 'coffee', note: 'k before a stays a hard k.' },
        ],
      },
      {
        heading: 'Silent letters',
        body:
          'A few clusters lose their first letter: hj, lj, dj, gj all begin with a plain "y" sound. And "g" before a front vowel becomes "y".',
        examples: [
          { sv: 'hjälp', en: 'help', note: 'Said "yelp".' },
          { sv: 'ljus', en: 'light', note: 'Said "yoos".' },
          { sv: 'ge', en: 'give', note: 'Said "yeh".' },
          { sv: 'och', en: 'and', note: 'Usually just "å" in speech — the ch disappears.' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'How is the "sk" in "skön" pronounced?',
        options: ['Like "sk" in "skin"', 'Like the breathy sj-sound', 'Like "sh" in "ship"', 'It is silent'],
        answer: 1,
        explanation: 'sk before a front vowel (e, i, y, ä, ö) becomes the sj-sound. Before a, o, u, å it stays a hard "sk", as in "skola".',
      },
      {
        prompt: 'Which pair are two genuinely different words?',
        options: ['hall / håll', 'kaffe / kaffé', 'hej / hej', 'tack / tack'],
        answer: 0,
        explanation: 'å is its own letter, so "hall" (hall) and "håll" (hold) are unrelated words. Treating å as a variant of a will make you mishear them.',
      },
      {
        prompt: 'How does "hjälp" begin?',
        options: ['With an h sound', 'With a y sound', 'With a hard j as in "jam"', 'With an sh sound'],
        answer: 1,
        explanation: 'In hj, lj, dj and gj the first letter is silent and the cluster is pronounced as "y". So "hjälp" sounds like "yelp".',
      },
    ],
  },

  {
    id: 'en-ett',
    title: 'en and ett — the two genders',
    summary: 'Every Swedish noun is either an en-word or an ett-word. Learn the gender with the word.',
    level: 1,
    sections: [
      {
        heading: 'Two words for "a"',
        body:
          'Swedish nouns come in two genders, called common and neuter. Common nouns take "en", neuter nouns take "ett". About 75% of nouns are en-words, so if you are forced to guess, guess "en" — but guessing is a bad habit. The gender decides the plural ending, the definite ending and the adjective ending, so a wrong gender ripples through the whole sentence.',
        examples: [
          { sv: 'en bil', en: 'a car' },
          { sv: 'en stol', en: 'a chair' },
          { sv: 'ett hus', en: 'a house' },
          { sv: 'ett bord', en: 'a table' },
        ],
      },
      {
        heading: 'There is no reliable rule',
        body:
          'Gender is not predictable from meaning or spelling. "En kniv" but "ett bord"; "en dag" but "ett år". Two useful tendencies: people and animals are almost always en-words, and nouns ending in -ing, -het, -else, -a are en-words. Everything else must simply be memorised as a pair.',
        examples: [
          { sv: 'en kvinna, en hund, en lärare', en: 'a woman, a dog, a teacher', note: 'Living things → en.' },
          { sv: 'en tidning, en möjlighet', en: 'a newspaper, a possibility', note: '-ing and -het → en.' },
          { sv: 'ett barn', en: 'a child', note: 'A famous exception — a person, but neuter.' },
        ],
      },
      {
        heading: 'Always learn the article',
        body:
          'When you meet a new noun, store it as "ett bord", never as "bord". This is why the flashcards in this app always show the article on the front. It costs nothing now and saves a lot of repair work later.',
      },
    ],
    quiz: [
      {
        prompt: 'Which is correct?',
        options: ['en hus', 'ett hus', 'en huset', 'ett husen'],
        answer: 1,
        explanation: '"Hus" is a neuter noun, so it takes "ett": ett hus.',
      },
      {
        prompt: 'Roughly what share of Swedish nouns are en-words?',
        options: ['About 25%', 'About half', 'About 75%', 'Almost all of them'],
        answer: 2,
        explanation: 'Around three quarters are en-words. That makes "en" the better blind guess, but the gender still has to be learned per word.',
      },
      {
        prompt: 'Why does the gender matter beyond the word for "a"?',
        options: [
          'It does not — it only affects en/ett',
          'It decides the definite ending, the plural ending and the adjective form',
          'It decides the word order',
          'It only matters in writing',
        ],
        answer: 1,
        explanation: 'Gender propagates: ett hus → huset → husen → ett stort hus. Getting it wrong at the start makes everything downstream wrong too.',
      },
      {
        prompt: 'Which noun is the odd one out?',
        options: ['en kvinna', 'en hund', 'ett barn', 'en lärare'],
        answer: 2,
        explanation: 'Living things are normally en-words, but "barn" (child) is neuter: ett barn. It is the classic exception.',
      },
    ],
  },

  {
    id: 'definite',
    title: 'The definite form is a suffix',
    summary: 'Swedish has no separate word for "the" — it sticks onto the end of the noun.',
    level: 1,
    sections: [
      {
        heading: 'Glue it to the end',
        body:
          'Where English puts "the" in front, Swedish adds an ending. For en-words add -en (or just -n if the word already ends in a vowel). For ett-words add -et (or just -t after a vowel).',
        examples: [
          { sv: 'en bil → bilen', en: 'a car → the car' },
          { sv: 'en flicka → flickan', en: 'a girl → the girl', note: 'Ends in a vowel, so only -n.' },
          { sv: 'ett hus → huset', en: 'a house → the house' },
          { sv: 'ett äpple → äpplet', en: 'an apple → the apple', note: 'Ends in a vowel, so only -t.' },
        ],
      },
      {
        heading: 'The definite plural',
        body:
          'Plurals get their own definite ending: -na for most en-words, -en for ett-words that do not change in the plural.',
        examples: [
          { sv: 'bilar → bilarna', en: 'cars → the cars' },
          { sv: 'flickor → flickorna', en: 'girls → the girls' },
          { sv: 'hus → husen', en: 'houses → the houses' },
          { sv: 'barn → barnen', en: 'children → the children' },
        ],
      },
      {
        heading: 'The double definite',
        body:
          'When an adjective is involved, Swedish marks "the" twice — once with the word "den/det/de" in front, and once with the suffix still on the noun. English speakers routinely drop one half. Keep both.',
        examples: [
          { sv: 'den stora bilen', en: 'the big car', note: 'den … + …en' },
          { sv: 'det stora huset', en: 'the big house', note: 'det … + …et' },
          { sv: 'de stora husen', en: 'the big houses', note: 'de … + …en' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'How do you say "the table" (ett bord)?',
        options: ['den bord', 'bordet', 'borden', 'det bord'],
        answer: 1,
        explanation: 'Neuter noun, so add -et: bordet. There is no separate word for "the".',
      },
      {
        prompt: 'What is "the girl", from "en flicka"?',
        options: ['flickaen', 'flickan', 'flickat', 'den flicka'],
        answer: 1,
        explanation: '"Flicka" already ends in a vowel, so it takes only -n: flickan.',
      },
      {
        prompt: 'Which is the correct way to say "the big house"?',
        options: ['stora huset', 'det stora hus', 'det stora huset', 'det stor huset'],
        answer: 2,
        explanation: 'The double definite: "det" in front AND -et on the noun, with the adjective in its -a form.',
      },
      {
        prompt: 'What is "the children" (ett barn, plural barn)?',
        options: ['barnna', 'barnen', 'barnerna', 'barnet'],
        answer: 1,
        explanation: 'Ett-words with an unchanged plural take -en in the definite plural: barn → barnen.',
      },
    ],
  },

  {
    id: 'plurals',
    title: 'Plurals',
    summary: 'Five plural patterns, and how the gender narrows the choice.',
    level: 2,
    sections: [
      {
        heading: 'Five endings',
        body:
          'Swedish plurals fall into five groups. You cannot always predict which, but gender rules out several options, which is another reason to learn en/ett with the word.',
        examples: [
          { sv: 'en flicka → flickor', en: 'girl → girls', note: '1: en-words ending in -a swap it for -or.' },
          { sv: 'en bil → bilar', en: 'car → cars', note: '2: many en-words take -ar.' },
          { sv: 'en tidning → tidningar', en: 'newspaper → newspapers', note: '2: -ing always takes -ar.' },
          { sv: 'en elev → elever', en: 'pupil → pupils', note: '3: -er, common in loanwords.' },
          { sv: 'ett äpple → äpplen', en: 'apple → apples', note: '4: ett-words ending in a vowel take -n.' },
          { sv: 'ett hus → hus', en: 'house → houses', note: '5: ett-words ending in a consonant often do not change at all.' },
        ],
      },
      {
        heading: 'The useful shortcut',
        body:
          'If it is an ett-word ending in a consonant, the plural is very often identical to the singular. "Ett barn, två barn. Ett hus, två hus." This catches a large slice of neuter nouns.',
        examples: [
          { sv: 'ett bord, två bord', en: 'one table, two tables' },
          { sv: 'ett rum, två rum', en: 'one room, two rooms' },
        ],
      },
      {
        heading: 'Irregulars worth knowing now',
        body:
          'A small set of very common nouns change their vowel instead of, or as well as, taking an ending. There are only a handful and they come up constantly.',
        examples: [
          { sv: 'en man → män', en: 'man → men' },
          { sv: 'en bok → böcker', en: 'book → books' },
          { sv: 'en stad → städer', en: 'city → cities' },
          { sv: 'en hand → händer', en: 'hand → hands' },
          { sv: 'ett land → länder', en: 'country → countries' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'What is the plural of "en flicka"?',
        options: ['flickar', 'flickor', 'flickner', 'flicka'],
        answer: 1,
        explanation: 'En-words ending in -a drop it and take -or: flicka → flickor.',
      },
      {
        prompt: 'What is the plural of "ett hus"?',
        options: ['husar', 'huser', 'hus', 'husen'],
        answer: 2,
        explanation: 'Ett-words ending in a consonant usually stay unchanged: ett hus, två hus. ("Husen" is the definite plural — "the houses".)',
      },
      {
        prompt: 'What is the plural of "en bok"?',
        options: ['bokar', 'boker', 'böcker', 'bok'],
        answer: 2,
        explanation: 'Irregular: the vowel changes and it takes -er. bok → böcker.',
      },
      {
        prompt: 'Every noun ending in -ing takes which plural ending?',
        options: ['-or', '-ar', '-er', '-n'],
        answer: 1,
        explanation: '-ing nouns are reliably en-words taking -ar: en tidning → tidningar, en övning → övningar. One of the few rules with no exceptions.',
      },
    ],
  },

  {
    id: 'verbs-present',
    title: 'Verbs in the present — the easy part',
    summary: 'One form for every person. No conjugation tables at all.',
    level: 1,
    sections: [
      {
        heading: 'The verb never changes',
        body:
          'This is where Swedish is much easier than English, French or German. The present tense has exactly one form, no matter who is doing it. There is no "-s" for he/she, no separate plural.',
        examples: [
          { sv: 'jag talar', en: 'I speak' },
          { sv: 'du talar', en: 'you speak' },
          { sv: 'han/hon talar', en: 'he/she speaks', note: 'Still "talar" — no extra ending.' },
          { sv: 'vi/ni/de talar', en: 'we/you/they speak' },
        ],
      },
      {
        heading: 'No continuous tense either',
        body:
          'Swedish does not distinguish "I speak" from "I am speaking". One present tense covers both. So "jag äter" is "I eat" and "I am eating", decided by context.',
        examples: [
          { sv: 'Jag äter frukost.', en: 'I eat breakfast. / I am eating breakfast.' },
          { sv: 'Vad gör du?', en: 'What do you do? / What are you doing?' },
        ],
      },
      {
        heading: 'Forming the present',
        body:
          'Most verbs take -r on the infinitive (group 1 and 3), or -er on the stem (group 2). The dictionary form is written with "att" — "att tala", like English "to speak".',
        examples: [
          { sv: 'att tala → talar', en: 'to speak → speak(s)', note: 'Group 1: -ar. The biggest and most regular group.' },
          { sv: 'att köpa → köper', en: 'to buy → buy(s)', note: 'Group 2: stem + -er.' },
          { sv: 'att bo → bor', en: 'to live → live(s)', note: 'Group 3: short verb + -r.' },
          { sv: 'att vara → är', en: 'to be → is/am/are', note: 'Irregular, and the most common verb in the language.' },
        ],
      },
      {
        heading: 'No "do" for questions or negatives',
        body:
          'English inserts "do" to ask questions and to negate. Swedish does neither — it moves the verb, or adds "inte" after it.',
        examples: [
          { sv: 'Talar du svenska?', en: 'Do you speak Swedish?', note: 'Verb first. No "do".' },
          { sv: 'Jag talar inte svenska.', en: 'I do not speak Swedish.', note: '"inte" after the verb.' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'How do you say "she speaks"?',
        options: ['hon talars', 'hon talar', 'hon tala', 'hon är talar'],
        answer: 1,
        explanation: 'The present tense has one form for every person. No -s is added for he/she.',
      },
      {
        prompt: 'How do you say "I am eating"?',
        options: ['Jag är äter', 'Jag är ätande', 'Jag äter', 'Jag gör äta'],
        answer: 2,
        explanation: 'Swedish has no continuous tense. "Jag äter" covers both "I eat" and "I am eating".',
      },
      {
        prompt: 'How do you say "Do you speak Swedish?"',
        options: ['Gör du tala svenska?', 'Du talar svenska?', 'Talar du svenska?', 'Är du talar svenska?'],
        answer: 2,
        explanation: 'There is no auxiliary "do". Move the verb in front of the subject: Talar du svenska?',
      },
      {
        prompt: 'What is the present tense of "att vara"?',
        options: ['varar', 'är', 'var', 'varit'],
        answer: 1,
        explanation: '"Att vara" is irregular: är (present), var (past), varit (supine).',
      },
    ],
  },

  {
    id: 'v2',
    title: 'The V2 rule — the verb comes second',
    summary: 'The single most important word-order rule in Swedish, and the one English speakers break most.',
    level: 2,
    sections: [
      {
        heading: 'Position two, always',
        body:
          'In a Swedish main clause the finite verb must be the second element. Not the second word — the second slot. Whatever you put in the first slot, the verb follows immediately.',
        examples: [
          { sv: 'Jag dricker kaffe på morgonen.', en: 'I drink coffee in the morning.', note: 'Slot 1 = jag, slot 2 = dricker.' },
          { sv: 'På morgonen dricker jag kaffe.', en: 'In the morning I drink coffee.', note: 'Slot 1 = på morgonen, so the verb still comes next and the subject moves behind it.' },
        ],
      },
      {
        heading: 'The inversion English speakers forget',
        body:
          'This is the classic mistake. If you start the sentence with anything other than the subject — a time expression, a place, an object — the subject must jump behind the verb. English does not do this, so it has to become a reflex.',
        examples: [
          { sv: 'Idag äter jag fisk.', en: 'Today I eat fish.', note: 'Correct.' },
          { sv: 'Idag jag äter fisk.', en: '(wrong)', note: 'Wrong — the verb has been pushed to slot three.' },
          { sv: 'Nu förstår jag.', en: 'Now I understand.' },
          { sv: 'I Sverige bor många människor.', en: 'In Sweden many people live.' },
        ],
      },
      {
        heading: 'Why fronting is worth it',
        body:
          'Swedish fronts things far more freely than English, because the V2 rule keeps the sentence unambiguous. Putting the time or place first is completely normal, not poetic. You just have to pay for it with the inversion.',
        examples: [
          { sv: 'Kaffe dricker jag varje dag.', en: 'Coffee, I drink every day.', note: 'Even the object can lead.' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'Which sentence is correct?',
        options: ['Imorgon jag åker till Stockholm.', 'Imorgon åker jag till Stockholm.', 'Imorgon åker till Stockholm jag.', 'Jag imorgon åker till Stockholm.'],
        answer: 1,
        explanation: '"Imorgon" fills slot 1, so the verb "åker" must come next and the subject "jag" moves behind it.',
      },
      {
        prompt: 'In "På morgonen dricker jag kaffe", why does "jag" come after the verb?',
        options: [
          'Because it is a question',
          'Because the first slot is taken by "på morgonen", and the verb must hold slot two',
          'Because "dricker" is irregular',
          'It is a stylistic choice — both orders are fine',
        ],
        answer: 1,
        explanation: 'The V2 rule is not optional. Anything fronted into slot 1 forces the subject behind the verb.',
      },
      {
        prompt: 'Where does the finite verb go in a Swedish main clause?',
        options: ['Always the first word', 'Always the second element', 'Always last', 'Anywhere — word order is free'],
        answer: 1,
        explanation: 'Second element. The first element can be one word or a whole phrase, but the verb comes straight after it.',
      },
    ],
  },

  {
    id: 'negation',
    title: 'Saying no — "inte"',
    summary: 'One word for "not", and one placement rule that flips in subordinate clauses.',
    level: 2,
    sections: [
      {
        heading: 'After the verb',
        body:
          'In a main clause, "inte" goes directly after the finite verb. No "do" is added, unlike English.',
        examples: [
          { sv: 'Jag förstår inte.', en: 'I do not understand.' },
          { sv: 'Han bor inte i Stockholm.', en: 'He does not live in Stockholm.' },
          { sv: 'Vi äter inte kött.', en: 'We do not eat meat.' },
        ],
      },
      {
        heading: 'The BIFF rule',
        body:
          'In a subordinate clause the order flips: "inte" goes BEFORE the verb. Swedes learn this in school as BIFF — "I Bisats kommer Inte Före Första verbet" (in a subordinate clause, "inte" comes before the first verb). Subordinate clauses are the ones introduced by att, som, om, när, för att, eftersom.',
        examples: [
          { sv: 'Jag vet att han inte kommer.', en: 'I know that he is not coming.', note: 'Subordinate → inte before the verb.' },
          { sv: 'Han kommer inte.', en: 'He is not coming.', note: 'Main clause → inte after the verb.' },
          { sv: 'Eftersom jag inte har tid…', en: 'Because I do not have time…' },
        ],
      },
      {
        heading: 'With two verbs',
        body:
          'When there is a helper verb plus an infinitive, "inte" sits between them in a main clause.',
        examples: [
          { sv: 'Jag kan inte simma.', en: 'I cannot swim.' },
          { sv: 'Hon vill inte gå hem.', en: 'She does not want to go home.' },
          { sv: 'Jag har inte sett filmen.', en: 'I have not seen the film.' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'How do you say "I do not speak Swedish"?',
        options: ['Jag inte talar svenska.', 'Jag talar inte svenska.', 'Jag gör inte tala svenska.', 'Inte jag talar svenska.'],
        answer: 1,
        explanation: 'Main clause: "inte" goes straight after the finite verb, and there is no auxiliary "do".',
      },
      {
        prompt: 'Which is correct?',
        options: ['Jag tror att han inte kommer.', 'Jag tror att han kommer inte.', 'Jag tror inte att han kommer inte.', 'Jag tror att inte han kommer.'],
        answer: 0,
        explanation: 'After "att" you are in a subordinate clause, so BIFF applies: "inte" comes before the verb.',
      },
      {
        prompt: 'Where does "inte" go in "Jag kan simma" to make it negative?',
        options: ['Inte jag kan simma', 'Jag inte kan simma', 'Jag kan inte simma', 'Jag kan simma inte'],
        answer: 2,
        explanation: 'Between the modal verb and the infinitive: Jag kan inte simma.',
      },
      {
        prompt: 'What does BIFF stand for?',
        options: [
          'A type of Swedish steak',
          'In a subordinate clause, "inte" comes before the first verb',
          'The verb always comes second',
          'Both genders need articles',
        ],
        answer: 1,
        explanation: '"Bisats — Inte Före Första verbet." (It is also the word for steak, which is exactly why the mnemonic sticks.)',
      },
    ],
  },

  {
    id: 'adjectives',
    title: 'Adjectives agree',
    summary: 'Three forms of every adjective, chosen by gender, number and definiteness.',
    level: 2,
    sections: [
      {
        heading: 'The three forms',
        body:
          'An adjective takes a bare form with en-words, adds -t with ett-words, and adds -a in the plural and in all definite phrases. So each adjective has three shapes to learn: stor / stort / stora.',
        examples: [
          { sv: 'en stor bil', en: 'a big car', note: 'en-word → bare form.' },
          { sv: 'ett stort hus', en: 'a big house', note: 'ett-word → add -t.' },
          { sv: 'stora bilar', en: 'big cars', note: 'plural → add -a.' },
        ],
      },
      {
        heading: 'Definite always takes -a',
        body:
          'Once the phrase is definite, the adjective takes -a regardless of gender or number. This is the same double-definite construction from the earlier lesson.',
        examples: [
          { sv: 'den stora bilen', en: 'the big car' },
          { sv: 'det stora huset', en: 'the big house' },
          { sv: 'de stora bilarna', en: 'the big cars' },
          { sv: 'min stora bil', en: 'my big car', note: 'Possessives count as definite too.' },
        ],
      },
      {
        heading: 'After "är"',
        body:
          'When the adjective comes after the verb rather than before the noun, it still agrees with the subject.',
        examples: [
          { sv: 'Bilen är stor.', en: 'The car is big.' },
          { sv: 'Huset är stort.', en: 'The house is big.' },
          { sv: 'Bilarna är stora.', en: 'The cars are big.' },
        ],
      },
      {
        heading: 'Two to watch',
        body:
          '"Liten" (small) and "gammal" (old) are irregular and extremely common.',
        examples: [
          { sv: 'en liten bil / ett litet hus / små bilar', en: 'a small car / a small house / small cars', note: 'The plural is "små", not "litena".' },
          { sv: 'en gammal man / ett gammalt hus / gamla hus', en: 'an old man / an old house / old houses' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'How do you say "a big house" (ett hus)?',
        options: ['en stor hus', 'ett stor hus', 'ett stort hus', 'ett stora hus'],
        answer: 2,
        explanation: 'Ett-words take the -t form of the adjective: ett stort hus.',
      },
      {
        prompt: 'How do you say "the big car"?',
        options: ['den stor bilen', 'den stora bilen', 'det stora bilen', 'den stora bil'],
        answer: 1,
        explanation: 'Definite phrases take the -a adjective, plus "den" in front and -en on the noun.',
      },
      {
        prompt: 'What is the plural of "liten"?',
        options: ['litena', 'litna', 'små', 'litet'],
        answer: 2,
        explanation: '"Liten" is irregular: liten / litet / små.',
      },
      {
        prompt: '"Huset är ___." (big)',
        options: ['stor', 'stort', 'stora', 'storen'],
        answer: 1,
        explanation: 'The adjective agrees with the subject even after "är". "Huset" is neuter, so: stort.',
      },
    ],
  },

  {
    id: 'past',
    title: 'Talking about the past',
    summary: 'Preteritum for finished events, perfekt for experience and relevance.',
    level: 2,
    sections: [
      {
        heading: 'Preteritum — the simple past',
        body:
          'Use it for something that happened at a definite time in the past. Group 1 verbs add -de to the stem, group 2 add -de or -te, group 3 add -dde. Like the present, there is one form for all persons.',
        examples: [
          { sv: 'Jag talade med henne igår.', en: 'I spoke with her yesterday.' },
          { sv: 'Han köpte en bil.', en: 'He bought a car.' },
          { sv: 'Vi bodde i Malmö.', en: 'We lived in Malmö.' },
        ],
      },
      {
        heading: 'Perfekt — "har" plus the supine',
        body:
          'Use "har" plus a special form called the supine (always ending in -t) for something without a stated time, or still relevant now. This maps closely onto English "have done".',
        examples: [
          { sv: 'Jag har talat med henne.', en: 'I have spoken with her.' },
          { sv: 'Har du ätit?', en: 'Have you eaten?' },
          { sv: 'Jag har aldrig varit i Norge.', en: 'I have never been to Norway.' },
        ],
      },
      {
        heading: 'Choosing between them',
        body:
          'If the sentence names a past time — igår, förra veckan, 2019 — use preteritum. If it does not, perfekt is usually right. The same instinct as English.',
        examples: [
          { sv: 'Jag åt frukost klockan sju.', en: 'I ate breakfast at seven.', note: 'Stated time → preteritum.' },
          { sv: 'Jag har ätit frukost.', en: 'I have eaten breakfast.', note: 'No time, still relevant → perfekt.' },
        ],
      },
      {
        heading: 'The irregulars you cannot avoid',
        body:
          'The most frequent verbs are the most irregular. Learn these four principal parts as a chant: infinitive, present, past, supine.',
        examples: [
          { sv: 'vara — är — var — varit', en: 'be — is — was — been' },
          { sv: 'ha — har — hade — haft', en: 'have — has — had — had' },
          { sv: 'gå — går — gick — gått', en: 'go — goes — went — gone' },
          { sv: 'göra — gör — gjorde — gjort', en: 'do — does — did — done' },
          { sv: 'se — ser — såg — sett', en: 'see — sees — saw — seen' },
          { sv: 'äta — äter — åt — ätit', en: 'eat — eats — ate — eaten' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'Which is right for "I bought a car yesterday"?',
        options: ['Jag har köpt en bil igår.', 'Jag köpte en bil igår.', 'Jag köper en bil igår.', 'Jag hade köpt en bil igår.'],
        answer: 1,
        explanation: '"Igår" names a definite past time, so preteritum: köpte.',
      },
      {
        prompt: 'What is the supine of "att äta"?',
        options: ['åt', 'äter', 'ätit', 'ätade'],
        answer: 2,
        explanation: 'The supine always ends in -t and is used after "har": jag har ätit.',
      },
      {
        prompt: 'How do you say "Have you eaten?"',
        options: ['Åt du?', 'Har du ätit?', 'Har du åt?', 'Du har ätit?'],
        answer: 1,
        explanation: 'Perfekt = har + supine, with the verb fronted to make it a question: Har du ätit?',
      },
      {
        prompt: 'The past tense of "att gå" is:',
        options: ['gådde', 'gick', 'gått', 'gålde'],
        answer: 1,
        explanation: 'gå — går — gick — gått. "Gått" is the supine, used after "har".',
      },
    ],
  },

  {
    id: 'modals',
    title: 'Modal verbs',
    summary: 'kan, vill, ska, måste, får — and the infinitive that follows without "att".',
    level: 2,
    sections: [
      {
        heading: 'No "att" after a modal',
        body:
          'Modal verbs are followed by a bare infinitive. Do not insert "att" — this is the mirror image of English, which drops "to" after "can" and "must" but keeps it elsewhere.',
        examples: [
          { sv: 'Jag kan simma.', en: 'I can swim.' },
          { sv: 'Jag vill åka hem.', en: 'I want to go home.', note: 'No "att" — unlike English "want TO go".' },
          { sv: 'Du måste komma.', en: 'You must come.' },
        ],
      },
      {
        heading: 'The main ones',
        body:
          'These five cover most of what you need at this stage.',
        examples: [
          { sv: 'kan', en: 'can, be able to', note: 'Kan du hjälpa mig? — Can you help me?' },
          { sv: 'vill', en: 'want to', note: 'A false friend: it does not mean "will".' },
          { sv: 'ska', en: 'will, shall, be going to', note: 'This is the future. Jag ska åka. — I am going to go.' },
          { sv: 'måste', en: 'must, have to', note: 'Same form in present and past.' },
          { sv: 'får', en: 'may, be allowed to', note: 'Får jag fråga? — May I ask?' },
        ],
      },
      {
        heading: 'The future',
        body:
          'Swedish has no separate future tense. Use "ska" for intention, "kommer att" for prediction, or just the present with a time word — which is the most common option in speech.',
        examples: [
          { sv: 'Jag ska ringa dig imorgon.', en: 'I am going to call you tomorrow.', note: 'Intention.' },
          { sv: 'Det kommer att regna.', en: 'It is going to rain.', note: 'Prediction. Note "att" is required here.' },
          { sv: 'Jag åker imorgon.', en: 'I am leaving tomorrow.', note: 'Plain present + time word. Perfectly normal.' },
        ],
      },
      {
        heading: '"Vill" is not "will"',
        body:
          'The commonest false friend in the language. "Jag vill" means "I want", not "I will". For "I will", use "jag ska".',
        examples: [
          { sv: 'Jag vill ha kaffe.', en: 'I want coffee.', note: 'Note "vill ha" — literally "want to have".' },
          { sv: 'Jag ska ha kaffe.', en: 'I am going to have coffee.' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'Which is correct for "I want to go home"?',
        options: ['Jag vill att åka hem.', 'Jag vill åka hem.', 'Jag vill åker hem.', 'Jag will åka hem.'],
        answer: 1,
        explanation: 'A modal verb takes a bare infinitive — no "att".',
      },
      {
        prompt: 'What does "Jag vill" mean?',
        options: ['I will', 'I want', 'I can', 'I must'],
        answer: 1,
        explanation: 'The classic false friend. "Vill" = want. For "I will", use "jag ska".',
      },
      {
        prompt: 'How do you say "I want coffee"?',
        options: ['Jag vill kaffe.', 'Jag vill ha kaffe.', 'Jag ska kaffe.', 'Jag vill är kaffe.'],
        answer: 1,
        explanation: '"Vill" needs a verb after it. The idiom is "vill ha" — literally "want to have".',
      },
      {
        prompt: 'Which expresses a prediction, "It is going to rain"?',
        options: ['Det ska regna.', 'Det kommer att regna.', 'Det vill regna.', 'Det måste regna.'],
        answer: 1,
        explanation: '"Kommer att" is for predictions, and it is the one future construction that does keep "att".',
      },
    ],
  },

  {
    id: 'word-order-advanced',
    title: 'Subordinate clauses',
    summary: 'Why the word order changes after att, som, om and när.',
    level: 3,
    sections: [
      {
        heading: 'Main clause vs subordinate clause',
        body:
          'A main clause can stand alone. A subordinate clause cannot — it is introduced by a linking word such as att (that), som (who/which), om (if), när (when), eftersom (because), för att (in order to). The two clause types follow different word-order rules, which is why identifying them matters.',
        examples: [
          { sv: 'Han kommer inte.', en: 'He is not coming.', note: 'Main clause.' },
          { sv: '…att han inte kommer', en: '…that he is not coming', note: 'Subordinate clause.' },
        ],
      },
      {
        heading: 'No V2 inside a subordinate clause',
        body:
          'The V2 rule applies only to main clauses. Inside a subordinate clause the order is fixed: subject, then adverbs like inte/alltid/aldrig, then the verb.',
        examples: [
          { sv: 'Jag vet att hon alltid dricker kaffe.', en: 'I know that she always drinks coffee.', note: 'subject → alltid → verb.' },
          { sv: 'Hon dricker alltid kaffe.', en: 'She always drinks coffee.', note: 'Main clause: verb → alltid.' },
        ],
      },
      {
        heading: 'When the subordinate clause comes first',
        body:
          'A fronted subordinate clause occupies slot 1 of the main clause, so the main verb still has to come immediately after it — with the subject behind. This trips up almost everyone at first.',
        examples: [
          { sv: 'Om det regnar stannar jag hemma.', en: 'If it rains, I will stay at home.', note: 'The whole "om"-clause is slot 1, so "stannar" comes next, then "jag".' },
          { sv: 'När jag var barn bodde vi i Lund.', en: 'When I was a child we lived in Lund.' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'Which is correct?',
        options: [
          'Jag vet att hon dricker alltid kaffe.',
          'Jag vet att hon alltid dricker kaffe.',
          'Jag vet att alltid hon dricker kaffe.',
          'Jag vet alltid att hon dricker kaffe.',
        ],
        answer: 1,
        explanation: 'In a subordinate clause the adverb comes before the verb: hon → alltid → dricker.',
      },
      {
        prompt: 'Complete: "Om det regnar ___ hemma."',
        options: ['jag stannar', 'stannar jag', 'jag stannar inte', 'stannar'],
        answer: 1,
        explanation: 'The "om"-clause fills slot 1 of the main clause, so V2 forces the verb next and the subject behind: stannar jag.',
      },
      {
        prompt: 'Which word does NOT introduce a subordinate clause?',
        options: ['att', 'eftersom', 'men', 'när'],
        answer: 2,
        explanation: '"Men" (but) joins two main clauses, so the word order after it stays main-clause order. att, eftersom and när all start subordinate clauses.',
      },
    ],
  },
]
