import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Circle } from "react-native-progress";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { setBreakdownCost } from "../../redux/slice/breakdownCostSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function BreakdownCost() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const postContentWidth = screenWidth * 0.92;

  const router = useRouter();
  const dispatch = useDispatch();
  const { screenName } = useLocalSearchParams();
  const costData = useSelector((state) => state.breakdownCost);
  const [parsedData, setParsedData] = useState(null);
  const [savedScreenName, setSavedScreenName] = useState(null);

  // console.log("screen name", screenName)

  useEffect(() => {
    // Load saved screenName from storage
    const loadScreenName = async () => {
      try {
        const storedName = await AsyncStorage.getItem("screenName");
        if (storedName) {
          setSavedScreenName(storedName);
        }
      } catch (error) {
        console.error("Error loading screenName:", error);
      }
    };
    loadScreenName();
  }, []);

  useEffect(() => {
    // Save new screenName if it's provided
    const saveScreenName = async () => {
      if (screenName && screenName !== savedScreenName) {
        try {
          await AsyncStorage.setItem("screenName", screenName);
          setSavedScreenName(screenName);
        } catch (error) {
          console.error("Error saving screenName:", error);
        }
      }
    };
    saveScreenName();
  }, [screenName]);

  useEffect(() => {
    if (costData && costData.breakdownCost) {
      try {
        const parsed = JSON.parse(costData.breakdownCost);
        setParsedData(parsed);
      } catch (error) {
        console.error("Error parsing breakdownCost:", error);
      }
    } else {
      console.error("breakdownCost is missing.");
    }
  }, [costData]);

  if (!parsedData) {
    return null;
  }

  const { estimated_time, project_type, square_fit } = parsedData;
  // console.log("new datas", parsedData.days.data);
  const data = parsedData.days.data;
  if (!data) {
    console.log("Data is missing or undefined");
    return null;
  }

  const totalDays = Object.values(data).reduce((acc, day) => acc + day, 0);
  const categories = Object.entries(data);

  const categoryColors = categories.map(
    () =>
      `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`
  );

  const handlePost = () => {
    router.push("/PropertyPost");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <LinearGradient
        colors={["#082f49", "transparent"]}
        style={{ height: screenHeight * 0.4 }}
      >
        <View className="flex-row justify-between items-center p-5">
          <TouchableOpacity onPress={() => router.push(screenName)}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-extrabold text-white">
            Cost Breakdown
          </Text>
          <Text className="text-lg text-white opacity-75">{project_type}</Text>
        </View>
      </LinearGradient>
      <View
        className="flex-1 rounded-3xl bg-white"
        style={{
          marginTop: -screenHeight * 0.25,
          width: postContentWidth,
          marginHorizontal: (screenWidth - postContentWidth) / 2,
          overflow: "hidden",
        }}
      >
        <View className={`flex-1 bg-white rounded-3xl`}>
          <View className="flex flex-row justify-center gap-x-4 px-4">
            <View
              className={`flex-1 max-w-[45%] px-4 py-3 mt-4 bg-gray-50 rounded-lg shadow-md ${
                Platform.OS === "ios" ? "mx-1" : ""
              }`}
            >
              <Text className="text-sm text-gray-600 font-semibold">
                Total Cost
              </Text>
              <Text className="text-2xl font-extrabold text-gray-800">
                $
                {new Intl.NumberFormat("en-US", { style: "decimal" }).format(
                  parsedData.total_cost
                )}
              </Text>
            </View>

            <View
              className={`flex-1 max-w-[45%] px-4 py-3 mt-4 bg-gray-50 rounded-lg shadow-md ${
                Platform.OS === "ios" ? "mx-1" : ""
              }`}
            >
              <Text className="text-sm text-gray-600 font-semibold">
                Total Days
              </Text>
              <Text className="text-2xl font-extrabold text-gray-800">
                {totalDays}
              </Text>
            </View>
          </View>

          {/* Breakdown List Section */}
          <View className="flex-1 px-5 mt-5 rounded-2xl">
            <FlashList
              data={categories}
              renderItem={({ item, index }) => (
                <View
                  key={item[0]}
                  className="flex-row justify-between items-center bg-white h-28 mb-4 rounded-lg shadow-lg px-2 "
                  style={{
                    borderColor: categoryColors[index],
                    borderWidth: 1.5,
                    borderRadius: 5,
                  }}
                >
                  <Circle
                    size={50}
                    progress={item[1] / totalDays}
                    color={categoryColors[index]}
                    thickness={4}
                    showsText={true}
                    formatText={() =>
                      `${Math.round((item[1] / totalDays) * 100)}%`
                    }
                  />
                  {/* Category Details */}
                  <View className="flex-1 ml-4">
                    <Text className="text-xl font-semibold text-gray-700">
                      {item[0]
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {item[1]} days
                    </Text>
                  </View>
                </View>
              )}
              estimatedItemSize={80}
              keyExtractor={(item) => item[0]}
            />
          </View>

          {/* Post Button Section */}
          <View className="m-4">
            <TouchableOpacity
              onPress={handlePost}
              className="bg-sky-950 py-3 rounded-full shadow-lg flex-row items-center justify-center"
            >
              <Text className="text-white text-xl font-bold">Post</Text>
              <Ionicons name="send" size={24} color="white" className="ml-3" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
