import { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import axios from "axios";

export default function PropertyDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("https://via.placeholder.com/600x400");
  const [designImages, setDesignImages] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const baseUrl = "https://g32.iamdeveloper.in/public/";

  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      try {
        const response = await axios.get(
          `https://g32.iamdeveloper.in/api/job-post/listing/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          const propertyData = response.data.data;
          let floorMapImage = "https://via.placeholder.com/600x400";
          let designImageArray = [];

          try {
            const parsedFloorMaps = JSON.parse(propertyData.floor_maps_image || "[]");
            if (parsedFloorMaps.length > 0) {
              floorMapImage = `${baseUrl}${parsedFloorMaps[0]}`;
            }

            const parsedDesignImages = JSON.parse(propertyData.design_image || "[]");
            designImageArray = parsedDesignImages.map((img) => `${baseUrl}${img}`);
          } catch (error) {
            console.error("Error parsing images:", error);
          }

          setProperty(propertyData);
          setMainImage(floorMapImage);
          setDesignImages(designImageArray);
        }
      } catch (error) {
        console.error("Error fetching property:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, token]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No property data found.</Text>
      </View>
    );
  }

  const { total_cost, number_of_days, area, city, project_type, description, user_id } = property;

  const handleCall = async () => {
    if (!user_id) {
      Alert.alert("Error", "User ID not available.");
      return;
    }

    try {
      const response = await axios.get(`https://g32.iamdeveloper.in/api/users/listing/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        console.log(response);
        const phoneNumber = response.data.number;

        if (phoneNumber) {
          Linking.openURL(`tel:${phoneNumber}`);
        } else {
          Alert.alert("Error", "Phone number not available.");
        }
      }
    } catch (error) {
      console.error("Error fetching phone number:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to fetch phone number.");
    }
  };

  return (
    <ScrollView className="bg-white flex-1 mt-8 p-4">
      <View className="w-full h-20 bg-sky-950 mb-2 flex justify-center flex-row items-center rounded-lg">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-2 p-2 rounded-full shadow-md">
          <FontAwesome name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Property Details</Text>
      </View>

      <View className="relative">
        <Image source={{ uri: mainImage }} className="w-full h-60 rounded-lg" />
      </View>

      <ScrollView horizontal className="mt-4">
        {designImages.length > 0 ? (
          designImages.map((img, index) => (
            <TouchableOpacity key={index} onPress={() => setMainImage(img)}>
              <Image source={{ uri: img }} className="w-40 h-32 mr-2 rounded-lg" />
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-gray-500">No design images available</Text>
        )}
      </ScrollView>

      <View className="mt-4 bg-white p-4 rounded-lg shadow-md">
        <Text className="text-xl font-bold">Property Type: {project_type}</Text>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="bg-sky-950 text-white px-3 py-1 rounded-lg">For Sale</Text>
          <Text className="text-lg font-bold">${total_cost}</Text>
          <Text className="text-gray-500">Days: {number_of_days}</Text>
        </View>
        <Text className="text-gray-700 mt-2">Area: {area} sqft</Text>
      </View>

      <View className="mt-4 bg-white p-4 rounded-lg shadow-md">
        <Text className="text-xl font-semibold">Property Information</Text>
        <View className="mt-2 gap-2">
          <Text className="text-gray-700">
            <Text className="font-semibold">Property Type:</Text> {project_type}
          </Text>
          <Text className="text-gray-700">
            <Text className="font-semibold">Location:</Text> {city}
          </Text>
          <Text className="text-gray-700">
            <Text className="font-semibold">Built In:</Text> 2020
          </Text>
          <Text className="text-gray-700">
            <Text className="font-semibold">Days:</Text> {number_of_days}
          </Text>
          <Text className="text-gray-700">
            <Text className="font-semibold">Square Footage:</Text> {area} sqft
          </Text>
          <Text className="text-gray-700">
            <Text className="font-semibold">Total Cost:</Text> ${total_cost}
          </Text>
          <View>
            <Text className="text-lg mt-4 font-semibold">Property Description</Text>
            <Text className="text-gray-700">{description}</Text>
          </View>
        </View>
      </View>

      <View className="mt-4 bg-white p-4 flex flex-row items-center justify-center gap-5">
        <TouchableOpacity
          className="bg-sky-950 p-3 w-48 rounded-lg justify-center items-center flex-row gap-2 shadow-md active:bg-sky-800"
          onPress={handleCall}
        >
          <FontAwesome name="phone" size={20} color="white" />
          <Text className="text-center text-white text-lg font-semibold">Call to Number</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-sky-950 p-3 flex-row w-48 gap-1 justify-center items-center rounded-lg shadow-md active:bg-sky-800"
          onPress={() => router.push(`/ChatScreen?user_id=${user_id}`)}
        >
          <FontAwesome name="comment" size={20} color="white" />
          <Text className="text-center text-white text-lg font-semibold">Chat</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}