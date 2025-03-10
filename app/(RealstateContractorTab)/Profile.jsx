import { View, Dimensions, Text, TextInput, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from "react-redux";
import { router } from 'expo-router';

import Svg, { Path } from "react-native-svg";
import Icon from "react-native-vector-icons/FontAwesome5";
import Box from "../../assets/images/MD.png";
import { useDispatch } from 'react-redux';
import { setLogout } from "../../redux/slice/authSlice";

// Object Array for menu items
const imageData = [
  // { id: 1, label: "Portfolio", icon: "arrow-up", screen: "", source: Box },
  { id: 2, label: "My Listing", icon: "rss", screen: "MyListing", source: Box },
  { id: 4, label: "Profile", icon: "user", screen: "EstateContractorProfile", source: Box },
  { id: 6, label: "Chat", icon: "comments", screen: "RealStateChatList", source: Box },
  { id: 8, label: "Log Out", icon: "sign-out-alt", screen: 'logout', source: Box },
];





export default function Index() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const postContentWidth = screenWidth * 0.92;
  const userName = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const handlePress = (screen) => {
    if (screen === "logout") {
      Alert.alert("Logout", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: () => {
            dispatch(setLogout());
            router.replace('SignIn');
          },
        },
      ]);
    } else if (screen === "ContractorPortfolio") {  // Profile screen
      router.push({ pathname: screen, params: { edit: "true" } });
    } else if (screen) {
      router.push(screen);
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-gray-200">

      <LinearGradient
        colors={['#082f49', 'transparent']}
        style={{ height: screenHeight * 0.4 }}
        className="h-[40%]"
      >
        <View className="mt-10 px-4 gap-2 flex-row items-center">
          <Image
            source={{ uri: "https://xsgames.co/randomusers/assets/avatars/male/74.jpg" }}
            className="w-14 h-14 border-2 border-white rounded-full"
          />
          <View className="gap-1">
            <Text className="text-2xl font-semibold text-white">
              Welcome! {userName?.name || "User"}
            </Text>
            <Text className="text-gray-400">📍 Florida, USA</Text>
          </View>
        </View>


      </LinearGradient>


      <View className="rounded-3xl "
        style={{
          position: 'absolute',
          top: screenHeight * 0.16,
          width: postContentWidth,
          height: screenHeight * 0.84,
          left: (screenWidth - postContentWidth) / 2,
          backgroundColor: 'white',
        }}
      >

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >

            <View className="flex flex-wrap flex-row mt-10 justify-center gap-4 p-4">
              {imageData.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  className="relative  h-28 flex items-center justify-center"
                  onPress={() => handlePress(item.screen)}
                  style={{ width: screenWidth * 0.40 }}
                >
                  <Image source={item.source} className="w-full h-full absolute" />
                  <View className="absolute flex items-center">
                    <Icon name={item.icon} size={24} color="white" />
                    <Text className="text-white text-lg font-semibold mt-1">{item.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>



          </ScrollView>
        </KeyboardAvoidingView>


      </View>
    </SafeAreaView>
  );
}