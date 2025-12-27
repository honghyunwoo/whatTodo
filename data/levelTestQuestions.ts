/**
 * Level Test Questions
 * Questions for adaptive CEFR placement test
 */

import type { CEFRLevel } from '@/types/activity';
import type { TestQuestion } from '@/types/levelTest';

// ─────────────────────────────────────
// A1 Level Questions
// ─────────────────────────────────────

const A1_QUESTIONS: TestQuestion[] = [
  // Vocabulary
  {
    id: 'a1-v1',
    type: 'vocabulary',
    level: 'A1',
    difficulty: 1,
    question: '"Apple" means:',
    options: ['사과', '바나나', '오렌지', '포도'],
    correctAnswer: 0,
    explanation: 'Apple은 사과입니다.',
  },
  {
    id: 'a1-v2',
    type: 'vocabulary',
    level: 'A1',
    difficulty: 2,
    question: '"Book" means:',
    options: ['연필', '책', '가방', '의자'],
    correctAnswer: 1,
    explanation: 'Book은 책입니다.',
  },
  {
    id: 'a1-v3',
    type: 'vocabulary',
    level: 'A1',
    difficulty: 3,
    question: '"Water" means:',
    options: ['우유', '주스', '물', '커피'],
    correctAnswer: 2,
    explanation: 'Water은 물입니다.',
  },
  {
    id: 'a1-v4',
    type: 'vocabulary',
    level: 'A1',
    difficulty: 4,
    question: 'What is the opposite of "big"?',
    options: ['tall', 'small', 'wide', 'long'],
    correctAnswer: 1,
    explanation: 'Big의 반대는 small입니다.',
  },
  {
    id: 'a1-v5',
    type: 'vocabulary',
    level: 'A1',
    difficulty: 5,
    question: 'Which word means "happy"?',
    options: ['sad', 'angry', 'glad', 'tired'],
    correctAnswer: 2,
    explanation: 'Glad는 happy와 같은 의미입니다.',
  },
  // Grammar
  {
    id: 'a1-g1',
    type: 'grammar',
    level: 'A1',
    difficulty: 1,
    question: 'I ___ a student.',
    options: ['am', 'is', 'are', 'be'],
    correctAnswer: 0,
    explanation: 'I와 함께 am을 사용합니다.',
  },
  {
    id: 'a1-g2',
    type: 'grammar',
    level: 'A1',
    difficulty: 2,
    question: 'She ___ a teacher.',
    options: ['am', 'is', 'are', 'be'],
    correctAnswer: 1,
    explanation: 'She/He와 함께 is를 사용합니다.',
  },
  {
    id: 'a1-g3',
    type: 'grammar',
    level: 'A1',
    difficulty: 3,
    question: 'They ___ my friends.',
    options: ['am', 'is', 'are', 'be'],
    correctAnswer: 2,
    explanation: 'They와 함께 are를 사용합니다.',
  },
  {
    id: 'a1-g4',
    type: 'grammar',
    level: 'A1',
    difficulty: 4,
    question: 'I ___ breakfast every day.',
    options: ['eat', 'eats', 'eating', 'eaten'],
    correctAnswer: 0,
    explanation: 'I와 함께 동사 원형을 사용합니다.',
  },
  {
    id: 'a1-g5',
    type: 'grammar',
    level: 'A1',
    difficulty: 5,
    question: 'He ___ to school every day.',
    options: ['go', 'goes', 'going', 'gone'],
    correctAnswer: 1,
    explanation: 'He/She와 함께 동사에 s를 붙입니다.',
  },
  // Reading
  {
    id: 'a1-r1',
    type: 'reading',
    level: 'A1',
    difficulty: 3,
    question: 'Read: "My name is Tom. I am 10 years old." How old is Tom?',
    options: ['8 years old', '9 years old', '10 years old', '11 years old'],
    correctAnswer: 2,
    context: 'My name is Tom. I am 10 years old.',
  },
  {
    id: 'a1-r2',
    type: 'reading',
    level: 'A1',
    difficulty: 4,
    question: 'Read: "I have a dog. Its name is Max." What is the pet\'s name?',
    options: ['Tom', 'Max', 'Rex', 'Sam'],
    correctAnswer: 1,
    context: 'I have a dog. Its name is Max.',
  },
  // Listening (text-based for now)
  {
    id: 'a1-l1',
    type: 'listening',
    level: 'A1',
    difficulty: 2,
    question: 'Listen: "Hello, my name is Anna." What is her name?',
    options: ['Amy', 'Anna', 'Alice', 'Alina'],
    correctAnswer: 1,
  },
  {
    id: 'a1-l2',
    type: 'listening',
    level: 'A1',
    difficulty: 3,
    question: 'Listen: "I like pizza and ice cream." What food does the speaker like?',
    options: ['Hamburger', 'Salad', 'Pizza', 'Soup'],
    correctAnswer: 2,
  },
];

