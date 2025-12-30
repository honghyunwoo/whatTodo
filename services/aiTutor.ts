/**
 * AI Tutor Service
 * OpenAI API를 활용한 AI 영어 회화 튜터
 */

import { CEFRLevel } from '@/types/activity';

// ─────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface GrammarError {
  type: 'grammar' | 'vocabulary' | 'spelling' | 'punctuation';
  original: string;
  correction: string;
  explanation: string;
  koreanTip: string;
}

export interface GrammarFeedback {
  original: string;
  corrected: string;
  isCorrect: boolean;
  errors: GrammarError[];
  encouragement: string;
}

export interface AIResponse {
  message: string;
  feedback: GrammarFeedback | null;
  suggestions: string[];
  topic?: string;
}

export interface ConversationContext {
  topic: string;
  level: CEFRLevel;
  conversationHistory: ConversationMessage[];
  sessionId: string;
}

// ─────────────────────────────────────
// 설정
// ─────────────────────────────────────

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// CEFR 레벨별 시스템 프롬프트
const SYSTEM_PROMPTS: Record<CEFRLevel, string> = {
  A1: `You are a friendly English tutor for Korean beginners (CEFR A1).
Rules:
- Use very simple vocabulary and short sentences
- Speak slowly and clearly
- Focus on basic greetings, introductions, and daily expressions
- Provide detailed Korean explanations for grammar corrections
- Be very encouraging and patient
- Use present tense mostly`,

  A2: `You are a friendly English tutor for Korean elementary learners (CEFR A2).
Rules:
- Use simple vocabulary and basic sentence structures
- Cover everyday topics like shopping, travel, family
- Explain grammar in Korean when correcting
- Encourage using past and future tenses
- Be patient and supportive`,

  B1: `You are an English tutor for Korean intermediate learners (CEFR B1).
Rules:
- Use moderate vocabulary and various sentence structures
- Discuss personal experiences, opinions, and plans
- Provide grammar corrections with Korean explanations
- Encourage complex sentences and connectors
- Balance correction with encouragement`,

  B2: `You are an English tutor for Korean upper-intermediate learners (CEFR B2).
Rules:
- Use natural vocabulary including idioms
- Discuss abstract topics, current events, professional subjects
- Correct nuanced grammar and style issues
- Encourage expressing complex ideas
- Focus on fluency and naturalness`,

  C1: `You are an English tutor for Korean advanced learners (CEFR C1).
Rules:
- Use sophisticated vocabulary and complex structures
- Discuss academic, professional, and abstract topics
- Focus on subtle grammar nuances and style
- Correct register and formality issues
- Challenge with advanced expressions`,

  C2: `You are an English tutor for Korean near-native speakers (CEFR C2).
Rules:
- Use native-level vocabulary including nuances
- Discuss any topic at native level
- Focus on subtle stylistic improvements
- Correct idiomatic usage and register
- Help achieve complete naturalness`,
};

// 기본 대화 주제
const CONVERSATION_TOPICS = {
  A1: ['Greetings', 'Self-introduction', 'Family', 'Food', 'Weather'],
  A2: ['Daily routine', 'Hobbies', 'Shopping', 'Travel', 'School/Work'],
  B1: ['Personal experiences', 'Future plans', 'Opinions', 'Culture', 'Health'],
  B2: ['Current events', 'Technology', 'Environment', 'Career', 'Society'],
  C1: ['Philosophy', 'Politics', 'Science', 'Art', 'Global issues'],
  C2: ['Any topic at native level'],
};

// ─────────────────────────────────────
// API 호출
// ─────────────────────────────────────

/**
 * OpenAI API 키 가져오기
 */
function getApiKey(): string | null {
  return process.env.EXPO_PUBLIC_OPENAI_API_KEY || null;
}

/**
 * API 사용 가능 여부 확인
 */
export function isAIConfigured(): boolean {
  const apiKey = getApiKey();
  return !!apiKey && apiKey !== 'your_openai_api_key_here';
}

/**
 * OpenAI API 호출
 */
