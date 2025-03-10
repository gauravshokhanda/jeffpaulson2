import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler, Keyboard } from "react-native";
import { useState, useEffect, useCallback } from "react";

export default function TabRoot() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Detect keyboard visibility
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Handle back button behavior (prevent exiting the app)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true; // Disable back button default behavior

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  return (
    <ProtectedRoute>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#082f49",
            height: isKeyboardVisible ? 0 : 68,
            paddingTop: isKeyboardVisible ? 0 : 10,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "home" : "home-outline"} color="white" size={25} />
            ),
            tabBarLabelStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="PropertyCalculator"
          options={{
            title: "PropertyCalculator",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "calculator" : "calculator-outline"} size={25} color="white" />
            ),
            tabBarLabelStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="ContractorLists"
          options={{
            title: "ContractorLists",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "newspaper" : "newspaper-outline"} size={25} color="white" />
            ),
            tabBarLabelStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="ChatList"
          options={{
            title: "ChatList",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={25} color="white" />
            ),
            tabBarLabelStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="Menu"
          options={{
            title: "Menu",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "menu" : "menu-outline"} size={25} color="white" />
            ),
            tabBarLabelStyle: { display: "none" },
          }}
        />

        {/* Screens that should not appear in the tab bar */}
        {[
          "MapScreen",
          "FloorMapScreen",
          "Contractor",
          "AreaDetailsScreen",
          "CostDetail",
          "BreakdownCost",
          "PropertyPost",
          "SearchPost",
          "MyPosts",
          "UserProfile",
          "EditPost",
          "AllPropertyPost",
          "ChatScreen",
          "ContractorProfile",
          "RealEstateDetails",
        ].map((screen) => (
          <Tabs.Screen key={screen} name={screen} options={{ href: null }} />
        ))}
      </Tabs>
    </ProtectedRoute>
  );
}
