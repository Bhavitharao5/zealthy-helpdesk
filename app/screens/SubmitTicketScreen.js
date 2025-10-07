import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { apiPost } from '../utils/api';

export default function SubmitTicketScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission required', 'We need access to your photos');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function submit() {
    if (!name || !email || !description) {
      return Alert.alert('Missing fields', 'Please fill name, email, and description');
    }
    setLoading(true);
    try {
      const body = { name, email, description, attachment: attachmentUrl || null };
      console.log('Submitting ticket →', body);
      const created = await apiPost('/tickets', body); // IMPORTANT: no /api
      console.log('Created ticket ←', created);
      Alert.alert('Ticket submitted', `ID: ${created.id}`);
      setName(''); setEmail(''); setDescription(''); setImageUri(null); setAttachmentUrl('');
      navigation.navigate('AdminList');
    } catch (e) {
      console.error('Submit failed:', e);
      Alert.alert('Error', e.message || 'Could not submit ticket');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>New Support Ticket</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 }} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address"
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 }} />
      <TextInput placeholder="Describe your issue" value={description} onChangeText={setDescription}
        multiline numberOfLines={4}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, minHeight: 100 }} />
      <Button title="Pick Image (optional)" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: '100%', height: 180, marginTop: 8, borderRadius: 6 }} />}
      <TextInput placeholder="Or paste image/link URL (optional)" value={attachmentUrl} onChangeText={setAttachmentUrl}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 }} />
      <Button title={loading ? 'Submitting...' : 'Submit Ticket'} onPress={submit} disabled={loading} />
      <View style={{ height: 8 }} />
      <Button title="Go to Admin" onPress={() => navigation.navigate('AdminList')} />
    </ScrollView>
  );
}