async function callOpenAI(
  messages: { role: string; content: string }[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || 'gpt-3.5-turbo',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// ─────────────────────────────────────
// 문법 검사
// ─────────────────────────────────────

/**
 * 문법 검사 및 피드백 생성
 */
export async function checkGrammar(text: string, level: CEFRLevel): Promise<GrammarFeedback> {
  if (!isAIConfigured()) {
    // 오프라인 모드: 기본 피드백 반환
    return {
      original: text,
      corrected: text,
      isCorrect: true,
      errors: [],
      encouragement: 'Keep practicing!',
    };
  }

  const prompt = `You are a Korean-English grammar checker. Analyze the following English sentence from a Korean learner (${level} level).

User's sentence: "${text}"

Respond in this exact JSON format:
{
  "corrected": "the corrected sentence",
  "isCorrect": true/false,
  "errors": [
    {
      "type": "grammar/vocabulary/spelling/punctuation",
      "original": "the wrong part",
      "correction": "the correct version",
      "explanation": "explanation in English",
      "koreanTip": "한국어로 설명"
    }
  ],
  "encouragement": "encouraging message in Korean"
}

If the sentence is correct, return empty errors array and isCorrect: true.`;

  try {
    const response = await callOpenAI([
      {
        role: 'system',
        content: 'You are a helpful grammar checker that responds only in valid JSON.',
      },
      { role: 'user', content: prompt },
    ]);

    // JSON 파싱
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      original: text,
      corrected: parsed.corrected || text,
      isCorrect: parsed.isCorrect ?? true,
      errors: parsed.errors || [],
      encouragement: parsed.encouragement || '잘하고 있어요! 계속 연습하세요!',
    };
  } catch (error) {
    console.error('[AITutor] Grammar check failed:', error);
    return {
      original: text,
      corrected: text,
      isCorrect: true,
      errors: [],
      encouragement: '계속 연습하세요!',
    };
  }
}

// ─────────────────────────────────────
// 대화 기능
// ─────────────────────────────────────

/**
 * 대화 시작
 */
export async function startConversation(level: CEFRLevel, topic?: string): Promise<AIResponse> {
  const selectedTopic = topic || CONVERSATION_TOPICS[level][0];
  const systemPrompt = SYSTEM_PROMPTS[level];

  if (!isAIConfigured()) {
    // 오프라인 모드: 기본 응답
    return {
      message: getOfflineStarterMessage(level, selectedTopic),
      feedback: null,
      suggestions: getOfflineSuggestions(level),
      topic: selectedTopic,
    };
  }

  const prompt = `Start a friendly conversation about "${selectedTopic}". Ask a simple question to get the conversation going. Keep it appropriate for ${level} level learners.`;

  try {
    const response = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ]);

    return {
      message: response,
      feedback: null,
      suggestions: getSuggestions(level, selectedTopic),
      topic: selectedTopic,
    };
  } catch (error) {
    console.error('[AITutor] Start conversation failed:', error);
    return {
      message: getOfflineStarterMessage(level, selectedTopic),
      feedback: null,
      suggestions: getOfflineSuggestions(level),
      topic: selectedTopic,
    };
  }
}

/**
 * 대화 계속하기
 */
export async function continueConversation(
  userMessage: string,
  context: ConversationContext
): Promise<AIResponse> {
  const systemPrompt = SYSTEM_PROMPTS[context.level];

  // 먼저 문법 검사
  const feedback = await checkGrammar(userMessage, context.level);

  if (!isAIConfigured()) {
    return {
      message: getOfflineResponse(context.level),
      feedback,
      suggestions: getOfflineSuggestions(context.level),
      topic: context.topic,
    };
  }

  // 대화 히스토리 구성
  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.conversationHistory.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  // 피드백이 있으면 시스템 메시지에 추가
  if (!feedback.isCorrect && feedback.errors.length > 0) {
    messages.push({
      role: 'system',
      content: `The user made some errors. Acknowledge their message naturally, then gently incorporate the correction in your response without being condescending. Errors: ${JSON.stringify(feedback.errors)}`,
    });
  }

  try {
    const response = await callOpenAI(messages);

    return {
      message: response,
      feedback: feedback.isCorrect ? null : feedback,
      suggestions: getSuggestions(context.level, context.topic),
      topic: context.topic,
    };
  } catch (error) {
    console.error('[AITutor] Continue conversation failed:', error);
    return {
      message: getOfflineResponse(context.level),
      feedback,
      suggestions: getOfflineSuggestions(context.level),
      topic: context.topic,
    };
  }
}

// ─────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────

