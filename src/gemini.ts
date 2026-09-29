// src/gemini.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.llm7.io/v1',
  apiKey: 'WlnQZWU1H1EopGJ4jr/BuVmh9tEImniKl3yVbjZ7hv3gOqvHCdz4ylgZKQHAz4Q868BPBj8uf8slokskkw8mq6CH1pouLlFuOe1vrujWqEOg/ZOkFvEcZ0lyt6wXekMUpztw37NCMU9nQD1cr9Mm7Mcp',
});

export const sendMessageToGemini = async (userMessage: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'default', // 👈 تم التغيير من gpt-4o-mini إلى default
      messages: [
        {
          role: 'system',
          content: 'أنت مساعد دراسي ذكي للطلاب الجامعيين. اشرح المفاهيم بطريقة مبسطة خطوة بخطوة. استخدم أمثلة عملية. إذا طلب منك الطالب حل مسألة، اشرح خطوات الحل ولا تعطي الجواب النهائي فقط. أجب باللغة العربية.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    return completion.choices[0].message.content || 'عذراً، لم أتمكن من الرد.';
  } catch (error) {
    console.error('خطأ في LLM7 API:', error);
    return 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.';
  }
};