// ─────────────────────────────────────
// A2 Level Questions
// ─────────────────────────────────────

const A2_QUESTIONS: TestQuestion[] = [
  // Vocabulary
  {
    id: 'a2-v1',
    type: 'vocabulary',
    level: 'A2',
    difficulty: 3,
    question: '"Delicious" means:',
    options: ['beautiful', 'tasty', 'expensive', 'healthy'],
    correctAnswer: 1,
    explanation: 'Delicious는 맛있는 이라는 뜻입니다.',
  },
  {
    id: 'a2-v2',
    type: 'vocabulary',
    level: 'A2',
    difficulty: 4,
    question: 'What does "purchase" mean?',
    options: ['sell', 'buy', 'make', 'give'],
    correctAnswer: 1,
    explanation: 'Purchase는 구매하다 라는 뜻입니다.',
  },
  {
    id: 'a2-v3',
    type: 'vocabulary',
    level: 'A2',
    difficulty: 5,
    question: 'Choose the correct synonym for "angry":',
    options: ['happy', 'upset', 'tired', 'excited'],
    correctAnswer: 1,
    explanation: 'Upset은 angry와 비슷한 의미입니다.',
  },
  {
    id: 'a2-v4',
    type: 'vocabulary',
    level: 'A2',
    difficulty: 6,
    question: '"Appointment" is most related to:',
    options: ['cooking', 'meeting', 'sleeping', 'playing'],
    correctAnswer: 1,
    explanation: 'Appointment은 약속/예약을 의미합니다.',
  },
  {
    id: 'a2-v5',
    type: 'vocabulary',
    level: 'A2',
    difficulty: 7,
    question: 'Which word means "to start"?',
    options: ['finish', 'continue', 'begin', 'stop'],
    correctAnswer: 2,
    explanation: 'Begin은 시작하다 라는 뜻입니다.',
  },
  // Grammar
  {
    id: 'a2-g1',
    type: 'grammar',
    level: 'A2',
    difficulty: 3,
    question: 'I ___ to the store yesterday.',
    options: ['go', 'goes', 'went', 'going'],
    correctAnswer: 2,
    explanation: 'Yesterday는 과거를 나타내므로 went를 사용합니다.',
  },
  {
    id: 'a2-g2',
    type: 'grammar',
    level: 'A2',
    difficulty: 4,
    question: 'She ___ TV when I called her.',
    options: ['watches', 'watched', 'was watching', 'is watching'],
    correctAnswer: 2,
    explanation: '과거 진행형 (was watching)을 사용합니다.',
  },
  {
    id: 'a2-g3',
    type: 'grammar',
    level: 'A2',
    difficulty: 5,
    question: 'I will ___ you tomorrow.',
    options: ['call', 'called', 'calling', 'calls'],
    correctAnswer: 0,
    explanation: 'Will 뒤에는 동사 원형이 옵니다.',
  },
  {
    id: 'a2-g4',
    type: 'grammar',
    level: 'A2',
    difficulty: 6,
    question: 'If it rains, I ___ stay home.',
    options: ['will', 'would', 'was', 'am'],
    correctAnswer: 0,
    explanation: '조건문 Type 1에서는 will을 사용합니다.',
  },
  {
    id: 'a2-g5',
    type: 'grammar',
    level: 'A2',
    difficulty: 7,
    question: 'The book ___ by my sister.',
    options: ['write', 'writes', 'was written', 'is write'],
    correctAnswer: 2,
    explanation: '수동태는 be + 과거분사로 만듭니다.',
  },
  // Reading
  {
    id: 'a2-r1',
    type: 'reading',
    level: 'A2',
    difficulty: 5,
    question: 'Read: "Tom works at a hospital. He helps sick people." What is Tom\'s job?',
    options: ['Teacher', 'Doctor', 'Cook', 'Driver'],
    correctAnswer: 1,
    context: 'Tom works at a hospital. He helps sick people every day.',
  },
  {
    id: 'a2-r2',
    type: 'reading',
    level: 'A2',
    difficulty: 6,
    question: 'Read: "The train leaves at 9 AM." When does the train depart?',
    options: ['8 AM', '9 AM', '10 AM', '11 AM'],
    correctAnswer: 1,
    context: 'The train leaves at 9 AM. Please arrive 15 minutes early.',
  },
  // Listening
  {
    id: 'a2-l1',
    type: 'listening',
    level: 'A2',
    difficulty: 4,
    question: 'Listen: "The meeting is at 3 PM in Room 5." Where is the meeting?',
    options: ['Room 3', 'Room 4', 'Room 5', 'Room 6'],
    correctAnswer: 2,
  },
  {
    id: 'a2-l2',
    type: 'listening',
    level: 'A2',
    difficulty: 5,
    question:
      'Listen: "I usually wake up at 7 and go to work at 8." What time does the speaker go to work?',
    options: ['7 AM', '8 AM', '9 AM', '10 AM'],
    correctAnswer: 1,
  },
];

