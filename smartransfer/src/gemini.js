export async function generateAIReview(data) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const prompt = `
  You are a financial routing expert.
  
  A user wants to send ${data.amount} ${data.originCurrency}
  to ${data.destCurrency}.
  
  The recommended option is "${data.recommendation.name}"
  with a total fee of ${data.recommendation.totalFee.toFixed(2)}
  (${data.recommendation.costPct.toFixed(2)}% of the transfer),
  and an estimated settlement time of ${data.recommendation.settlementHours} hours.
  
  In 4 concise sentences:
  
  1. Explain why this option is optimal.
  2. Mention any important risk or caveat.
  3. Briefly explain how the user would execute this transfer step-by-step.
  4. Give one practical tip to reduce cost or delay.

  If the method is crypto, explain the on-ramp, wallet transfer, and off-ramp process.
  If the method is a traditional provider, explain account linking and transfer steps.
  
  Be clear and professional. Keep under 120 words.
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error("Gemini error:", result);
    return result.error?.message || "Gemini error.";
  }

  return result.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response.";
}