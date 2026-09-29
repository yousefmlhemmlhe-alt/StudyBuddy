import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { sendMessageToGemini } from '../../gemini';
import { getConversation, Message, updateConversation } from '../../storage';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadChat();
  }, [id]);

  useEffect(() => {
    if (isLoaded && id) {
      updateConversation(id, messages);
    }
  }, [messages, isLoaded]);

  const loadChat = async () => {
    if (!id) return;
    const conv = await getConversation(id);
    if (conv) {
      setMessages(conv.messages);
    }
    setIsLoaded(true);
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '...جاري التفكير',
      sender: 'bot',
    };
    setMessages([...updatedMessages, loadingMessage]);

    const botReply = await sendMessageToGemini(inputText);

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>📚 مساعدك الدراسي</Text>
        <View style={{ width: 60 }} />
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
  header: { 
    paddingTop: 50, 
    paddingBottom: 15, 
    backgroundColor: '#007AFF', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  backButton: { width: 60 },
  backButtonText: { color: '#fff', fontSize: 16 },
  headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
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