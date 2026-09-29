// src/app/index.tsx
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { sendMessageToGemini } from '../gemini';

// تعريف نوع الرسالة لحل مشكلة TypeScript
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'أهلاً! أنا مساعدك الدراسي. اسألني أي شي.', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };
    
    // إضافة رسالة المستخدم
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');

    // إضافة رسالة "جاري التفكير"
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '...جاري التفكير',
      sender: 'bot',
    };
    setMessages([...updatedMessages, loadingMessage]);

    // جلب الرد من Groq API
    const botReply = await sendMessageToGemini(inputText);

    // استبدال رسالة "جاري التفكير" بالرد الحقيقي
    setMessages(prev => {
      const filtered = prev.filter(m => m.id !== loadingMessage.id);
      return [...filtered, {
        id: (Date.now() + 2).toString(),
        text: botReply,
        sender: 'bot',
      }];
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userBubble : styles.botBubble
    ]}>
      <Text style={item.sender === 'user' ? styles.userText : styles.botText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>📚 مساعدك الدراسي</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="اكتب سؤالك هنا..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>إرسال</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: 50, paddingBottom: 15, backgroundColor: '#007AFF', alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  messagesList: { padding: 15 },
  messageBubble: { padding: 12, borderRadius: 15, marginBottom: 10, maxWidth: '80%' },
  userBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  botBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e0e0e0' },
  userText: { color: '#fff', fontSize: 16 },
  botText: { color: '#000', fontSize: 16 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, maxHeight: 100, textAlign: 'right' },
  sendButton: { backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center', marginLeft: 10 },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});