function getSuggestions(level: CEFRLevel, topic: string): string[] {
  const suggestions: Record<CEFRLevel, string[]> = {
    A1: ['I like...', 'I am...', 'This is...', 'I want...'],
    A2: ['I usually...', 'Yesterday I...', 'I think...', 'Can you...?'],
    B1: [
      'In my opinion...',
      'I believe that...',
      'What do you think about...?',
      'I agree/disagree because...',
    ],
    B2: [
      'From my perspective...',
      'It seems to me that...',
      'I would argue that...',
      'Could you elaborate on...?',
    ],
    C1: [
      'Taking into account...',
      'It could be argued that...',
      'The implications of...',
      'With reference to...',
    ],
    C2: [
      'Notwithstanding...',
      'Be that as it may...',
      'In light of...',
      'It goes without saying that...',
    ],
  };
  return suggestions[level] || suggestions.A1;
}

function getOfflineStarterMessage(level: CEFRLevel, topic: string): string {
  const starters: Record<CEFRLevel, string> = {
    A1: `Hello! Let's talk about ${topic}. What is your name?`,
    A2: `Hi there! Today we can talk about ${topic}. Tell me about yourself.`,
    B1: `Hey! I'd love to discuss ${topic} with you. What are your thoughts?`,
    B2: `Hello! Let's have a conversation about ${topic}. What's your take on it?`,
    C1: `Good day! I'd be interested to explore ${topic} with you. Where shall we begin?`,
    C2: `Greetings! I'm looking forward to delving into ${topic}. What aspects interest you most?`,
  };
  return starters[level];
}

function getOfflineResponse(level: CEFRLevel): string {
  const responses: Record<CEFRLevel, string[]> = {
    A1: ["That's nice!", 'I see.', 'Tell me more.', 'Good job!'],
    A2: ["That's interesting!", 'I understand.', 'Can you explain more?', 'Well done!'],
    B1: [
      "That's a good point.",
      'I agree with that.',
      'Could you elaborate?',
      'Interesting perspective!',
    ],
    B2: [
      "That's quite insightful.",
      'I see your point.',
      'What led you to that conclusion?',
      'Fascinating!',
    ],
    C1: [
      "That's a nuanced observation.",
      'I appreciate your perspective.',
      'Could you expand on that?',
      'Thought-provoking!',
    ],
    C2: [
      'A sophisticated point of view.',
      'Your analysis is compelling.',
      "I'd be curious to hear more.",
      'Eloquently put!',
    ],
  };
  const levelResponses = responses[level];
  return levelResponses[Math.floor(Math.random() * levelResponses.length)];
}

function getOfflineSuggestions(level: CEFRLevel): string[] {
  return getSuggestions(level, '');
}

// ─────────────────────────────────────
// 사용량 관리
// ─────────────────────────────────────

export interface AIUsage {
  dailyCount: number;
  lastResetDate: string;
  totalCount: number;
}

const DAILY_FREE_LIMIT = 5;

/**
 * 사용량 확인
 */
export function checkUsageLimit(usage: AIUsage): { canUse: boolean; remaining: number } {
  const today = new Date().toISOString().split('T')[0];

  if (usage.lastResetDate !== today) {
    // 날짜가 바뀌면 리셋
    return { canUse: true, remaining: DAILY_FREE_LIMIT };
  }

  const remaining = Math.max(0, DAILY_FREE_LIMIT - usage.dailyCount);
  return { canUse: remaining > 0, remaining };
}

/**
 * 사용량 증가
 */
export function incrementUsage(usage: AIUsage): AIUsage {
  const today = new Date().toISOString().split('T')[0];

  if (usage.lastResetDate !== today) {
    return {
      dailyCount: 1,
      lastResetDate: today,
      totalCount: usage.totalCount + 1,
    };
  }

  return {
    ...usage,
    dailyCount: usage.dailyCount + 1,
    totalCount: usage.totalCount + 1,
  };
}

// ─────────────────────────────────────
// Export
// ─────────────────────────────────────

export const aiTutor = {
  isConfigured: isAIConfigured,
  checkGrammar,
  startConversation,
  continueConversation,
  checkUsageLimit,
  incrementUsage,
  CONVERSATION_TOPICS,
  DAILY_FREE_LIMIT,
};

export default aiTutor;