// ─────────────────────────────────────
// B1 Level Questions
// ─────────────────────────────────────

const B1_QUESTIONS: TestQuestion[] = [
  // Vocabulary
  {
    id: 'b1-v1',
    type: 'vocabulary',
    level: 'B1',
    difficulty: 5,
    question: '"Accomplish" is closest in meaning to:',
    options: ['fail', 'achieve', 'ignore', 'delay'],
    correctAnswer: 1,
    explanation: 'Accomplish는 달성하다, 성취하다 라는 뜻입니다.',
  },
  {
    id: 'b1-v2',
    type: 'vocabulary',
    level: 'B1',
    difficulty: 6,
    question: 'Choose the word that means "to make something better":',
    options: ['worsen', 'maintain', 'improve', 'damage'],
    correctAnswer: 2,
    explanation: 'Improve는 개선하다 라는 뜻입니다.',
  },
  {
    id: 'b1-v3',
    type: 'vocabulary',
    level: 'B1',
    difficulty: 7,
    question: '"Hesitate" means:',
    options: ['hurry', 'pause', 'continue', 'finish'],
    correctAnswer: 1,
    explanation: 'Hesitate는 망설이다 라는 뜻입니다.',
  },
  {
    id: 'b1-v4',
    type: 'vocabulary',
    level: 'B1',
    difficulty: 8,
    question: 'What is a "consequence"?',
    options: ['a cause', 'a result', 'a question', 'a plan'],
    correctAnswer: 1,
    explanation: 'Consequence는 결과 라는 뜻입니다.',
  },
  {
    id: 'b1-v5',
    type: 'vocabulary',
    level: 'B1',
    difficulty: 9,
    question: '"Reliable" describes someone who is:',
    options: ['late', 'trustworthy', 'creative', 'funny'],
    correctAnswer: 1,
    explanation: 'Reliable은 신뢰할 수 있는 이라는 뜻입니다.',
  },
  // Grammar
  {
    id: 'b1-g1',
    type: 'grammar',
    level: 'B1',
    difficulty: 5,
    question: 'I have ___ English for three years.',
    options: ['study', 'studied', 'studying', 'studies'],
    correctAnswer: 1,
    explanation: '현재완료는 have + 과거분사를 사용합니다.',
  },
  {
    id: 'b1-g2',
    type: 'grammar',
    level: 'B1',
    difficulty: 6,
    question: 'If I ___ rich, I would travel the world.',
    options: ['am', 'was', 'were', 'be'],
    correctAnswer: 2,
    explanation: '가정법 과거에서는 were를 사용합니다.',
  },
  {
    id: 'b1-g3',
    type: 'grammar',
    level: 'B1',
    difficulty: 7,
    question: 'The man ___ car was stolen called the police.',
    options: ['who', 'whose', 'which', 'whom'],
    correctAnswer: 1,
    explanation: '소유를 나타낼 때 whose를 사용합니다.',
  },
  {
    id: 'b1-g4',
    type: 'grammar',
    level: 'B1',
    difficulty: 8,
    question: 'By the time she arrived, we ___ already left.',
    options: ['have', 'had', 'was', 'were'],
    correctAnswer: 1,
    explanation: '과거완료는 had + 과거분사를 사용합니다.',
  },
  {
    id: 'b1-g5',
    type: 'grammar',
    level: 'B1',
    difficulty: 9,
    question: 'She suggested ___ a break.',
    options: ['take', 'to take', 'taking', 'took'],
    correctAnswer: 2,
    explanation: 'Suggest 뒤에는 동명사가 옵니다.',
  },
  // Reading
  {
    id: 'b1-r1',
    type: 'reading',
    level: 'B1',
    difficulty: 6,
    question:
      'What is the main idea of a text that discusses "the benefits and drawbacks of remote work"?',
    options: [
      'History of offices',
      'Pros and cons of working from home',
      'How to find a job',
      'Office furniture',
    ],
    correctAnswer: 1,
    context: 'The passage discusses both advantages and disadvantages of remote work.',
  },
  {
    id: 'b1-r2',
    type: 'reading',
    level: 'B1',
    difficulty: 7,
    question:
      'If an article mentions "growing concern about climate change," the author is likely:',
    options: ['Happy', 'Worried', 'Indifferent', 'Confused'],
    correctAnswer: 1,
  },
  // Listening
  {
    id: 'b1-l1',
    type: 'listening',
    level: 'B1',
    difficulty: 6,
    question:
      'In a conversation where someone says "I\'m not so sure about that," they are expressing:',
    options: ['Strong agreement', 'Doubt', 'Excitement', 'Anger'],
    correctAnswer: 1,
  },
  {
    id: 'b1-l2',
    type: 'listening',
    level: 'B1',
    difficulty: 7,
    question: 'When someone says "That sounds like a plan," they mean:',
    options: ['They disagree', 'They agree', 'They are confused', 'They are asking a question'],
    correctAnswer: 1,
  },
];

