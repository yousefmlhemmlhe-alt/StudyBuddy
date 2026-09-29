// src/app/index.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Conversation, createConversation, deleteConversation, getConversations } from '../storage';

export default function HomeScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const loadConversations = async () => {
    const data = await getConversations();
    setConversations(data);
  };

  const handleNewChat = async () => {
    const newConv = await createConversation();
    router.push(`/chat/${newConv.id}`);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'حذف المحادثة',
      'هل أنت متأكد من حذف هذه المحادثة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: async () => {
            await deleteConversation(id);
            loadConversations();
          }
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={() => router.push(`/chat/${item.id}`)}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.conversationContent}>
        <Text style={styles.conversationTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.conversationDate}>
          {new Date(item.updatedAt).toLocaleDateString('ar-EG')}
        </Text>
      </View>
      <Text style={styles.arrow}>‹</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>📚 مساعدك الدراسي</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>لا توجد محادثات بعد</Text>
          <Text style={styles.emptySubtext}>اضغط على الزر أدناه لبدء محادثة جديدة</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
        <Text style={styles.newChatButtonText}>+ محادثة جديدة</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    paddingTop: 50, 
    paddingBottom: 15, 
    backgroundColor: '#007AFF', 
    alignItems: 'center',
  },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  list: { padding: 15, paddingBottom: 100 },
  conversationItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  conversationContent: { flex: 1 },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
    textAlign: 'right',
  },
  conversationDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  arrow: { fontSize: 24, color: '#ccc', marginLeft: 10 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 10 },
  emptySubtext: { fontSize: 14, color: '#999' },
  newChatButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  newChatButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});