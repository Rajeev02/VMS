import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalkInRegistrationScreen, CaptureIDScreen, CheckInScreen, VerifyWithoutPassScreen } from '../features/visitor/screens/Placeholders';

const Stack = createNativeStackNavigator();

export const SecurityNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="WalkInRegistration" 
        component={WalkInRegistrationScreen} 
        options={{ title: 'Walk-in Registration' }} 
      />
      <Stack.Screen 
        name="CaptureID" 
        component={CaptureIDScreen} 
        options={{ title: 'Capture Government ID' }} 
      />
      <Stack.Screen 
        name="CheckIn" 
        component={CheckInScreen} 
        options={{ title: 'Check-In' }} 
      />
      <Stack.Screen 
        name="VerifyWithoutPass" 
        component={VerifyWithoutPassScreen} 
        options={{ title: 'Verify Identity' }} 
      />
    </Stack.Navigator>
  );
};
