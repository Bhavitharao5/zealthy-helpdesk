import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiPost } from '../utils/api';

export default function SubmitTicketScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);       // preview only (local)
  const [attachmentUrl, setAttachmentUrl] = useState(''); // URL we actually send
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

  async function pickImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert('Permission required', 'We need access to your photos.');
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open image picker.');
    }
  }

  async function submit() {
    if (!name || !email || !description) {
      return Alert.alert('Missing fields', 'Please fill name, email, and description.');
    }
    if (!validateEmail(email)) {
      return Alert.alert('Invalid email', 'Please enter a valid email address.');
    }

    setLoading(true);
    try {
      const body = { name, email, description };
      // We only send a URL to the backend (no file uploading for this exercise)
      if (attachmentUrl) body.attachment = attachmentUrl;

      const created = await apiPost('/api/tickets', body);
      Alert.alert('Ticket submitted', `ID: ${created.id}`);

      // reset form
      setName('');
      setEmail('');
      setDescription('');
      setImageUri(null);
      setAttachmentUrl('');
    } catch (e) {
      Alert.alert('Error', 'Could not submit ticket.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>New Support Ticket</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 }}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 }}
      />

      <TextInput
        placeholder="Describe your issue"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, minHeight: 100 }}
      />

      <Button title="Pick Image (optional)" onPress={pickImage} />

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: 180, marginTop: 8, borderRadius: 6 }}
          resizeMode="cover"
        />
      ) : null}

      <TextInput
        placeholder="Or paste image/link URL (optional)"
        value={attachmentUrl}
        onChangeText={setAttachmentUrl}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 }}
      />

      <Button
        title={loading ? 'Submitting…' : 'Submit Ticket'}
        onPress={submit}
        disabled={loading}
      />

      <View style={{ height: 8 }} />
      <Button title="Go to Admin" onPress={() => navigation.navigate('AdminList')} />
    </ScrollView>
  );
}
