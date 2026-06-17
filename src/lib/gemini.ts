import { GoogleGenerativeAI } from '@google/generative-ai';

// Free-tier models in order of preference (v1beta, 2025)
const MODEL_FALLBACKS = [
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Extract retry-after seconds from a 429 error message */
function parseRetryDelay(msg: string): number {
  const match = msg.match(/retry in (\d+(?:\.\d+)?)s/i);
  return match ? Math.ceil(parseFloat(match[1])) : 60;
}

function isRateLimit(err: any): boolean {
  const m = err?.message || '';
  return m.includes('429') || m.includes('RESOURCE_EXHAUSTED') || m.includes('quota');
}

function isDailyQuota(msg: string): boolean {
  const m = msg || '';
  return m.includes('GenerateRequestsPerDay') || m.includes('PerDay') || m.includes('limit: 0') || m.includes('daily');
}

function isNotFound(err: any): boolean {
  const m = err?.message || '';
  return m.includes('404') || m.includes('not found');
}

export class RateLimitError extends Error {
  retryAfterSeconds: number;
  constructor(seconds: number) {
    super(`Rate limit hit. Please wait ${seconds} seconds and try again.`);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = seconds;
  }
}

export class DailyQuotaError extends Error {
  constructor() {
    super('Daily free tier quota exhausted. Please try again tomorrow or use a different API key.');
    this.name = 'DailyQuotaError';
  }
}

export function getGeminiClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

async function askOpenAI(
  apiKey: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const sysPrompt = systemInstruction ||
    'You are LearnAI, an expert educational AI tutor. Provide clear, engaging, accurate explanations suitable for students. Use examples, analogies, and real-world applications. Format responses with clear structure using markdown.';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || `OpenAI error: ${response.statusText}`;
    const errorCode = errorData.error?.code || '';
    
    if (
      errorCode === 'insufficient_quota' ||
      errorMsg.toLowerCase().includes('quota') ||
      errorMsg.toLowerCase().includes('billing') ||
      errorMsg.toLowerCase().includes('exceeded your current quota')
    ) {
      throw new DailyQuotaError();
    }

    if (response.status === 429) {
      throw new RateLimitError(60);
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function askGroq(
  apiKey: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const sysPrompt = systemInstruction ||
    'You are LearnAI, an expert educational AI tutor. Provide clear, engaging, accurate explanations suitable for students. Use examples, analogies, and real-world applications. Format responses with clear structure using markdown.';

  const GROQ_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768'
  ];

  let lastError: any;

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `Groq error: ${response.statusText}`;
        const errorCode = errorData.error?.code || '';

        if (
          errorCode === 'quota_exceeded' ||
          errorMsg.toLowerCase().includes('quota') ||
          errorMsg.toLowerCase().includes('limit exceeded') ||
          response.status === 403
        ) {
          // If we hit a hard limit, try next model or throw DailyQuotaError
          if (model === GROQ_MODELS[GROQ_MODELS.length - 1]) {
            throw new DailyQuotaError();
          }
          throw new RateLimitError(30);
        }

        if (response.status === 429) {
          throw new RateLimitError(30);
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (err: any) {
      lastError = err;
      if (err instanceof RateLimitError) {
        // Wait briefly or try next fallback model
        await sleep(1000);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Failed to generate response from Groq');
}

async function askOpenRouter(
  apiKey: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const sysPrompt = systemInstruction ||
    'You are LearnAI, an expert educational AI tutor. Provide clear, engaging, accurate explanations suitable for students. Use examples, analogies, and real-world applications. Format responses with clear structure using markdown.';

  const OPENROUTER_MODELS = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'qwen/qwen-2.5-72b-instruct:free'
  ];

  let lastError: any;

  for (const model of OPENROUTER_MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
          'X-Title': 'LearnAI Platform'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `OpenRouter error: ${response.statusText}`;

        if (errorMsg.toLowerCase().includes('credit') || errorMsg.toLowerCase().includes('balance') || response.status === 402) {
          throw new DailyQuotaError();
        }

        if (response.status === 429) {
          throw new RateLimitError(45);
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (err: any) {
      lastError = err;
      if (err instanceof RateLimitError) {
        await sleep(1000);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Failed to generate response from OpenRouter');
}

async function getOllamaModels(host: string): Promise<string[]> {
  try {
    const response = await fetch(`${host}/api/tags`, { method: 'GET' });
    if (response.ok) {
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    }
  } catch (err) {
    console.error('Ollama is not running locally or tags endpoint failed:', err);
  }
  return [];
}

async function askOllama(
  apiKey: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const sysPrompt = systemInstruction ||
    'You are LearnAI, an expert educational AI tutor. Provide clear, engaging, accurate explanations suitable for students. Use examples, analogies, and real-world applications. Format responses with clear structure using markdown.';

  const host = apiKey.trim().startsWith('http') ? apiKey.trim() : 'http://localhost:11434';
  
  let models = await getOllamaModels(host);
  if (models.length === 0) {
    models = ['llama3.1', 'llama3', 'mistral', 'phi3'];
  }

  let lastError: any;

  for (const model of models) {
    try {
      const response = await fetch(`${host}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama failed with status: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (err: any) {
      lastError = err;
      // Continue to next model if model not found or server fails
      continue;
    }
  }

  throw lastError || new Error(`Could not generate response from Ollama. Make sure Ollama is running at ${host} and you have pulled a model (e.g. run 'ollama pull llama3.1' in terminal).`);
}

export async function askGemini(
  apiKey: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const resolvedKey = apiKey?.trim() || process.env.NEXT_PUBLIC_DEFAULT_API_KEY || '';
  if (!resolvedKey) throw new Error('No API key provided');

  const trimmedKey = resolvedKey.trim();

  // Ollama local routing
  if (trimmedKey.toLowerCase() === 'ollama' || trimmedKey.startsWith('http://localhost') || trimmedKey.startsWith('http://127.0.0.1')) {
    return askOllama(trimmedKey, prompt, systemInstruction);
  }

  // Groq Llama routing
  if (trimmedKey.startsWith('gsk_')) {
    return askGroq(trimmedKey, prompt, systemInstruction);
  }

  // OpenRouter Llama routing
  if (trimmedKey.startsWith('sk-or-')) {
    return askOpenRouter(trimmedKey, prompt, systemInstruction);
  }

  // Automatically detect OpenAI key
  if (trimmedKey.startsWith('sk-')) {
    return askOpenAI(trimmedKey, prompt, systemInstruction);
  }

  const genAI = getGeminiClient(trimmedKey);
  const sysPrompt = systemInstruction ||
    'You are LearnAI, an expert educational AI tutor. Provide clear, engaging, accurate explanations suitable for students. Use examples, analogies, and real-world applications. Format responses with clear structure using markdown.';

  let lastError: any;

  for (const modelName of MODEL_FALLBACKS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: sysPrompt });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) return text;
    } catch (err: any) {
      lastError = err;

      if (isRateLimit(err)) {
        if (isDailyQuota(err.message || '')) {
          // Daily quota limit: try the next fallback model immediately
          continue;
        }
        // Short-term rate limit (RPM/TPM): Parse retry delay and wait, then try the same model once more
        const delaySec = parseRetryDelay(err.message || '');
        const waitMs = Math.min(delaySec * 1000, 65_000); // cap at 65s
        await sleep(waitMs);
        try {
          const model2 = genAI.getGenerativeModel({ model: modelName, systemInstruction: sysPrompt });
          const result2 = await model2.generateContent(prompt);
          const text2 = result2.response.text();
          if (text2) return text2;
        } catch (err2: any) {
          lastError = err2;
          if (isRateLimit(err2)) {
            if (isDailyQuota(err2.message || '')) {
              continue; // try next model
            }
            throw new RateLimitError(parseRetryDelay(err2.message || ''));
          }
          if (!isNotFound(err2)) throw err2;
        }
      } else if (!isNotFound(err)) {
        // Auth errors, network errors etc — rethrow immediately
        throw err;
      }
      // 404 → try next model in list
    }
  }

  if (lastError && isRateLimit(lastError) && isDailyQuota(lastError.message || '')) {
    throw new DailyQuotaError();
  }

  throw lastError ?? new Error('No available Gemini model found');
}



export async function generateQuiz(
  apiKey: string,
  topic: string,
  subject: string,
  level: string,
  count = 8
): Promise<QuizQuestion[]> {
  const prompt = `Generate ${count} quiz questions about "${topic}" for ${subject} at ${level} level.
Return ONLY a JSON array with this exact structure (no markdown, no explanation):
[
  {
    "question": "Question text",
    "type": "mcq",
    "options": ["A", "B", "C", "D"],
    "answer": 0,
    "explanation": "Why this is correct"
  }
]
Mix MCQ and true/false (for true/false, options are ["True","False"] and answer is 0 or 1).`;

  const response = await askGemini(apiKey, prompt, 'You are a quiz generator. Return ONLY valid JSON arrays, no markdown code blocks.');
  
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return getMockQuiz(topic, subject);
  }
}

export async function generateTopicContent(
  apiKey: string,
  topic: string,
  subject: string,
  level: string
): Promise<TopicContent> {
  const prompt = `Create comprehensive educational content about "${topic}" in ${subject} for a ${level} learner.
Return ONLY a JSON object:
{
  "title": "Topic title",
  "summary": "2-3 sentence overview",
  "keyPoints": ["point1", "point2", "point3", "point4", "point5"],
  "explanation": "Detailed explanation in 3-4 paragraphs",
  "realWorldApplications": ["application1", "application2", "application3"],
  "funFact": "An interesting surprising fact",
  "difficulty": "beginner|intermediate|expert"
}`;

  const response = await askGemini(apiKey, prompt, 'You are an educational content generator. Return ONLY valid JSON.');
  
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return getMockContent(topic, subject);
  }
}

export async function analyzePDF(
  apiKey: string,
  text: string
): Promise<PDFAnalysis> {
  const prompt = `Analyze this educational text and return ONLY a JSON object:
{
  "title": "Document title or topic",
  "subject": "Best matching subject",
  "summary": "3-4 sentence summary",
  "keyConceptsArray": ["concept1", "concept2", "concept3"],
  "learningObjectives": ["objective1", "objective2", "objective3"],
  "difficulty": "beginner|intermediate|expert",
  "topics": ["topic1", "topic2"]
}

TEXT: ${text.substring(0, 3000)}`;

  const response = await askGemini(apiKey, prompt, 'You are an educational content analyzer. Return ONLY valid JSON.');
  
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { title: 'Uploaded Document', subject: 'General', summary: text.substring(0, 200), keyConceptsArray: [], learningObjectives: [], difficulty: 'beginner', topics: [] };
  }
}

export interface QuizQuestion {
  question: string;
  type: 'mcq' | 'truefalse';
  options: string[];
  answer: number;
  explanation: string;
}

export interface TopicContent {
  title: string;
  summary: string;
  keyPoints: string[];
  explanation: string;
  realWorldApplications: string[];
  funFact: string;
  difficulty: string;
}

export interface PDFAnalysis {
  title: string;
  subject: string;
  summary: string;
  keyConceptsArray: string[];
  learningObjectives: string[];
  difficulty: string;
  topics: string[];
}

function getMockQuiz(topic: string, subject: string): QuizQuestion[] {
  return [
    { question: `What is the primary focus of ${topic}?`, type: 'mcq', options: ['Understanding concepts', 'Memorizing facts', 'Solving problems', 'All of the above'], answer: 3, explanation: 'Learning involves understanding concepts, memorizing key facts, and applying knowledge to solve problems.' },
    { question: `${topic} is an important area of study in ${subject}.`, type: 'truefalse', options: ['True', 'False'], answer: 0, explanation: `${topic} is indeed a fundamental concept in ${subject}.` },
    { question: 'Which approach is best for learning new concepts?', type: 'mcq', options: ['Passive reading', 'Active engagement', 'Memorization only', 'Skipping examples'], answer: 1, explanation: 'Active engagement including practice, questions, and application leads to better learning outcomes.' },
    { question: 'Practice and repetition help reinforce learning.', type: 'truefalse', options: ['True', 'False'], answer: 0, explanation: 'Spaced repetition and practice are proven to improve long-term retention.' },
  ];
}

function getMockContent(topic: string, subject: string): TopicContent {
  return {
    title: topic,
    summary: `${topic} is a fundamental concept in ${subject}. Understanding it provides the foundation for more advanced topics and real-world applications.`,
    keyPoints: [
      `${topic} is a core concept in ${subject}`,
      'It has numerous practical applications',
      'Understanding it requires both theory and practice',
      'It connects to many other topics in the field',
      'Mastery comes through active learning and experimentation'
    ],
    explanation: `${topic} represents one of the most important concepts to understand in ${subject}. By studying it carefully and applying what you learn, you'll develop a strong foundation for further learning.\n\nThe principles underlying ${topic} have been studied and refined over many years. Modern understanding incorporates both classical theory and contemporary research findings.\n\nPractical application of ${topic} can be found in many everyday situations, making it particularly valuable to learn and master.`,
    realWorldApplications: [
      'Used in everyday technology and devices',
      'Applied in scientific research',
      'Foundational to many modern industries'
    ],
    funFact: `The study of ${topic} has led to some of the most important discoveries in ${subject} history!`,
    difficulty: 'beginner'
  };
}

export function getMockChatResponse(subjectName: string, prompt: string, apiKey?: string): string {
  const cleanPrompt = prompt.toLowerCase();
  const key = apiKey?.trim() || '';
  
  let providerName: string;
  let reasonText: string;

  if (key.toLowerCase() === 'ollama' || key.startsWith('http://localhost') || key.startsWith('http://127.0.0.1')) {
    providerName = 'Ollama (Local Llama)';
    reasonText = 'could not connect — make sure Ollama is running (run "ollama serve" in your terminal)';
  } else if (key.startsWith('gsk_')) {
    providerName = 'Groq (Llama 3)';
    reasonText = 'hit a rate limit or quota — wait a moment and try again';
  } else if (key.startsWith('sk-or-')) {
    providerName = 'OpenRouter (Llama 3)';
    reasonText = 'hit a rate limit or quota — wait a moment and try again';
  } else if (key.startsWith('sk-')) {
    providerName = 'OpenAI';
    reasonText = 'is out of credits or expired';
  } else {
    providerName = 'Gemini';
    reasonText = 'is currently out of daily quota (or not configured)';
  }
  
  if (cleanPrompt.includes('formula') || cleanPrompt.includes('equation')) {
    return `📝 **Key Formulas in ${subjectName}**\n\nHere are some of the most fundamental equations and principles in this subject:\n\n1. **Standard Relation**: $A = B \\times C$ — expressing the direct proportionality of key parameters.\n2. **Conservation Law**: Total input energy/mass equals total output.\n3. **Rate of Change**: $\\frac{dy}{dx}$ represents how one quantity changes relative to another.\n\n*Would you like to try a practice problem using one of these?*`;
  }
  
  if (cleanPrompt.includes('example') || cleanPrompt.includes('real world') || cleanPrompt.includes('application')) {
    return `🌍 **Real-World Application in ${subjectName}**\n\nThis subject is used in many industries and everyday situations:\n\n- **Technology**: Core algorithms and design patterns are implemented in smartphones, search engines, and smart devices.\n- **Industry**: Factories, financial markets, and laboratories rely on these principles to optimize operations and safety.\n- **Everyday Life**: When you observe natural phenomena, manage personal finances, or use modern transit, you are seeing these concepts in action.\n\n*What specific application area are you most interested in?*`;
  }

  if (cleanPrompt.includes('quiz') || cleanPrompt.includes('test') || cleanPrompt.includes('question')) {
    return `📝 **Quick Practice Question**\n\nHere is a quick question to test your understanding of **${subjectName}**:\n\n*Which of the following best describes the core objective of this subject?*\n\n1. Rote memorization of facts\n2. Analytical problem solving and conceptual understanding\n3. Simply observing without active engagement\n\n*Reply with 1, 2, or 3 to answer!*`;
  }

  return `🤖 **LearnAI Tutor (Offline Demo Mode)**\n\nYour **${providerName}** ${reasonText}, so I am running in **Offline Demo Mode** to keep your learning active!\n\nHere is an explanation related to your query on **${subjectName}**:\n\n- **Core Concept**: ${subjectName} is built upon structured, logical principles. Understanding the basics allows you to build intuition for complex behaviors.\n- **Active Learning**: Try to break down concepts into smaller parts, draw analogies, and relate them to things you already know.\n- **Next Steps**: You can generate quizzes, read generated topics, or check the Settings (⚙️) in the top bar to configure your AI provider.\n\n*Ask me to give an example, show key formulas, or quiz you on this subject!*`;
}