// ─────────────────────────────────────
// B2 Level Questions
// ─────────────────────────────────────

const B2_QUESTIONS: TestQuestion[] = [
  // Vocabulary
  {
    id: 'b2-v1',
    type: 'vocabulary',
    level: 'B2',
    difficulty: 7,
    question: '"Ambiguous" means:',
    options: ['clear', 'uncertain', 'simple', 'obvious'],
    correctAnswer: 1,
    explanation: 'Ambiguous는 모호한, 애매한 이라는 뜻입니다.',
  },
  {
    id: 'b2-v2',
    type: 'vocabulary',
    level: 'B2',
    difficulty: 8,
    question: 'What is an "implication"?',
    options: [
      'A direct statement',
      'Something suggested but not stated',
      'A question',
      'A command',
    ],
    correctAnswer: 1,
    explanation: 'Implication은 함축, 암시를 의미합니다.',
  },
  {
    id: 'b2-v3',
    type: 'vocabulary',
    level: 'B2',
    difficulty: 8,
    question: '"Prevalent" is closest in meaning to:',
    options: ['rare', 'widespread', 'unknown', 'expensive'],
    correctAnswer: 1,
    explanation: 'Prevalent은 널리 퍼진, 유행하는 이라는 뜻입니다.',
  },
  {
    id: 'b2-v4',
    type: 'vocabulary',
    level: 'B2',
    difficulty: 9,
    question: '"To scrutinize" means to:',
    options: ['ignore', 'examine carefully', 'approve quickly', 'reject'],
    correctAnswer: 1,
    explanation: 'Scrutinize는 면밀히 조사하다 라는 뜻입니다.',
  },
  {
    id: 'b2-v5',
    type: 'vocabulary',
    level: 'B2',
    difficulty: 10,
    question: '"Obsolete" describes something that is:',
    options: ['modern', 'outdated', 'popular', 'expensive'],
    correctAnswer: 1,
    explanation: 'Obsolete는 구식의, 쓸모없어진 이라는 뜻입니다.',
  },
  // Grammar
  {
    id: 'b2-g1',
    type: 'grammar',
    level: 'B2',
    difficulty: 7,
    question: 'Had I known about the meeting, I ___ attended.',
    options: ['would have', 'will have', 'have', 'had'],
    correctAnswer: 0,
    explanation: '가정법 과거완료에서는 would have + 과거분사를 사용합니다.',
  },
  {
    id: 'b2-g2',
    type: 'grammar',
    level: 'B2',
    difficulty: 8,
    question: 'Not until I finished the book ___ realize its importance.',
    options: ['I did', 'did I', 'I do', 'do I'],
    correctAnswer: 1,
    explanation: 'Not until로 시작할 때 도치가 일어납니다.',
  },
  {
    id: 'b2-g3',
    type: 'grammar',
    level: 'B2',
    difficulty: 8,
    question: 'The report ___ by next Monday.',
    options: ['will complete', 'will be completing', 'will have been completed', 'is completed'],
    correctAnswer: 2,
    explanation: '미래완료 수동태는 will have been + 과거분사입니다.',
  },
  {
    id: 'b2-g4',
    type: 'grammar',
    level: 'B2',
    difficulty: 9,
    question: '___ as it may seem, the story is true.',
    options: ['Strange', 'Strangely', 'Stranger', 'Strangest'],
    correctAnswer: 0,
    explanation: '양보의 의미로 형용사 + as + 주어 + may + 동사 패턴을 사용합니다.',
  },
  {
    id: 'b2-g5',
    type: 'grammar',
    level: 'B2',
    difficulty: 10,
    question: 'It is essential that he ___ present at the meeting.',
    options: ['is', 'be', 'was', 'being'],
    correctAnswer: 1,
    explanation: '요구/제안을 나타내는 that절에서는 동사 원형을 사용합니다.',
  },
  // Reading
  {
    id: 'b2-r1',
    type: 'reading',
    level: 'B2',
    difficulty: 8,
    question: 'When a text says "The data suggests a correlation," it means:',
    options: [
      'There is definite proof',
      'There might be a connection',
      'There is no relationship',
      'The data is wrong',
    ],
    correctAnswer: 1,
  },
  {
    id: 'b2-r2',
    type: 'reading',
    level: 'B2',
    difficulty: 9,
    question: 'An author using "allegedly" is indicating that:',
    options: [
      'The information is confirmed',
      'The information is unverified',
      'They strongly believe it',
      'They witnessed it',
    ],
    correctAnswer: 1,
  },
  // Listening
  {
    id: 'b2-l1',
    type: 'listening',
    level: 'B2',
    difficulty: 8,
    question: 'When a speaker says "That being said," they are about to:',
    options: [
      'End the conversation',
      'Present a contrasting point',
      'Ask a question',
      'Agree completely',
    ],
    correctAnswer: 1,
  },
  {
    id: 'b2-l2',
    type: 'listening',
    level: 'B2',
    difficulty: 9,
    question: '"To play devil\'s advocate" means to:',
    options: [
      'Support evil',
      'Argue the opposing side for discussion',
      'Be dishonest',
      'Avoid the topic',
    ],
    correctAnswer: 1,
  },
];

