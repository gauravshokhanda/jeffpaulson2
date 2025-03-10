import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  SafeAreaView,
  Dimensions
} from "react-native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { API } from "../../config/apiConfig";
import { LinearGradient } from "expo-linear-gradient";

export default function AreaDetailsScreen() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const postContentWidth = screenWidth * 0.92;

  const placeHolderImage = require("../../assets/images/userImages/propertyArea.jpg");
  const { area } = useSelector((state) => state.polygon);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const token = useSelector((state) => state.auth.token);
  const areaDeatils = useSelector((state) => state.polygon);

  const [loading, setLoading] = useState(false);
  const [cityName, setCityName] = useState("");

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchCityName = async () => {
    try {
      const response = await API.post(`get-cityname`, {
        zipcode: areaDeatils.zipCode,
      });

      if (response.data && response.data.data.city) {
        console.log("City name:", response.data.data.city);
        setCityName(response.data.data.city);
      } else {
        // If no city is found, set the city to "Florida"
        console.log("City not found, setting to Florida.");
        setCityName("Florida");
      }
    } catch (error) {
      // console.log("Error fetching city name:", error.message);
      // Alert.alert("Error", "An error occurred while fetching city name.");
      // Set city to "Florida" in case of an error
      setCityName("Florida");
    }
  };

  const scheduleCost = async () => {
    const data = {
      city: cityName,
      zip_code: areaDeatils.zipCode,
      area: areaDeatils.area,
      project_type: "Basic",
      square_fit: "1000",
    };

    // console.log("data",data)

    setLoading(true);
    try {
      const response = await API.post(
        "regional_multipliers/details",
        JSON.stringify(data),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("response:", response.data);

      if (response.data && response.data.data) {
        const scheduleCost = encodeURIComponent(
          JSON.stringify(response.data.data)
        );
        router.push(`/CostDetail?CostDetails=${scheduleCost}`);
      } else {
        Alert.alert("Error", "No response data available");
      }
    } catch (error) {
      console.error("error:", error.message);
      Alert.alert("Error", "An error occurred while fetching schedule cost");
    } finally {
      setLoading(false); // Stop the loader
    }
  };

  useEffect(() => {
    fetchCityName();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <LinearGradient
        colors={["#082f49", "transparent"]}
        style={{ height: "40%" }}
      >
        <View className="mt-2">
          <TouchableOpacity
            className="absolute top-6 z-10 left-5"
            onPress={() => router.push("/MapScreen")}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-white mb-4 py-4 text-center">
            Your Area Details
          </Text>
        </View>

      </LinearGradient>

      <View 
         className="flex-1 rounded-3xl bg-white"
         style={{
           marginTop: -screenHeight * 0.25, 
           width: postContentWidth,
           marginHorizontal: (screenWidth - postContentWidth) / 2,
           overflow:"hidden"
         }}
      >

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00ADEF" />
          </View>
        )}

        <View className="flex-1">
          <View className="items-center ">
            <Image
              className="rounded-t-3xl"
              source={placeHolderImage}
              style={{ width: "100%", height: screenHeight * 0.52 }}
            />
          </View>

          <View
            className="bg-white justify-center items-center rounded-xl"
            style={{
              position: 'absolute',
              top: screenHeight * 0.5,
              width: screenWidth * 0.5,
              alignSelf: 'center',
              zIndex: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}>
            <Text className="text-lg text-sky-950 text-center font-medium">
              Your area is
            </Text>
          </View>
          {/* Area details */}
          <View
            className="justify-center items-center"
            style={{ marginVertical: screenHeight * 0.04 }}>
            <Text
            className="tracking-widest font-bold"
            style={{ fontSize: screenHeight * 0.055 }}>{area} sq ft.</Text>
          </View>




          <View className="flex-1 items-center">
            <TouchableOpacity
              onPress={scheduleCost}
              className="bg-sky-950 px-10 py-3 rounded-full"
              disabled={loading} 
            >
              <Text className="text-white text-lg font-semibold tracking-widest">
                Calculate Cost
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
});
