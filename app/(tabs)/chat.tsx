import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { sendMessageToAI, ChatMessage } from '../../hooks/azureAI';

type ListMsg = ChatMessage & { id: string };

export default function ChatScreen() {
  const [messages, setMessages] = useState<ListMsg[]>([]);
  const [inputText, setInputText] = useState('');
  const flatRef = useRef<FlatList<ListMsg>>(null);

  // força scroll pro fim quando lista muda
  const scrollToBottom = () =>
    flatRef.current?.scrollToEnd({ animated: true });

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    const userMsg: ListMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    // Adiciona mensagem do usuário na tela
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Chama a IA para obter resposta
    const aiText = await sendMessageToAI(
      userMsg.content,
      [...messages, userMsg].map(({ role, content }) => ({ role, content })),
    );

    const aiMsg: ListMsg = {
      id: `${Date.now()}-ai`,
      role: 'assistant',
      content: aiText,
    };

    setMessages(prev => [...prev, aiMsg]);
    scrollToBottom();
  };

  const renderItem = ({ item }: { item: ListMsg }) => (
    <View
      style={{
        maxWidth: '75%',
        alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
        backgroundColor: item.role === 'user' ? '#DCF8C6' : '#FFF',
        padding: 8,
        marginVertical: 2,
        borderRadius: 6,
      }}
    >
      <Text>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#EEE' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={scrollToBottom}
      />

      <View
        style={{
          flexDirection: 'row',
          padding: 10,
          backgroundColor: '#FFF',
          alignItems: 'center',
        }}
      >
        <TextInput
          style={{
            flex: 1,
            borderColor: '#CCC',
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 8,
            marginRight: 6,
          }}
          placeholder="Digite sua mensagem..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Button title="Enviar" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}