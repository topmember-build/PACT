import { KNOWLEDGE_BASE, FALLBACK_ANSWER, type KnowledgeTopic } from './pactKnowledge';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface ChatResponse {
  answer: string;
  followUps: string[];
  topicId: string | null;
}

// ─── TOKENIZER ────────────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

// ─── SCORER ───────────────────────────────────────────────────────────────────

function scoreTopic(topic: KnowledgeTopic, inputTokens: string[], rawInput: string): number {
  const lowerInput = rawInput.toLowerCase();
  let score = 0;

  for (const keyword of topic.keywords) {
    const kw = keyword.toLowerCase();

    // Exact phrase match (highest weight)
    if (lowerInput.includes(kw)) {
      score += kw.includes(' ') ? 4 : 2; // multi-word phrases score higher
    }

    // Token overlap
    const kwTokens = tokenize(kw);
    for (const token of inputTokens) {
      if (kwTokens.includes(token)) {
        score += 1;
      }
    }
  }

  return score;
}

// ─── MAIN ENGINE ──────────────────────────────────────────────────────────────

export function getAnswer(userMessage: string, lastTopicId?: string | null): ChatResponse {
  const tokens = tokenize(userMessage);
  const lower = userMessage.toLowerCase();

  // Handle meta questions
  if (
    lower.includes('what can you') ||
    lower.includes('help with') ||
    lower.includes('what do you know') ||
    lower.includes('topics') ||
    lower.includes('capabilities') ||
    (lower.includes('what') && lower.includes('ask'))
  ) {
    return {
      answer: FALLBACK_ANSWER,
      followUps: ['How do I create a pact?', 'What rule types are there?', 'How do I connect my wallet?'],
      topicId: null,
    };
  }

  // Handle greetings
  const greetings = ['hi', 'hello', 'hey', 'sup', 'hii', 'helo', 'howdy', 'yo'];
  if (tokens.length <= 3 && tokens.some((t) => greetings.includes(t))) {
    return {
      answer: `Hey! I'm **Pact AI** — your guide to everything on this platform.\n\nI can help you understand how Pact works, walk you through creating your first pact, explain the different rule types, guardians, commitment scores, and more.\n\nWhat would you like to know?`,
      followUps: ['How do I get started?', 'What is Pact?', 'What rules can I choose?'],
      topicId: null,
    };
  }

  // Handle thanks
  if (tokens.some((t) => ['thanks', 'thank', 'thx', 'ty', 'cheers', 'appreciate'].includes(t))) {
    return {
      answer: `You're welcome! Feel free to ask anything else about Pact.`,
      followUps: ['How do I create a pact?', 'What is the commitment score?', 'How do guardians work?'],
      topicId: null,
    };
  }

  // Score all topics
  const scored = KNOWLEDGE_BASE.map((topic) => ({
    topic,
    score: scoreTopic(topic, tokens, userMessage),
  })).sort((a, b) => b.score - a.score);

  const best = scored[0];

  // If best score is reasonable, return that topic
  if (best.score >= 2) {
    return {
      answer: best.topic.answer,
      followUps: best.topic.followUps,
      topicId: best.topic.id,
    };
  }

  // If score is marginal (1), check if there's contextual overlap with last topic
  if (best.score === 1 && lastTopicId) {
    const lastTopic = KNOWLEDGE_BASE.find((t) => t.id === lastTopicId);
    if (lastTopic) {
      // Check if the question relates to a follow-up of the last topic
      const followUpMatch = lastTopic.followUps.find((fu) => {
        const fuTokens = tokenize(fu);
        return tokens.some((t) => fuTokens.includes(t));
      });
      if (followUpMatch) {
        return getAnswer(followUpMatch);
      }
    }
  }

  // Fallback
  return {
    answer: FALLBACK_ANSWER,
    followUps: ['How do I create a pact?', 'What rule types are there?', 'How do I connect my wallet?'],
    topicId: null,
  };
}
