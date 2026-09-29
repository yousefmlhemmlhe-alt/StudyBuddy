// src/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

const CONVERSATIONS_KEY = '@studybuddy_conversations';

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const data = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading conversations:', e);
    return [];
  }
};

export const saveConversations = async (conversations: Conversation[]) => {
  try {
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Error saving conversations:', e);
  }
};

export const getConversation = async (id: string): Promise<Conversation | null> => {
  const conversations = await getConversations();
  return conversations.find(c => c.id === id) || null;
};

export const createConversation = async (): Promise<Conversation> => {
  const newConv: Conversation = {
    id: Date.now().toString(),
    title: 'محادثة جديدة',
    messages: [{
      id: '1',
      text: 'أهلاً! أنا مساعدك الدراسي. اسألني أي شي.',
      sender: 'bot',
    }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const conversations = await getConversations();
  await saveConversations([newConv, ...conversations]);
  return newConv;
};

export const updateConversation = async (id: string, messages: Message[]) => {
  const conversations = await getConversations();
  const index = conversations.findIndex(c => c.id === id);
  if (index !== -1) {
    const firstUserMsg = messages.find(m => m.sender === 'user');
    const title = firstUserMsg 
      ? firstUserMsg.text.substring(0, 30) 
      : conversations[index].title;
    
    conversations[index] = {
      ...conversations[index],
      messages,
      title,
      updatedAt: Date.now(),
    };
    await saveConversations(conversations);
  }
};

export const deleteConversation = async (id: string) => {
  const conversations = await getConversations();
  const filtered = conversations.filter(c => c.id !== id);
  await saveConversations(filtered);
};