import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SubmitTicketScreen from './screens/SubmitTicketScreen';
import AdminListScreen from './screens/AdminListScreen';
import AdminDetailScreen from './screens/AdminDetailScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="SubmitTicket" component={SubmitTicketScreen} options={{ title: 'Submit Ticket' }} />
        <Stack.Screen name="AdminList" component={AdminListScreen} options={{ title: 'All Tickets' }} />
        <Stack.Screen name="AdminDetail" component={AdminDetailScreen} options={{ title: 'Ticket Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

registerRootComponent(App);
