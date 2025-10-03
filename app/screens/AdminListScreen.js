import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { apiGet } from '../utils/api';

export default function AdminListScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/tickets');
      setTickets(data);
    } catch (e) {
      console.error('load tickets failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function Item({ item }) {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('AdminDetail', { id: item.id })}
        style={{ padding: 14, borderBottomWidth: 1, borderColor: '#eee' }}
      >
        <Text style={{ fontWeight: 'bold' }}>#{item.id} · {item.name}</Text>
        <Text>{item.email}</Text>
        <Text>Status: {item.status}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={tickets}
        keyExtractor={t => String(t.id)}
        renderItem={Item}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        ListEmptyComponent={
          <View style={{ padding: 20 }}>
            <Text>No tickets yet</Text>
          </View>
        }
      />
    </View>
  );
}
