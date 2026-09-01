import type { QuizQuestion } from './grammar'

export interface Fact {
  label: string
  value: string
}

export interface CultureSection {
  heading: string
  body: string
  /** Short label/value pairs, for the things worth remembering as numbers. */
  facts?: Fact[]
}

export interface CultureTopic {
  /** Prefixed so these never collide with grammar lesson ids in storage. */
  id: string
  title: string
  summary: string
  kind: 'geography' | 'history'
  icon: string
  sections: CultureSection[]
  quiz: QuizQuestion[]
}

export const CULTURE: CultureTopic[] = [
  // ───────────────────────────────────────────────────────────── geography
  {
    id: 'culture-geo-shape',
    title: 'The shape of the country',
    summary: 'Long, thin, forested and emptier than almost anywhere in Europe.',
    kind: 'geography',
    icon: '🗺️',
    sections: [
      {
        heading: 'A country stretched north to south',
        body:
          'Sweden is 1,572 km from top to bottom — the same distance as from the south coast to the middle of Italy. That length is why the country behaves like several different places at once: the south is farmland and beech woods, the north is subarctic forest and mountain. Almost everyone lives in the southern third.',
        facts: [
          { label: 'Population', value: '≈ 10.6 million' },
          { label: 'Area', value: '450,295 km² — third largest in the EU' },
          { label: 'Length', value: '1,572 km north to south' },
          { label: 'Forest cover', value: 'About 69% of the land' },
        ],
      },
      {
        heading: 'Three historic lands',
        body:
          'Sweden is still spoken of in three parts. Götaland is the south, Svealand the middle around Stockholm and the great lakes, and Norrland the north. Norrland alone is roughly 60% of the country\'s area but holds only about a tenth of its people — the emptiest large region in the European Union.',
        facts: [
          { label: 'Götaland', value: 'The south — Skåne, Gothenburg, Öland, Gotland' },
          { label: 'Svealand', value: 'The middle — Stockholm, Uppsala, the big lakes' },
          { label: 'Norrland', value: 'The north — 60% of the area, ~12% of the people' },
        ],
      },
      {
        heading: 'Water everywhere',
        body:
          'Sweden has roughly 100,000 lakes and more islands than any other country on earth — around 267,000, most of them uninhabited rocks. Vänern, in the south-west, is the largest lake in the European Union. The right of public access, allemansrätten, lets anyone walk, camp and pick berries on almost any land, including private property, provided they disturb nothing.',
        facts: [
          { label: 'Lakes', value: '≈ 100,000' },
          { label: 'Islands', value: '≈ 267,000 — the most of any country' },
          { label: 'Vänern', value: 'Largest lake in the EU, 5,650 km²' },
          { label: 'Allemansrätten', value: 'Right to roam on almost all land' },
        ],
      },
      {
        heading: 'Light and dark',
        body:
          'About 15% of Sweden lies above the Arctic Circle. There the sun does not set for weeks in summer and does not rise for weeks in winter. Even in Stockholm, far to the south, midsummer nights barely darken and December days are gone by mid-afternoon. This shapes the calendar: Midsommar in June is arguably a bigger celebration than Christmas.',
      },
    ],
    quiz: [
      {
        prompt: 'Roughly how much of Sweden is covered in forest?',
        options: ['About 20%', 'About 45%', 'About 69%', 'About 90%'],
        answer: 2,
        explanation: 'Around 69% — one of the most heavily forested countries in Europe, and the basis of a large timber and paper industry.',
      },
      {
        prompt: 'What is allemansrätten?',
        options: [
          'A tax on land ownership',
          'The right to walk, camp and forage on almost any land',
          'The law creating the welfare state',
          'The rule that all children attend the same school',
        ],
        answer: 1,
        explanation: 'The "everyman\'s right" — public access to nature across most land, including private property, so long as you damage and disturb nothing.',
      },
      {
        prompt: 'Which region covers about 60% of Sweden\'s area but holds only around a tenth of its people?',
        options: ['Götaland', 'Svealand', 'Norrland', 'Skåne'],
        answer: 2,
        explanation: 'Norrland, the north. Its emptiness is why Sweden feels far larger than its population suggests.',
      },
      {
        prompt: 'Sweden has more of these than any other country. Which?',
        options: ['Lakes', 'Islands', 'Mountains', 'Rivers'],
        answer: 1,
        explanation: 'About 267,000 islands, most of them uninhabited rock. The Stockholm archipelago alone has roughly 30,000.',
      },
    ],
  },

  {
    id: 'culture-geo-stockholm',
    title: 'Stockholm and the east',
    summary: 'A capital built on fourteen islands, and the archipelago beyond it.',
    kind: 'geography',
    icon: '🏛️',
    sections: [
      {
        heading: 'The city on the water',
        body:
          'Stockholm sits where Lake Mälaren meets the Baltic, spread across fourteen islands joined by more than fifty bridges. The name means roughly "log islet", and the city was founded in 1252 to control the entrance to the lake — whoever held that channel held the trade of the interior.',
        facts: [
          { label: 'Founded', value: '1252' },
          { label: 'City population', value: '≈ 1 million' },
          { label: 'Greater Stockholm', value: '≈ 2.4 million — a fifth of Sweden' },
          { label: 'Built on', value: '14 islands' },
        ],
      },
      {
        heading: 'Gamla Stan and the modern city',
        body:
          'Gamla Stan, the old town, is one of the best-preserved medieval centres in Europe — narrow lanes, ochre buildings, the royal palace and the cathedral. Around it the city is emphatically modern: Södermalm for design and nightlife, Östermalm for money, Norrmalm for offices. The Vasa Museum, holding a warship raised whole from the harbour, is the most visited museum in Scandinavia.',
      },
      {
        heading: 'The archipelago',
        body:
          'East of the city the land dissolves into roughly 30,000 islands, skerries and rocks reaching some 60 km into the Baltic. Summer houses on these islands are a national institution. Just north-west lies Uppsala, home to the oldest university in the Nordic countries, founded in 1477, and long the religious centre of the country.',
        facts: [
          { label: 'Stockholm archipelago', value: '≈ 30,000 islands' },
          { label: 'Uppsala University', value: 'Founded 1477 — oldest in the Nordics' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'Stockholm is built across how many islands?',
        options: ['Three', 'Seven', 'Fourteen', 'Thirty'],
        answer: 2,
        explanation: 'Fourteen, linked by more than fifty bridges. The city grew where Lake Mälaren drains into the Baltic.',
      },
      {
        prompt: 'What is Gamla Stan?',
        options: [
          'The royal palace',
          'The medieval old town',
          'The archipelago',
          'The main railway station',
        ],
        answer: 1,
        explanation: 'Literally "the old town" — the medieval core, and one of the best preserved in Europe.',
      },
      {
        prompt: 'Uppsala is best known for what?',
        options: [
          'Sweden\'s largest port',
          'The oldest university in the Nordic countries',
          'The iron ore mines',
          'The Öresund Bridge',
        ],
        answer: 1,
        explanation: 'Founded in 1477. Uppsala was also the religious centre of Sweden long before Stockholm dominated.',
      },
    ],
  },

  {
    id: 'culture-geo-gothenburg',
    title: 'Gothenburg and the west coast',
    summary: 'The port city, its Dutch bones, and the rocky coast north of it.',
    kind: 'geography',
    icon: '⚓',
    sections: [
      {
        heading: 'A city built to order',
        body:
          'Gothenburg — Göteborg — was founded in 1621 by Gustav II Adolf to give Sweden a harbour on the North Sea side, at a time when Denmark controlled the sounds and could tax everything that passed. Dutch engineers laid it out, which is why the centre still has canals on a grid rather than the tangle of a medieval town.',
        facts: [
          { label: 'Founded', value: '1621, by Gustav II Adolf' },
          { label: 'Population', value: '≈ 600,000 — Sweden\'s second city' },
          { label: 'Port', value: 'The largest in Scandinavia' },
        ],
      },
      {
        heading: 'Industry and character',
        body:
          'The port made the city, and shipbuilding and then cars kept it. Volvo was founded here in 1927 and still shapes the local economy. Gothenburgers have a reputation across Sweden for being warmer and funnier than Stockholmers, a rivalry both cities maintain with some enthusiasm. The dialect is unmistakable, with a rising, singing intonation.',
      },
      {
        heading: 'Bohuslän and the coast',
        body:
          'North of the city the coastline turns to bare pink granite, worn smooth by ice, dotted with fishing villages and white wooden houses. This is Bohuslän, the classic Swedish summer coast — cold water, shellfish, and thousands of small islands. South of Gothenburg the land flattens towards Halland and its long sand beaches.',
      },
    ],
    quiz: [
      {
        prompt: 'Why was Gothenburg founded where it was?',
        options: [
          'It had the best farmland',
          'To give Sweden a port on the North Sea side, bypassing Danish control of the sounds',
          'It was the birthplace of Gustav Vasa',
          'It was the only defensible position on the coast',
        ],
        answer: 1,
        explanation: 'Denmark controlled the straits and taxed passing shipping. A western harbour was a strategic necessity.',
      },
      {
        prompt: 'Why does central Gothenburg have canals on a grid?',
        options: [
          'It was built on a marsh',
          'Dutch engineers laid the city out',
          'It copied Stockholm',
          'The canals are natural river channels',
        ],
        answer: 1,
        explanation: 'Dutch expertise in reclaiming and draining land was hired in, and the Dutch grid-and-canal plan came with it.',
      },
      {
        prompt: 'Which company, founded in Gothenburg in 1927, still shapes the city?',
        options: ['IKEA', 'Ericsson', 'Volvo', 'H&M'],
        answer: 2,
        explanation: 'Volvo. Gothenburg moved from shipbuilding to cars, and the company remains central to the local economy.',
      },
    ],
  },

  {
    id: 'culture-geo-south',
    title: 'Malmö and the south',
    summary: 'Skåne — flat, fertile, half-Danish, and joined to Copenhagen by a bridge.',
    kind: 'geography',
    icon: '🌾',
    sections: [
      {
        heading: 'The breadbasket',
        body:
          'Skåne, the southernmost province, looks nothing like the rest of Sweden. There is little forest and no granite: it is flat, open, and among the most fertile farmland in northern Europe. Castles and manor houses sit in the fields, a reminder that this was contested aristocratic land for centuries.',
        facts: [
          { label: 'Malmö population', value: '≈ 360,000 — Sweden\'s third city' },
          { label: 'Skåne', value: 'The most productive farmland in Sweden' },
        ],
      },
      {
        heading: 'Danish until 1658',
        body:
          'Skåne was part of Denmark for most of its history and only became Swedish under the Treaty of Roskilde in 1658, after which the crown worked hard to "Swedify" it. The legacy is audible: the Skåne dialect has a guttural R that sounds Danish to other Swedes, and is the accent Swedes most often say they struggle to understand.',
        facts: [
          { label: 'Became Swedish', value: '1658, Treaty of Roskilde' },
          { label: 'Dialect', value: 'Guttural R — closer to Danish' },
        ],
      },
      {
        heading: 'The Öresund Bridge',
        body:
          'Since 2000 a bridge-and-tunnel has linked Malmö directly to Copenhagen, 16 km across the sound. It begins as a bridge, dives into a tunnel on an artificial island, and surfaces in Denmark — the tunnel exists so ships and aircraft using Copenhagen airport are not obstructed. Tens of thousands commute across it, making the two cities function as one labour market.',
        facts: [
          { label: 'Opened', value: '2000' },
          { label: 'Length', value: '16 km, bridge plus tunnel' },
          { label: 'Copenhagen', value: '35 minutes by train from Malmö' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'Skåne became part of Sweden in which year?',
        options: ['1397', '1523', '1658', '1809'],
        answer: 2,
        explanation: 'The Treaty of Roskilde in 1658. Before that it had been Danish for centuries, which still shows in the dialect.',
      },
      {
        prompt: 'Why does the Öresund link include a tunnel as well as a bridge?',
        options: [
          'The water is too deep for bridge supports',
          'To avoid obstructing shipping and Copenhagen airport',
          'To save money',
          'Because of a border dispute',
        ],
        answer: 1,
        explanation: 'The tunnel keeps the shipping channel and the airport\'s flight paths clear. The switch happens on an artificial island.',
      },
      {
        prompt: 'How does Skåne differ physically from most of Sweden?',
        options: [
          'It is mountainous',
          'It is flat, open and highly fertile, with little forest',
          'It is entirely forested',
          'It is mostly lakes',
        ],
        answer: 1,
        explanation: 'No granite and little forest — flat, rich farmland, which is why it was worth fighting over.',
      },
    ],
  },

  {
    id: 'culture-geo-north',
    title: 'The north',
    summary: 'Lapland, the Sámi, iron ore, and a town being moved three kilometres.',
    kind: 'geography',
    icon: '🦌',
    sections: [
      {
        heading: 'Sápmi and the Sámi',
        body:
          'The far north is Sápmi, the homeland of the Sámi, the only recognised indigenous people of the European Union. Sápmi crosses four countries — Sweden, Norway, Finland and Russia — ignoring national borders entirely. Reindeer herding remains central to Sámi culture and carries specific legal rights in Swedish law, and there are several Sámi languages, all endangered.',
        facts: [
          { label: 'Sámi in Sweden', value: '≈ 20,000–35,000' },
          { label: 'Sápmi', value: 'Spans Sweden, Norway, Finland and Russia' },
          { label: 'Sámi Parliament', value: 'Established in Sweden in 1993' },
        ],
      },
      {
        heading: 'Iron under the ground',
        body:
          'Kiruna, far above the Arctic Circle, sits on one of the largest iron ore deposits on earth. The mine has been worked since 1900 and now runs so deep beneath the town that the ground above is subsiding. The solution is remarkable: the entire town is being physically relocated about three kilometres east, building by building. The church and other landmarks are being moved whole.',
        facts: [
          { label: 'Kiruna mine', value: 'One of the largest iron ore mines in the world' },
          { label: 'Town relocation', value: 'Began 2004, still under way' },
          { label: 'Distance moved', value: '≈ 3 km east' },
        ],
      },
      {
        heading: 'Mountains and light',
        body:
          'The Scandinavian mountains run along the Norwegian border; Kebnekaise, Sweden\'s highest peak, is there at just over 2,000 m — and shrinking, as the glacier on its southern summit melts. Abisko national park is one of the most reliable places on earth to see the aurora, thanks to a rain shadow that keeps its skies unusually clear.',
        facts: [
          { label: 'Kebnekaise', value: '≈ 2,096 m, highest in Sweden' },
          { label: 'Abisko', value: 'Famous for clear skies and the northern lights' },
          { label: 'Midnight sun', value: 'Weeks without sunset above the Arctic Circle' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'Why is the town of Kiruna being moved?',
        options: [
          'Rising sea levels',
          'The iron mine beneath it is causing the ground to subside',
          'To be closer to the railway',
          'A border change with Norway',
        ],
        answer: 1,
        explanation: 'Mining has undermined the town itself, so it is being relocated about 3 km east, building by building.',
      },
      {
        prompt: 'Who are the Sámi?',
        options: [
          'A political party',
          'The indigenous people of northern Scandinavia',
          'Descendants of Viking settlers',
          'A Finnish minority in Stockholm',
        ],
        answer: 1,
        explanation: 'The only recognised indigenous people of the EU, with a homeland — Sápmi — spanning four countries.',
      },
      {
        prompt: 'Why is Abisko particularly good for seeing the northern lights?',
        options: [
          'It is the furthest north settlement',
          'A rain shadow keeps its skies unusually clear',
          'It has no electric lighting',
          'It sits on a magnetic anomaly',
        ],
        answer: 1,
        explanation: 'Mountains shelter it from weather off the Atlantic, giving it far more clear nights than the surrounding area.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────── history
  {
    id: 'culture-hist-vikings',
    title: 'The Viking age',
    summary: 'Swedish Vikings went east, not west — and founded states doing it.',
    kind: 'history',
    icon: '⚔️',
    sections: [
      {
        heading: 'East, not west',
        body:
          'The Viking age runs conventionally from 793 to 1066. Danes and Norwegians raided westward, to England, Ireland and France. Swedish Vikings mostly went east, down the rivers of what is now Russia and Ukraine, trading furs, amber and slaves as far as Constantinople and Baghdad. They were traders at least as much as raiders.',
        facts: [
          { label: 'Viking age', value: '≈ 793–1066' },
          { label: 'Swedish direction', value: 'East — the rivers to the Black and Caspian Seas' },
          { label: 'Reached', value: 'Constantinople and Baghdad' },
        ],
      },
      {
        heading: 'The Rus',
        body:
          'The eastern travellers were known as the Rus, a name that would eventually attach itself to Russia. They served as the Varangian Guard, the elite bodyguard of the Byzantine emperor, and Arab silver coins turn up in Swedish graves in large numbers — physical evidence of a trade network stretching thousands of kilometres.',
      },
      {
        heading: 'What they left behind',
        body:
          'Sweden has around 2,500 runestones, far more than anywhere else — most raised as memorials, many recording men who died abroad on eastern journeys. Birka, on an island in Lake Mälaren, was a major trading town and is now a UNESCO site. Christianity arrived gradually through the eleventh century, and the horned helmet is a nineteenth-century invention with no basis in the archaeology at all.',
        facts: [
          { label: 'Runestones in Sweden', value: '≈ 2,500 — the most in the world' },
          { label: 'Birka', value: 'Major trading town, UNESCO World Heritage site' },
          { label: 'Horned helmets', value: 'A 19th-century myth' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'In which direction did Swedish Vikings mainly travel?',
        options: ['West to England and Ireland', 'East along the Russian rivers', 'South to North Africa', 'North to Iceland'],
        answer: 1,
        explanation: 'Danes and Norwegians went west; Swedes went east, reaching Constantinople and Baghdad by river.',
      },
      {
        prompt: 'What were the Rus?',
        options: [
          'A type of longship',
          'Eastern-travelling Norsemen whose name became attached to Russia',
          'A Viking law code',
          'The runestone carvers',
        ],
        answer: 1,
        explanation: 'They traded and settled along the eastern rivers and served in the Byzantine emperor\'s Varangian Guard.',
      },
      {
        prompt: 'Which of these is a myth?',
        options: ['Runestones', 'Horned helmets', 'The Varangian Guard', 'The trading town of Birka'],
        answer: 1,
        explanation: 'Horned helmets were invented in the nineteenth century, largely by opera and Romantic painting. No Viking helmet has ever been found with horns.',
      },
      {
        prompt: 'Roughly how many runestones does Sweden have?',
        options: ['About 50', 'About 300', 'About 2,500', 'About 40,000'],
        answer: 2,
        explanation: 'Around 2,500 — more than any other country, many commemorating men who died on journeys east.',
      },
    ],
  },

  {
    id: 'culture-hist-vasa',
    title: 'Gustav Vasa and independence',
    summary: 'How Sweden left the Kalmar Union, and why 6 June is the national day.',
    kind: 'history',
    icon: '👑',
    sections: [
      {
        heading: 'The Kalmar Union',
        body:
          'In 1397 Denmark, Norway and Sweden were joined under a single monarch in the Kalmar Union, effectively ruled from Denmark. It lasted more than a century and was never comfortable: Swedish nobles resented Danish control and rebelled repeatedly.',
        facts: [
          { label: 'Kalmar Union formed', value: '1397' },
          { label: 'Members', value: 'Denmark, Norway and Sweden under one crown' },
        ],
      },
      {
        heading: 'The Stockholm Bloodbath',
        body:
          'In 1520 the Danish king Christian II took Stockholm, promised an amnesty, then executed around eighty Swedish nobles and bishops in the main square over two days. It was intended to end opposition permanently. It did the opposite: among those whose father was killed was a young nobleman named Gustav Eriksson Vasa.',
        facts: [
          { label: 'Stockholm Bloodbath', value: '1520 — ≈ 80 executed' },
        ],
      },
      {
        heading: 'Vasa becomes king',
        body:
          'Vasa raised a rebellion in Dalarna and was elected king on 6 June 1523 — still Sweden\'s national day. He broke with Rome and took the Church\'s lands and wealth for the crown, making Sweden Lutheran largely for reasons of state finance, and turned an elective monarchy into a hereditary one. Modern Sweden effectively dates from his reign.',
        facts: [
          { label: 'Elected king', value: '6 June 1523 — the national day' },
          { label: 'Reformation', value: 'Church lands taken by the crown' },
          { label: 'Monarchy', value: 'Made hereditary rather than elective' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'What was the Kalmar Union?',
        options: [
          'A trade agreement between Baltic cities',
          'Denmark, Norway and Sweden under a single monarch',
          'The union of Sweden and Norway in 1814',
          'A medieval parliament',
        ],
        answer: 1,
        explanation: 'Formed in 1397 and effectively run from Denmark, which is exactly what Swedish nobles objected to.',
      },
      {
        prompt: 'Why is 6 June Sweden\'s national day?',
        options: [
          'The Kalmar Union was formed',
          'Gustav Vasa was elected king in 1523',
          'The constitution was signed',
          'The last war ended',
        ],
        answer: 1,
        explanation: 'Vasa\'s election in 1523 marks the break from Danish rule and the start of the modern Swedish state.',
      },
      {
        prompt: 'What was the Stockholm Bloodbath?',
        options: [
          'A Viking battle',
          'A plague outbreak',
          'The mass execution of Swedish nobles by the Danish king in 1520',
          'A riot during the Reformation',
        ],
        answer: 2,
        explanation: 'Christian II executed around eighty nobles and clergy after promising an amnesty. It triggered the rebellion that ended the union.',
      },
      {
        prompt: 'What was the main practical motive for Sweden\'s Reformation under Vasa?',
        options: [
          'Theological conviction',
          'Pressure from Germany',
          'Transferring the Church\'s land and wealth to the crown',
          'A popular uprising',
        ],
        answer: 2,
        explanation: 'Breaking with Rome allowed Vasa to seize Church property, which funded the new state. Doctrine followed finance.',
      },
    ],
  },

  {
    id: 'culture-hist-empire',
    title: 'The age of greatness',
    summary: 'A century when Sweden ran the Baltic — and the reckless king who lost it.',
    kind: 'history',
    icon: '🛡️',
    sections: [
      {
        heading: 'Stormaktstiden',
        body:
          'Between roughly 1611 and 1721 Sweden was a European great power, controlling Finland, the Baltic states, and territories in northern Germany. The Baltic was close to being a Swedish lake. For a thin, poor, sparsely populated country this was an extraordinary overreach, sustained by an unusually efficient state and a conscript army.',
        facts: [
          { label: 'Great power era', value: '≈ 1611–1721' },
          { label: 'Held', value: 'Finland, the Baltic provinces, parts of north Germany' },
        ],
      },
      {
        heading: 'Gustav II Adolf',
        body:
          'Gustavus Adolphus reformed the army into perhaps the most effective in Europe and intervened in the Thirty Years\' War in 1630 on the Protestant side, changing its course. He was killed at Lützen in 1632, at the height of his success. His warship Vasa had already provided a lesson in overreach: built too tall and too narrow, it capsized and sank in Stockholm harbour on its maiden voyage in 1628, barely a kilometre from the shipyard. It was raised almost intact in 1961 and is now the country\'s most visited museum.',
        facts: [
          { label: 'Entered the Thirty Years\' War', value: '1630' },
          { label: 'Died', value: 'Battle of Lützen, 1632' },
          { label: 'Vasa sank', value: '1628 — raised 1961' },
        ],
      },
      {
        heading: 'Karl XII and the collapse',
        body:
          'Karl XII came to the throne at fifteen and spent almost his entire reign at war. He won brilliant early victories against a coalition of Russia, Denmark and Poland, then marched into Russia and was destroyed at Poltava in 1709 — the battle that ended Swedish dominance and began Russian. He was shot in 1718 in Norway, and by the Treaty of Nystad in 1721 the empire was gone.',
        facts: [
          { label: 'Poltava', value: '1709 — the decisive defeat' },
          { label: 'Treaty of Nystad', value: '1721 — the empire ends' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'Which battle in 1709 effectively ended Sweden\'s time as a great power?',
        options: ['Lützen', 'Poltava', 'Narva', 'Roskilde'],
        answer: 1,
        explanation: 'Karl XII\'s army was destroyed by Peter the Great at Poltava. Power in the region passed to Russia.',
      },
      {
        prompt: 'What happened to the warship Vasa in 1628?',
        options: [
          'It won a decisive battle',
          'It sank on its maiden voyage in Stockholm harbour',
          'It carried Gustav II Adolf to Germany',
          'It was captured by Denmark',
        ],
        answer: 1,
        explanation: 'Built too tall and too narrow, it capsized barely a kilometre from the shipyard. Raised in 1961, it is now a museum.',
      },
      {
        prompt: 'Why did Gustav II Adolf enter the Thirty Years\' War?',
        options: [
          'To claim the Danish throne',
          'On the Protestant side, and to secure Swedish power in the Baltic',
          'To defend France',
          'To end the Kalmar Union',
        ],
        answer: 1,
        explanation: 'A mix of Protestant cause and strategic interest in northern Germany. His intervention changed the war\'s direction.',
      },
    ],
  },

  {
    id: 'culture-hist-bernadotte',
    title: 'Losing Finland, gaining a French king',
    summary: 'The strangest turn in Swedish history, and the start of two centuries of peace.',
    kind: 'history',
    icon: '🕊️',
    sections: [
      {
        heading: '1809: the loss of Finland',
        body:
          'Finland had been part of the Swedish realm for some six hundred years — not a colony but an integral part of the kingdom. In 1809, after a disastrous war, Russia took it. Sweden lost roughly a third of its territory and a quarter of its population at a stroke. The king was deposed and a new constitution written the same year.',
        facts: [
          { label: 'Finland lost', value: '1809, to Russia' },
          { label: 'Scale', value: '≈ one third of the territory' },
          { label: 'Had been Swedish', value: 'For about 600 years' },
        ],
      },
      {
        heading: 'A marshal of Napoleon',
        body:
          'The following year, needing an heir and hoping to win French favour, the Swedish parliament made an unexpected choice: Jean-Baptiste Bernadotte, one of Napoleon\'s marshals, with no Swedish connection whatsoever. He accepted, arrived, took the name Karl Johan — and promptly turned against Napoleon when he judged it in Sweden\'s interest. He never learned to speak Swedish properly. His descendants are on the throne today.',
        facts: [
          { label: 'Elected crown prince', value: '1810' },
          { label: 'Became', value: 'Karl XIV Johan' },
          { label: 'Current royal house', value: 'Bernadotte — his direct descendants' },
        ],
      },
      {
        heading: 'The last war',
        body:
          'In 1814 Sweden fought a brief campaign against Norway, which resulted in a union of the two crowns lasting until 1905, when Norway left peacefully. That 1814 campaign was Sweden\'s last war. The country has now been at peace for more than two centuries — among the longest unbroken records in the world.',
        facts: [
          { label: 'Last war', value: '1814' },
          { label: 'Union with Norway', value: '1814–1905, dissolved peacefully' },
          { label: 'Years of peace', value: 'More than 200' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'What did Sweden lose in 1809?',
        options: ['Norway', 'Finland', 'Skåne', 'The Baltic provinces'],
        answer: 1,
        explanation: 'Finland, to Russia — around a third of the realm, after some six centuries as part of the kingdom.',
      },
      {
        prompt: 'Who was Jean-Baptiste Bernadotte?',
        options: [
          'A French marshal who became king of Sweden',
          'The last Vasa king',
          'A Norwegian general',
          'The architect of Stockholm',
        ],
        answer: 0,
        explanation: 'One of Napoleon\'s marshals, elected Swedish crown prince in 1810. The current royal family descends from him.',
      },
      {
        prompt: 'When did Sweden last fight a war?',
        options: ['1814', '1905', '1939', '1945'],
        answer: 0,
        explanation: 'The 1814 campaign against Norway. More than two centuries of peace have followed.',
      },
      {
        prompt: 'How did the union between Sweden and Norway end in 1905?',
        options: ['In a war', 'Peacefully, by negotiation', 'By Russian intervention', 'It never ended'],
        answer: 1,
        explanation: 'Norway dissolved the union by negotiation. War was seriously contemplated but avoided.',
      },
    ],
  },

  {
    id: 'culture-hist-modern',
    title: 'Neutrality and the folkhem',
    summary: 'Two world wars sat out, a welfare state built, and a recent break with tradition.',
    kind: 'history',
    icon: '🏘️',
    sections: [
      {
        heading: 'Neutral, with compromises',
        body:
          'Sweden stayed out of both world wars. In the Second, that neutrality involved real concessions: iron ore continued to flow to Germany, and German troops were permitted to transit Swedish railways to occupied Norway. Sweden also took in refugees, including nearly all of Denmark\'s Jewish population in 1943. The moral balance of those years is still argued over.',
        facts: [
          { label: 'Both world wars', value: 'Neutral' },
          { label: 'Concessions', value: 'Iron ore exports and German troop transit' },
          { label: '1943', value: 'Took in almost all of Denmark\'s Jews' },
        ],
      },
      {
        heading: 'Folkhemmet — the people\'s home',
        body:
          'From 1928 the Social Democrats built the country around the idea of folkhemmet, "the people\'s home": the nation as a household where nobody is favoured and nobody is left out. Over the following decades this produced universal healthcare, free education, extensive parental leave and a very high tax base — and, from 1932, Social Democratic government for almost all of the next half century.',
        facts: [
          { label: 'Folkhemmet coined', value: '1928, by Per Albin Hansson' },
          { label: 'Social Democratic rule', value: 'Nearly unbroken, 1932–1976' },
        ],
      },
      {
        heading: 'The modern turn',
        body:
          'Prime Minister Olof Palme was shot dead in a Stockholm street in 1986, walking home from the cinema without bodyguards. The case was never solved to general satisfaction and shook the country\'s sense of itself. Sweden joined the European Union in 1995 and kept its own currency. Then, after Russia\'s invasion of Ukraine, it abandoned two centuries of non-alignment and joined NATO in March 2024 — the largest change in Swedish foreign policy in modern times.',
        facts: [
          { label: 'Palme assassinated', value: '1986 — never satisfactorily solved' },
          { label: 'Joined the EU', value: '1995' },
          { label: 'Currency', value: 'Kept the krona, not the euro' },
          { label: 'Joined NATO', value: 'March 2024' },
        ],
      },
    ],
    quiz: [
      {
        prompt: 'What does folkhemmet mean?',
        options: [
          'The royal palace',
          '"The people\'s home" — the nation as a household that looks after everyone',
          'The parliament building',
          'A housing programme of the 1960s',
        ],
        answer: 1,
        explanation: 'Coined in 1928, it became the organising metaphor of the Swedish welfare state.',
      },
      {
        prompt: 'When did Sweden join NATO?',
        options: ['1949', '1995', '2004', '2024'],
        answer: 3,
        explanation: 'March 2024, after Russia\'s invasion of Ukraine ended two centuries of non-alignment.',
      },
      {
        prompt: 'Which is true of Sweden and the European Union?',
        options: [
          'It is not a member',
          'It joined in 1995 and uses the euro',
          'It joined in 1995 and kept the krona',
          'It was a founding member',
        ],
        answer: 2,
        explanation: 'Member since 1995, but a referendum in 2003 rejected the euro.',
      },
      {
        prompt: 'What happened to Olof Palme in 1986?',
        options: [
          'He resigned over a scandal',
          'He was assassinated in a Stockholm street',
          'He led Sweden into the EU',
          'He negotiated the end of the Norwegian union',
        ],
        answer: 1,
        explanation: 'Shot while walking home from the cinema without protection. The case profoundly unsettled the country.',
      },
    ],
  },
]

export const GEOGRAPHY = CULTURE.filter((t) => t.kind === 'geography')
export const HISTORY = CULTURE.filter((t) => t.kind === 'history')
