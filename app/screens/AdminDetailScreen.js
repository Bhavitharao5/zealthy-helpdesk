import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Button, TextInput, ScrollView, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { apiGet, apiPatch, apiPost } from "../utils/api";

export default function AdminDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const id = route?.params?.id;

  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await apiGet(`/tickets/${id}`);
      setTicket(data);
    } catch (e) {
      console.error("load ticket failed", e);
      Alert.alert("Error", e.message || "Failed to load ticket");
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(status) {
    if (!id) return;
    setSaving(true);
    try {
      await apiPatch(`/tickets/${id}/status`, { status });
      await load();
      Alert.alert("Status Updated", `Ticket marked as ${status}`);
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  async function sendReply() {
    if (!id || !reply.trim()) return;
    setSaving(true);
    try {
      await apiPost(`/tickets/${id}/messages`, { body: reply, fromAdmin: true });
      setReply("");
      await load();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to send reply");
    } finally {
      setSaving(false);
    }
  }

  if (!id) {
    return (
      <View style={{ flex:1, padding:16, gap:10 }}>
        <Text style={{ fontWeight:"bold", fontSize:18 }}>No ticket selected</Text>
        <Button title="Back to list" onPress={() => navigation.navigate("AdminList")} />
      </View>
    );
  }

  if (!ticket) {
    return <View style={{ flex: 1, justifyContent:"center", alignItems:"center" }}><Text>Loading…</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18 }}>Ticket #{ticket.id}</Text>
      <Text>Name: {ticket.name}</Text>
      <Text>Email: {ticket.email}</Text>
      <Text>Status: {ticket.status}</Text>

      <Text style={{ marginTop: 8 }}>Description:</Text>
      <Text style={{ backgroundColor:"#f7f7f7", padding:10, borderRadius:6 }}>
        {ticket.description}
      </Text>

      {ticket.attachment ? <Text>Attachment: {ticket.attachment}</Text> : null}

      <View style={{ height: 10 }} />

      <Text style={{ fontWeight: "bold" }}>Messages</Text>
      {(ticket.messages || []).map((m, idx) => (
        <View key={idx} style={{ padding: 8, borderLeftWidth: 3, borderColor: m.fromAdmin ? "#1976d2" : "#999", marginBottom: 6, backgroundColor:"#fafafa" }}>
          <Text style={{ fontWeight:"bold" }}>{m.fromAdmin ? "Admin" : ticket.name}</Text>
          <Text>{m.body}</Text>
          <Text style={{ fontSize: 12, color:"#666" }}>{new Date(m.createdAt).toLocaleString()}</Text>
        </View>
      ))}

      <TextInput
        placeholder="Write a reply…"
        value={reply}
        onChangeText={setReply}
        style={{ borderWidth:1, borderColor:"#ccc", padding:10, borderRadius:6 }}
      />
      <Button title={saving ? "Sending…" : "Send Reply"} onPress={sendReply} disabled={saving} />

      <View style={{ height: 12 }} />
      <Text style={{ fontWeight: "bold" }}>Update Status</Text>
      <View style={{ gap: 8 }}>
        <Button title="Mark NEW" onPress={() => updateStatus("NEW")} disabled={saving} />
        <Button title="Mark IN_PROGRESS" onPress={() => updateStatus("IN_PROGRESS")} disabled={saving} />
        <Button title="Mark RESOLVED" onPress={() => updateStatus("RESOLVED")} disabled={saving} />
      </View>
    </ScrollView>
  );
}
