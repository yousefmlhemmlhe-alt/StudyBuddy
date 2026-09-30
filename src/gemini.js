// src/gemini.js
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.llm7.io/v1',
  apiKey: 'WlnQZWU1H1EopGJ4jr/BuVmh9tEImniKl3yVbjZ7hv3gOqvHCdz4ylgZKQHAz4Q868BPBj8uf8slokskkw8mq6CH1pouLlFuOe1vrujWqEOg/ZOkFvEcZ0lyt6wXekMUpztw37NCMU9nQD1cr9Mm7Mcp',
});

const SYSTEM_PROMPT = 'أنت مساعد دراسي ذكي للطلاب الجامعيين. اشرح المفاهيم بطريقة مبسطة خطوة بخطوة. استخدم أمثلة عملية. إذا طلب منك الطالب حل مسألة، اشرح خطوات الحل ولا تعطي الجواب النهائي فقط. أجب باللغة العربية.';

export const sendMessageToGemini = async (userMessage) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'default',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    });
    return completion.choices[0].message.content || 'عذراً، لم أتمكن من الرد.';
  } catch (error) {
    console.error('خطأ في LLM7 API:', error);
    return 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.';
  }
};

export const analyzeImage = async (base64Image) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'default',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'حلل هذه الصورة. إذا كانت تحتوي على سؤال أو مسألة دراسية، اشرح الحل خطوة بخطوة باللغة العربية.',
            },
            {
              type: 'image_url',
              image_url: {
                url: 'data:image/jpeg;base64,' + base64Image,
              },
            },
          ],
        },
      ],
    });
    return completion.choices[0].message.content || 'عذراً، لم أتمكن من تحليل الصورة.';
  } catch (error) {
    console.error('خطأ في تحليل الصورة:', error);
    return 'عذراً، لم أتمكن من تحليل الصورة.';
  }
};