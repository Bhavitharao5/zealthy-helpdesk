
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SubmitTicketScreen from './screens/SubmitTicketScreen';
import AdminListScreen from './screens/AdminListScreen';
import AdminDetailScreen from './screens/AdminDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="SubmitTicket"
          component={SubmitTicketScreen}
          options={{ title: 'Submit Ticket' }}
        />
        <Stack.Screen
          name="AdminList"
          component={AdminListScreen}
          options={{ title: 'Admin • Tickets' }}
        />
        <Stack.Screen
          name="AdminDetail"
          component={AdminDetailScreen}
          options={{ title: 'Ticket Detail' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
