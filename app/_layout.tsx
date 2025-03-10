import { NavigationContainer } from '@react-navigation/native';
import { Stack } from "expo-router";
import '../global.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store';
import { useState, useEffect, useRef } from "react";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync} from "../config/notifications"



export default function RootLayout() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();
  // useEffect(() => {
  //   // Register for push notifications
  //   registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

  //   // Listen for incoming notifications (while the app is open)
  //   notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
  //     console.log("Notification Received:", notification);
  //   });

  //   // Handle user interaction with notifications
  //   responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
  //     console.log("User tapped notification:", response);
  //   });

  //   // Cleanup listeners when unmounting
  //   return () => {
  //     if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
  //     if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
  //   };
  // }, []);
  return <>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: 'Get Started', headerShown: false }} />
          <Stack.Screen
            name="SignIn"
            options={{ headerShown: false }}
            
            />
          <Stack.Screen name="SignUp/index" options={{ title: 'Sign up', headerShown: false }} />
          <Stack.Screen name="ContractorProfileComplete/index" options={{ title: 'ContractorProfileComplete', headerShown: false }} />
          <Stack.Screen name="RealstateSelector/index" options={{ title: 'RealstateSelector', headerShown: false }} />
          <Stack.Screen name='(usertab)' options={{ headerShown: false }} />
          <Stack.Screen name='(generalContractorTab)' options={{ headerShown: false }} />
          <Stack.Screen name='(RealstateContractorTab)' options={{ headerShown: false }} />
        </Stack>
      </PersistGate>
    </Provider>
  </>;
}