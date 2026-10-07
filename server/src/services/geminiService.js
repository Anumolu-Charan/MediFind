import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { ENV } from '../config/env.js';

export const aiOutputSchema = z.object({
  intent: z.literal('medicine_search').default('medicine_search'),
  medicine_name: z.string().default(''),
  generic_name: z.string().default(''),
  search_terms: z.array(z.string()).min(1, 'At least one search term is required'),
});

// Common medical keyword dictionary for local NLP fallback when GEMINI_API_KEY is not configured
const LOCAL_KNOWLEDGE = [
  { keywords: ['headache', 'fever', 'pain', 'dolo', 'paracetamol', 'crocin', 'calpol'], medicine: 'Paracetamol', generic: 'Acetaminophen', terms: ['Paracetamol', 'Acetaminophen', 'Dolo', 'Crocin', 'Calpol'] },
  { keywords: ['infection', 'amoxicillin', 'amoxil', 'mox', 'antibiotic'], medicine: 'Amoxicillin', generic: 'Amoxicillin Trihydrate', terms: ['Amoxicillin', 'Amoxil', 'Mox'] },
  { keywords: ['inflammation', 'swelling', 'ibuprofen', 'brufen', 'advil', 'motrin'], medicine: 'Ibuprofen', generic: 'Ibuprofen', terms: ['Ibuprofen', 'Brufen', 'Advil'] },
  { keywords: ['diabetes', 'sugar', 'blood sugar', 'metformin', 'glycomet'], medicine: 'Metformin', generic: 'Metformin Hydrochloride', terms: ['Metformin', 'Glycomet'] },
  { keywords: ['allergy', 'sneezing', 'cold', 'cetirizine', 'zyrtec', 'cetzine'], medicine: 'Cetirizine', generic: 'Cetirizine Dihydrochloride', terms: ['Cetirizine', 'Zyrtec', 'Cetzine'] },
  { keywords: ['cough', 'throat', 'azithromycin', 'azithral', 'zithromax'], medicine: 'Azithromycin', generic: 'Azithromycin', terms: ['Azithromycin', 'Azithral', 'Zithromax'] },
  { keywords: ['acidity', 'gas', 'heartburn', 'omeprazole', 'prilosec', 'omez'], medicine: 'Omeprazole', generic: 'Omeprazole', terms: ['Omeprazole', 'Omez', 'Prilosec'] },
  { keywords: ['cholesterol', 'atorvastatin', 'lipitor', 'atorva'], medicine: 'Atorvastatin', generic: 'Atorvastatin Calcium', terms: ['Atorvastatin', 'Lipitor', 'Atorva'] },
  { keywords: ['bp', 'blood pressure', 'hypertension', 'losartan', 'cozaar'], medicine: 'Losartan', generic: 'Losartan Potassium', terms: ['Losartan', 'Cozaar'] },
  { keywords: ['asthma', 'wheezing', 'breath', 'inhaler', 'salbutamol', 'ventolin', 'albuterol'], medicine: 'Salbutamol', generic: 'Albuterol / Salbutamol', terms: ['Salbutamol', 'Ventolin', 'Asthalin', 'Albuterol'] },
  { keywords: ['pantoprazole', 'pantocid', 'gerd', 'acid reflux'], medicine: 'Pantoprazole', generic: 'Pantoprazole Sodium', terms: ['Pantoprazole', 'Pantocid'] },
  { keywords: ['montelukast', 'singulair', 'montek', 'runny nose'], medicine: 'Montelukast', generic: 'Montelukast Sodium', terms: ['Montelukast', 'Singulair', 'Montek'] },
  { keywords: ['amlodipine', 'norvasc', 'amlong'], medicine: 'Amlodipine', generic: 'Amlodipine Besylate', terms: ['Amlodipine', 'Norvasc', 'Amlong'] },
  { keywords: ['ciprofloxacin', 'cipro', 'ciptox', 'bacterial'], medicine: 'Ciprofloxacin', generic: 'Ciprofloxacin Hydrochloride', terms: ['Ciprofloxacin', 'Cipro'] },
];

function fallbackNlpExtraction(query) {
  const normalized = query.toLowerCase().trim();
  const matched = LOCAL_KNOWLEDGE.find((entry) =>
    entry.keywords.some((k) => normalized.includes(k))
  );

  if (matched) {
    return {
      intent: 'medicine_search',
      medicine_name: matched.medicine,
      generic_name: matched.generic,
      search_terms: matched.terms,
    };
  }

  // Tokenize words
  const words = normalized
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['want', 'need', 'find', 'have', 'pharmacy', 'near', 'store', 'medicine', 'drug'].includes(w));

  const primaryWord = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'Paracetamol';
  return {
    intent: 'medicine_search',
    medicine_name: primaryWord,
    generic_name: primaryWord,
    search_terms: words.length > 0 ? words : [primaryWord],
  };
}

export async function parseNaturalLanguageMedicineQuery(query) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) {
    throw new Error('Search query is required');
  }

  // If GEMINI_API_KEY is available, invoke Gemini via official SDK
  if (ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY.trim() !== '') {
    try {
      const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
      const prompt = `You are a medicine entity extraction tool for a pharmaceutical inventory search engine.
CRITICAL SAFETY DIRECTIVE:
- AI must NEVER diagnose diseases or medical conditions.
- AI must NEVER prescribe treatments or medicines.
- AI must NEVER recommend dosages or schedules.
- Your sole responsibility is to extract relevant medicine names, brand names, and active chemical ingredients from the user's natural language request.

User query: "${cleanQuery}"

Respond strictly with valid JSON with the following format:
{
  "intent": "medicine_search",
  "medicine_name": "Primary medicine or brand name if identified, otherwise empty string",
  "generic_name": "Generic or active chemical compound if identified, otherwise empty string",
  "search_terms": ["List", "of", "keywords", "for", "database", "lookup"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsedJson = JSON.parse(responseText);

      // Validate strictly with Zod
      const validated = aiOutputSchema.parse(parsedJson);
      return {
        ...validated,
        source: 'gemini_api',
      };
    } catch (err) {
      console.warn('Gemini API call failed or schema mismatch, falling back to local NLP engine:', err.message);
      const fallback = fallbackNlpExtraction(cleanQuery);
      return {
        ...fallback,
        source: 'local_nlp_fallback',
        fallback_reason: err.message,
      };
    }
  }

  // If no Gemini API key configured, use local intelligent NLP extraction
  const fallback = fallbackNlpExtraction(cleanQuery);
  return {
    ...fallback,
    source: 'local_nlp_fallback',
    note: 'GEMINI_API_KEY is not set. Intelligent local NLP extraction was used.',
  };
}