// ─────────────────────────────────────
// C1 Level Questions (Advanced)
// ─────────────────────────────────────

const C1_QUESTIONS: TestQuestion[] = [
  // Vocabulary - Advanced idioms and nuanced meanings
  {
    id: 'c1-v1',
    type: 'vocabulary',
    level: 'C1',
    difficulty: 9,
    question: '"To turn a blind eye" means to:',
    options: ['lose vision', 'pretend not to notice', 'look carefully', 'be surprised'],
    correctAnswer: 1,
    explanation: '눈감아주다, 못 본 척하다 라는 관용표현입니다.',
  },
  {
    id: 'c1-v2',
    type: 'vocabulary',
    level: 'C1',
    difficulty: 10,
    question: '"Ubiquitous" is closest in meaning to:',
    options: ['rare', 'everywhere present', 'ancient', 'temporary'],
    correctAnswer: 1,
    explanation: 'Ubiquitous는 어디에나 있는, 편재하는 이라는 뜻입니다.',
  },
  {
    id: 'c1-v3',
    type: 'vocabulary',
    level: 'C1',
    difficulty: 10,
    question: '"Precarious" describes a situation that is:',
    options: ['stable', 'uncertain and risky', 'profitable', 'boring'],
    correctAnswer: 1,
    explanation: 'Precarious는 불안정한, 위태로운 이라는 뜻입니다.',
  },
  // Grammar - Complex structures
  {
    id: 'c1-g1',
    type: 'grammar',
    level: 'C1',
    difficulty: 9,
    question: 'Scarcely had he arrived ___ the meeting began.',
    options: ['than', 'when', 'that', 'as'],
    correctAnswer: 1,
    explanation: 'Scarcely...when 구문은 ~하자마자 를 의미합니다.',
  },
  {
    id: 'c1-g2',
    type: 'grammar',
    level: 'C1',
    difficulty: 10,
    question: '___ it not for your help, I would have failed.',
    options: ['Were', 'Had', 'Should', 'If'],
    correctAnswer: 0,
    explanation: '가정법에서 Were it not for는 If it were not for와 같습니다.',
  },
  {
    id: 'c1-g3',
    type: 'grammar',
    level: 'C1',
    difficulty: 10,
    question: 'Under no circumstances ___ this information.',
    options: ['you should reveal', 'should you reveal', 'you reveal', 'reveal you'],
    correctAnswer: 1,
    explanation: '부정 부사구가 문두에 오면 도치가 일어납니다.',
  },
  // Reading - Inference and academic texts
  {
    id: 'c1-r1',
    type: 'reading',
    level: 'C1',
    difficulty: 9,
    question:
      'When an author describes a character\'s "cavalier attitude," they are suggesting the character is:',
    options: ['careful', 'dismissive and careless', 'brave', 'romantic'],
    correctAnswer: 1,
    context: 'Academic usage of cavalier implies a dismissive or offhand manner.',
  },
  {
    id: 'c1-r2',
    type: 'reading',
    level: 'C1',
    difficulty: 10,
    question: 'If an article concludes "the jury is still out," it means:',
    options: [
      'The trial has ended',
      'No final conclusion has been reached',
      'Experts agree',
      'The case is closed',
    ],
    correctAnswer: 1,
  },
  {
    id: 'c1-r3',
    type: 'reading',
    level: 'C1',
    difficulty: 10,
    question: 'An "implicit assumption" in an argument is one that is:',
    options: [
      'clearly stated',
      'unstated but necessary for the argument',
      'false',
      'obvious to everyone',
    ],
    correctAnswer: 1,
  },
  // Listening - Complex arguments
  {
    id: 'c1-l1',
    type: 'listening',
    level: 'C1',
    difficulty: 9,
    question: 'When a speaker says "I\'d be remiss not to mention," they are:',
    options: [
      'apologizing',
      'about to add an important point',
      'ending the conversation',
      'expressing doubt',
    ],
    correctAnswer: 1,
  },
  {
    id: 'c1-l2',
    type: 'listening',
    level: 'C1',
    difficulty: 10,
    question: '"To cut to the chase" in a discussion means to:',
    options: [
      'run away',
      'get to the main point directly',
      'change the subject',
      'ask for more time',
    ],
    correctAnswer: 1,
  },
  {
    id: 'c1-l3',
    type: 'listening',
    level: 'C1',
    difficulty: 10,
    question: 'When someone says "That\'s a moot point," they mean the issue is:',
    options: [
      'very important',
      'no longer relevant or debatable',
      'controversial',
      'clearly correct',
    ],
    correctAnswer: 1,
  },
];

