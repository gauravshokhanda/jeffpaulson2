import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import CardSlider from "../../components/CardSlider";
import EstateSlider from "../../components/Estateslider";

export default function Dashboard() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const router = useRouter();
  const postContentWidth = screenWidth * 0.92;
  const userName = useSelector((state) => state.auth.user);
  const [selectedCategory, setSelectedCategory] = useState("general");

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header and Search Bar */}
      <LinearGradient
        colors={["#082f49", "transparent"]}
        style={{ height: screenHeight * 0.4 }}
      >
        <View className="px-5 pt-4">
          <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md">
            <Ionicons name="search" size={20} color="#000" />
            <TextInput
              className="flex-1 ml-2 text-black"
              placeholder="Start Search"
              placeholderTextColor="#777"
            />
            <Ionicons name="filter" size={20} color="#000" />
          </View>
        </View>
      </LinearGradient>

      <View
        className="bg-white"
        style={{
          marginTop: -screenHeight * 0.45,
          width: postContentWidth,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
         
          top: screenHeight * 0.17,
          marginHorizontal: (screenWidth - postContentWidth) / 2,
          overflow: "hidden",
        }}
      >
        <View className="px-4 pb-4">
          <View className="mt-6 flex-row justify-center items-center">
            <Text className="text-lg text-gray-800">Welcome, </Text>
            <Text className="text-lg font-semibold text-sky-950">
              {userName?.name || "User"}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-between mt-5">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-xl p-4 items-center mx-2"
              onPress={() => router.push("MapScreen")}
            >
              <Ionicons name="map-outline" size={28} color="#111827" />
              <Text className="text-gray-700 mt-2 text-sm">
                Search using Map
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-xl p-4 items-center mx-2"
              onPress={() => router.push("FloorMapScreen")}
            >
              <Ionicons name="image-outline" size={28} color="#111827" />
              <Text className="text-gray-700 mt-2 text-sm">
                Search using Images
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contractor Section Title & Category Tabs */}
        <View className="px-4">
          <Text className="text-xl text-center text-sky-950 font-semibold">
            Top Contractors
          </Text>

          <View className="flex-row justify-center gap-2 px-4 mt-4 space-x-3">
            <TouchableOpacity
              onPress={() => setSelectedCategory("general")}
              className={`px-4 py-2 rounded-xl ${
                selectedCategory === "general"
                  ? "bg-sky-950 text-white"
                  : "bg-gray-300"
              }`}
            >
              <Text
                className={`text-lg ${
                  selectedCategory === "general" ? "text-white" : "text-black"
                }`}
              >
                General Contractors
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedCategory("real-estate")}
              className={`px-4 py-2 rounded-xl ${
                selectedCategory === "real-estate"
                  ? "bg-sky-950 text-white"
                  : "bg-gray-300"
              }`}
            >
              <Text
                className={`text-lg ${
                  selectedCategory === "real-estate"
                    ? "text-white"
                    : "text-black"
                }`}
              >
                Real Estate Contractors
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FlatList for Contractors */}
        <FlatList
          data={[{ key: "contractors" }]} 
          keyExtractor={(item) => item.key}
          renderItem={() =>
            selectedCategory === "general" ? <CardSlider /> : <EstateSlider />
          }
        />
      </View>
    </SafeAreaView>
  );
}
