// Vocabix AI — Gemini AI Service (Free tier)
const https = require("https");

function callGemini(prompt, maxTokens = 800)  {
  return new Promise((resolve) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes("your_key") || apiKey.length < 10) {
      return resolve(null);
    }

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
        topP: 0.9,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      ],
    });

    const model = "gemini-2.5-flash"; // Free tier model
    const path = `/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const req = https.request({
      hostname: "generativelanguage.googleapis.com",
      path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || null;
          resolve(text);
        } catch {
          resolve(null);
        }
      });
    });

    req.on("error", () => resolve(null));
    req.setTimeout(12000, () => { req.destroy(); resolve(null); });
    req.write(body);
    req.end();
  });
}

exports.explainWord = async (word, definition, level = "simple") => {
  const instructions = {
    kid:    `Explain the word "${word}" like the person is 5 years old. Use very simple words, a fun comparison, and a memory trick. Keep it under 80 words. Be playful!`,
    simple: `Explain the word "${word}" for a beginner. Cover: 1) Simple meaning in one sentence 2) A real-life example 3) A quick memory tip. Keep it friendly and short (under 120 words).`,
    expert: `Give an expert-level explanation of "${word}": etymology, nuanced usage, related linguistic concepts, register differences, and an example in academic context. Be thorough but concise.`,
  };
  const prompt = `${instructions[level] || instructions.simple}\n\nKnown definition: "${definition}"\n\nProvide only the explanation, no preamble or labels.`;
  return await callGemini(prompt, 600);
};

exports.generateAIQuiz = async (word, definition) => {
  const prompt = `Create an engaging multiple-choice quiz question for the English word "${word}" (meaning: "${definition}").
Make the options plausible but distinct. Return ONLY valid JSON with no extra text or markdown:
{"question":"...","options":["option A","option B","option C","option D"],"correctAnswer":"the full correct option text","explanation":"one sentence why"}`;
  const raw = await callGemini(prompt, 350);
  if (!raw) return null;
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch { return null; }
};

exports.getWordDNA = async (word, definition) => {
  const prompt = `Analyze the English word "${word}" (meaning: "${definition}") and provide a Word DNA report.
Return ONLY valid JSON with no extra text or markdown:
{
  "origin": "brief etymology in one sentence",
  "difficulty": "easy|medium|hard",
  "emotion": "the emotional tone or feeling of this word",
  "usageContext": "formal|informal|academic|literary|everyday",
  "funFact": "one surprising or interesting fact about this word",
  "relatedWords": ["word1","word2","word3"]
}`;
  const raw = await callGemini(prompt, 280);
  if (!raw) return null;
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch { return null; }
};

exports.getMoodWords = async (mood) => {
  const prompt = `Give me 8 beautiful, evocative English words that match the "${mood}" mood/emotion.
For each word provide a short poetic definition. Return ONLY valid JSON array with no extra text:
[{"word":"...","definition":"short poetic definition under 20 words"},...]`;
  const raw = await callGemini(prompt, 400);
  if (!raw) return null;
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch { return null; }
};