// ─────────────────────────────────────
// C2 Level Questions (Proficient)
// ─────────────────────────────────────

const C2_QUESTIONS: TestQuestion[] = [
  // Vocabulary - Near-native level, subtle connotations
  {
    id: 'c2-v1',
    type: 'vocabulary',
    level: 'C2',
    difficulty: 11,
    question: '"Sycophant" best describes someone who:',
    options: [
      'speaks truth to power',
      'flatters powerful people for personal gain',
      'works independently',
      'avoids conflict',
    ],
    correctAnswer: 1,
    explanation: 'Sycophant는 아첨꾼, 아부하는 사람을 의미합니다.',
  },
  {
    id: 'c2-v2',
    type: 'vocabulary',
    level: 'C2',
    difficulty: 11,
    question: 'The difference between "uninterested" and "disinterested" is:',
    options: [
      'They are synonyms',
      'Uninterested means bored; disinterested means impartial',
      'Disinterested is more negative',
      'No real difference',
    ],
    correctAnswer: 1,
    explanation: 'Uninterested는 관심 없는, disinterested는 공정한/편견 없는 의미입니다.',
  },
  {
    id: 'c2-v3',
    type: 'vocabulary',
    level: 'C2',
    difficulty: 12,
    question: '"Obsequious" behavior is characterized by:',
    options: ['rebellion', 'excessive eagerness to please', 'indifference', 'aggression'],
    correctAnswer: 1,
    explanation: 'Obsequious는 굽실거리는, 아첨하는 이라는 뜻입니다.',
  },
  // Grammar - Most advanced structures, stylistic nuances
  {
    id: 'c2-g1',
    type: 'grammar',
    level: 'C2',
    difficulty: 11,
    question: '"He demanded that the report ___ submitted immediately." Which is correct?',
    options: ['be', 'is', 'was', 'would be'],
    correctAnswer: 0,
    explanation: '요구/명령/제안의 동사 뒤 that절에서는 가정법 현재(동사 원형)를 사용합니다.',
  },
  {
    id: 'c2-g2',
    type: 'grammar',
    level: 'C2',
    difficulty: 11,
    question: 'The subjunctive in "It is vital that she ___ present" requires:',
    options: ['is', 'be', 'was', 'being'],
    correctAnswer: 1,
    explanation: '중요성/필요성을 나타내는 형용사 뒤 that절에서 동사 원형을 사용합니다.',
  },
  {
    id: 'c2-g3',
    type: 'grammar',
    level: 'C2',
    difficulty: 12,
    question: '"The more I learn, ___ I realize I don\'t know."',
    options: ['the more', 'more', 'the most', 'most'],
    correctAnswer: 0,
    explanation: 'The + 비교급, the + 비교급 구문입니다.',
  },
  // Reading - Native-level comprehension
  {
    id: 'c2-r1',
    type: 'reading',
    level: 'C2',
    difficulty: 11,
    question: 'When a literary critic describes prose as "turgid," they mean it is:',
    options: ['exciting', 'swollen and pompous', 'concise', 'poetic'],
    correctAnswer: 1,
    context: 'Turgid prose is overly complex, inflated, and difficult to read.',
  },
  {
    id: 'c2-r2',
    type: 'reading',
    level: 'C2',
    difficulty: 11,
    question: '"Apocryphal" stories are those that are:',
    options: ['verified', 'of doubtful authenticity', 'religious', 'ancient'],
    correctAnswer: 1,
  },
  {
    id: 'c2-r3',
    type: 'reading',
    level: 'C2',
    difficulty: 12,
    question: 'A "pyrrhic victory" is one where:',
    options: [
      'the win is decisive',
      'the cost of winning outweighs the benefits',
      'both sides win',
      'luck determines the outcome',
    ],
    correctAnswer: 1,
    context: 'Named after King Pyrrhus, whose victories came at devastating cost.',
  },
  // Listening - Native speed, nuanced meaning
  {
    id: 'c2-l1',
    type: 'listening',
    level: 'C2',
    difficulty: 11,
    question: 'When someone says "I\'ll take that with a grain of salt," they:',
    options: ['want salt', 'are skeptical about what was said', 'completely agree', 'are confused'],
    correctAnswer: 1,
  },
  {
    id: 'c2-l2',
    type: 'listening',
    level: 'C2',
    difficulty: 11,
    question: '"Damning with faint praise" means:',
    options: [
      'criticizing openly',
      'praising enthusiastically',
      'giving such weak praise that it implies disapproval',
      'refusing to comment',
    ],
    correctAnswer: 2,
  },
  {
    id: 'c2-l3',
    type: 'listening',
    level: 'C2',
    difficulty: 12,
    question: 'The idiom "a distinction without a difference" describes:',
    options: [
      'a meaningful distinction',
      'two things that are essentially the same despite seeming different',
      'a clear contrast',
      'an obvious error',
    ],
    correctAnswer: 1,
  },
];

// ─────────────────────────────────────
// Export Question Bank
// ─────────────────────────────────────

export const LEVEL_TEST_QUESTIONS: Record<CEFRLevel, TestQuestion[]> = {
  A1: A1_QUESTIONS,
  A2: A2_QUESTIONS,
  B1: B1_QUESTIONS,
  B2: B2_QUESTIONS,
  C1: C1_QUESTIONS,
  C2: C2_QUESTIONS,
};

export function createQuestionBank(): Map<CEFRLevel, TestQuestion[]> {
  const bank = new Map<CEFRLevel, TestQuestion[]>();
  bank.set('A1', [...A1_QUESTIONS]);
  bank.set('A2', [...A2_QUESTIONS]);
  bank.set('B1', [...B1_QUESTIONS]);
  bank.set('B2', [...B2_QUESTIONS]);
  bank.set('C1', [...C1_QUESTIONS]);
  bank.set('C2', [...C2_QUESTIONS]);
  return bank;
}

export function getTotalQuestionCount(): number {
  return (
    A1_QUESTIONS.length +
    A2_QUESTIONS.length +
    B1_QUESTIONS.length +
    B2_QUESTIONS.length +
    C1_QUESTIONS.length +
    C2_QUESTIONS.length
  );
}
