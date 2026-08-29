export interface Theme {
  id: string
  title: string
  icon: string
  /** Shown on the theme card. */
  description: string
  /**
   * Dropped into the system prompt to set the scene. Written as an instruction
   * to the tutor, describing the role it should play.
   */
  setting: string
  /** The tutor's first line, so the conversation starts without the user having to. */
  opener: string
  /** Phrases surfaced as a cheat sheet while this theme is active. */
  phrases: { sv: string; en: string }[]
}

export const FREE_TALK: Theme = {
  id: 'free',
  title: 'Free conversation',
  icon: '💬',
  description: 'No script. Talk about whatever you like and I will follow you.',
  setting:
    'There is no fixed scenario. Follow the learner wherever they want to go, and if they run dry, ask them an easy open question about their day, their interests, or their plans.',
  opener: 'Hej! Vad kul att prata med dig. Hur mår du idag?',
  phrases: [
    { sv: 'Jag vet inte.', en: "I don't know." },
    { sv: 'Vad betyder det?', en: 'What does that mean?' },
    { sv: 'Kan du säga det igen?', en: 'Can you say that again?' },
    { sv: 'Hur säger man … på svenska?', en: 'How do you say … in Swedish?' },
  ],
}

export const THEMES: Theme[] = [
  FREE_TALK,
  {
    id: 'cafe',
    title: 'At the café',
    icon: '☕',
    description: 'Order a coffee and a bun, ask the price, pay.',
    setting:
      'You are a friendly barista in a Stockholm café. The learner is a customer. Take their order, suggest something, tell them the price, and handle the payment. Keep the transaction moving.',
    opener: 'Hej och välkommen! Vad får det lov att vara?',
    phrases: [
      { sv: 'Jag skulle vilja ha en kaffe, tack.', en: 'I would like a coffee, please.' },
      { sv: 'Har ni kanelbullar?', en: 'Do you have cinnamon buns?' },
      { sv: 'Hur mycket kostar det?', en: 'How much does it cost?' },
      { sv: 'Kan jag betala med kort?', en: 'Can I pay by card?' },
      { sv: 'Ta med eller äta här?', en: 'Take away or eat in?' },
    ],
  },
  {
    id: 'directions',
    title: 'Asking for directions',
    icon: '🧭',
    description: 'You are lost in town and need to find the station.',
    setting:
      'You are a helpful passer-by on a street in Gothenburg. The learner is a lost tourist. Give them simple directions with left, right and straight ahead, and mention landmarks.',
    opener: 'Hej! Du ser lite vilsen ut. Kan jag hjälpa dig?',
    phrases: [
      { sv: 'Ursäkta, var ligger stationen?', en: 'Excuse me, where is the station?' },
      { sv: 'Hur kommer jag till centrum?', en: 'How do I get to the centre?' },
      { sv: 'Är det långt härifrån?', en: 'Is it far from here?' },
      { sv: 'Till vänster / till höger / rakt fram', en: 'To the left / to the right / straight ahead' },
      { sv: 'Jag har gått vilse.', en: 'I am lost.' },
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping',
    icon: '🛒',
    description: 'Buy groceries or clothes, ask about sizes and prices.',
    setting:
      'You are a shop assistant. The learner is a customer looking for something. Ask what they need, offer sizes or colours or quantities, and give prices in kronor.',
    opener: 'Hej! Behöver du hjälp med något?',
    phrases: [
      { sv: 'Jag letar efter …', en: 'I am looking for …' },
      { sv: 'Har ni den här i en större storlek?', en: 'Do you have this in a bigger size?' },
      { sv: 'Vad kostar den?', en: 'What does it cost?' },
      { sv: 'Jag tar den, tack.', en: 'I will take it, thanks.' },
      { sv: 'Jag tittar bara, tack.', en: 'I am just looking, thanks.' },
    ],
  },
  {
    id: 'restaurant',
    title: 'At the restaurant',
    icon: '🍽️',
    description: 'Book a table, order a meal, ask for the bill.',
    setting:
      'You are a waiter at a Swedish restaurant. Seat the learner, take their order, recommend a dish, ask about drinks, and eventually bring the bill.',
    opener: 'God kväll! Har ni bokat bord?',
    phrases: [
      { sv: 'Ett bord för två, tack.', en: 'A table for two, please.' },
      { sv: 'Kan jag få se menyn?', en: 'Can I see the menu?' },
      { sv: 'Vad rekommenderar du?', en: 'What do you recommend?' },
      { sv: 'Jag är vegetarian.', en: 'I am a vegetarian.' },
      { sv: 'Notan, tack.', en: 'The bill, please.' },
    ],
  },
  {
    id: 'smalltalk',
    title: 'Small talk',
    icon: '🤝',
    description: 'Meeting someone new — name, where you are from, what you do.',
    setting:
      'You are a friendly Swede meeting the learner for the first time at a party. Introduce yourself, ask their name, where they are from, what they do, and why they are learning Swedish.',
    opener: 'Hej! Jag heter Anna. Vad heter du?',
    phrases: [
      { sv: 'Jag heter …', en: 'My name is …' },
      { sv: 'Jag kommer från Frankrike.', en: 'I come from France.' },
      { sv: 'Jag jobbar som …', en: 'I work as a …' },
      { sv: 'Jag lär mig svenska.', en: 'I am learning Swedish.' },
      { sv: 'Trevligt att träffas!', en: 'Nice to meet you!' },
    ],
  },
  {
    id: 'travel',
    title: 'Travel and transport',
    icon: '🚆',
    description: 'Buy a ticket, ask about platforms and departure times.',
    setting:
      'You are staffing the ticket counter at a Swedish train station. Sell the learner a ticket, tell them the platform and departure time, and answer questions about connections.',
    opener: 'Hej! Vart ska du åka?',
    phrases: [
      { sv: 'En biljett till Göteborg, tack.', en: 'A ticket to Gothenburg, please.' },
      { sv: 'När går nästa tåg?', en: 'When does the next train leave?' },
      { sv: 'Vilket spår?', en: 'Which platform?' },
      { sv: 'Måste jag byta tåg?', en: 'Do I have to change trains?' },
      { sv: 'Hur lång tid tar det?', en: 'How long does it take?' },
    ],
  },
  {
    id: 'doctor',
    title: 'At the doctor',
    icon: '🩺',
    description: 'Describe symptoms and understand simple advice.',
    setting:
      'You are a Swedish GP at a vårdcentral. Ask the learner what is wrong, ask a couple of follow-up questions about their symptoms, and give simple, everyday advice. Keep it light and non-alarming — this is a language exercise, not medical care.',
    opener: 'Hej och välkommen. Vad kan jag hjälpa dig med idag?',
    phrases: [
      { sv: 'Jag mår inte bra.', en: 'I do not feel well.' },
      { sv: 'Jag har ont i huvudet.', en: 'I have a headache.' },
      { sv: 'Jag har feber.', en: 'I have a fever.' },
      { sv: 'Det gör ont här.', en: 'It hurts here.' },
      { sv: 'Hur länge har du haft det?', en: 'How long have you had it?' },
    ],
  },
  {
    id: 'work',
    title: 'At work',
    icon: '💼',
    description: 'Colleagues, meetings, and the sacred institution of fika.',
    setting:
      'You are a Swedish colleague at the learner\'s new workplace. Chat about the working day, a meeting, the weekend, and invite them for fika. Keep it informal — Swedish workplaces use first names and "du".',
    opener: 'Hej! Ska vi ta en fika? Jag behöver en paus.',
    phrases: [
      { sv: 'Ska vi ta en fika?', en: 'Shall we take a coffee break?' },
      { sv: 'Jag har ett möte klockan tre.', en: 'I have a meeting at three.' },
      { sv: 'Kan du hjälpa mig med det här?', en: 'Can you help me with this?' },
      { sv: 'Vad gjorde du i helgen?', en: 'What did you do at the weekend?' },
      { sv: 'Trevlig helg!', en: 'Have a nice weekend!' },
    ],
  },
  {
    id: 'apartment',
    title: 'Finding somewhere to live',
    icon: '🏠',
    description: 'Viewing an apartment, asking about rent and rooms.',
    setting:
      'You are a landlord showing the learner around an apartment in Uppsala. Describe the rooms, answer questions about rent, the kitchen, storage and the neighbourhood.',
    opener: 'Hej, välkommen! Kom in — det här är vardagsrummet.',
    phrases: [
      { sv: 'Hur mycket är hyran?', en: 'How much is the rent?' },
      { sv: 'Hur många rum finns det?', en: 'How many rooms are there?' },
      { sv: 'Ingår el och internet?', en: 'Are electricity and internet included?' },
      { sv: 'När kan jag flytta in?', en: 'When can I move in?' },
      { sv: 'Finns det tvättstuga?', en: 'Is there a laundry room?' },
    ],
  },
]

export function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? FREE_TALK
}
