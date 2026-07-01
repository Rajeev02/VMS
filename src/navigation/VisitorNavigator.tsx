import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VisitorsScreen } from '../features/visitor/screens/VisitorsScreen';
import { VisitorDetailsScreen } from '../features/visitor/screens/VisitorDetailsScreen';
import { CreateVisitorScreen } from '../features/visitor/screens/CreateVisitorScreen';
import { SearchVisitorScreen } from '../features/qr/screens/SearchVisitorScreen';
import { DigitalPassScreen } from '../features/visitor/screens/Placeholders';

const Stack = createNativeStackNavigator();

export const VisitorNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="VisitorsList" 
        component={VisitorsScreen} 
        options={{ title: 'Visitors' }} 
      />
      <Stack.Screen 
        name="SearchVisitor" 
        component={SearchVisitorScreen} 
        options={{ title: 'Emergency Search' }} 
      />
      <Stack.Screen 
        name="VisitorDetails" 
        component={VisitorDetailsScreen} 
        options={{ title: 'Visitor Details' }} 
      />
      <Stack.Screen 
        name="CreateVisitor" 
        component={CreateVisitorScreen} 
        options={{ title: 'New Visitor' }} 
      />
      <Stack.Screen 
        name="DigitalPass" 
        component={DigitalPassScreen} 
        options={{ title: 'Visitor Pass' }} 
      />
    </Stack.Navigator>
  );
};
