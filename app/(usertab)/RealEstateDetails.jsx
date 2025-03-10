import { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { API } from "../../config/apiConfig";
import { useSelector } from "react-redux";
import { router } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

export default function PropertyDetails() {
  const { id } = useLocalSearchParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const [mainImage, setMainImage] = useState(
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCf5FTK5UEZ2gfGA5Yyn30lpa6RdfwIjKoxQ&s"
  );
  const designImages = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYZ5jI-Fa5ojebuQo08sYifb8QH1zP0MPoIc70VmE8Mh8e-4zqKnhNePwiZAVXMUo32Ms&usqp=CAU",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBoiOlNizLXLvvt_yRoF8NJCxyhDBQaHab9yI3iVJeQ530uYYy0HwVFpeNd6_ILZ85ztw&usqp=CAU",
    "https://ssl.cdn-redfin.com/photo/1/mbphotov2/044/genMid.2308044_0.jpg",
    "https://photos.zillowstatic.com/fp/e47534bc683f185c9f002f2e19dbcc7d-p_c.jpg",
  ];

  const [viewMode, setViewMode] = useState("details");
  const navigation = useNavigation();

  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      try {
        const response = await API.get(`/realstate-property/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setProperty(response.data.property);
        }
      } catch (error) {
        console.error(
          "Error fetching property:",
          error.response?.data || error.message
        );
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

  const DetailsSection = () => (
    <View className="mt-4 bg-white p-4 rounded-lg shadow-md">
      <Text className="text-xl font-bold">
        {property.property_type} - {property.house_type}
      </Text>
      <View className="flex-row items-center justify-between mt-2">
        <Text className="bg-sky-950 text-white px-3 py-1 rounded-lg">
          For Sale
        </Text>
        <Text className="text-lg font-bold">${property.price}</Text>
      </View>
      <Text className="text-gray-700 mt-2">Location: {property.city}</Text>
      <Text className="text-gray-700 mt-2">Address: {property.address}</Text>
      <Text className="text-gray-700 mt-2">BHK: {property.bhk}</Text>
      <Text className="text-gray-700 mt-2">Area: {property.area} sqft</Text>
      <Text className="text-gray-700 mt-2">
        Furnish Type: {property.furnish_type}
      </Text>
      <Text className="text-gray-700 mt-2">
        Available From: {new Date(property.available_from).toDateString()}
      </Text>
    </View>
  );

  const GallerySection = () => (
    <View className="mt-4 bg-white p-4 rounded-lg shadow-md">
      <Text className="text-xl font-bold">Gallery</Text>
      <View className="flex flex-row flex-wrap gap-4 mt-4 justify-center">
        {designImages.map((img, index) => (
          <Image
            key={index}
            source={{ uri: img }}
            className="w-48 h-52 rounded-lg"
          />
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView className="bg-white flex-1 mt-8 p-4">   
      <View className="relative">
        <Image source={{ uri: mainImage }} className="w-full h-60 rounded-lg" />
      </View>

      <ScrollView horizontal className="mt-4">
        {designImages.map((img, index) => (
          <TouchableOpacity key={index} onPress={() => setMainImage(img)}>
            <Image
              source={{ uri: img }}
              className="w-40 h-32 mr-2 rounded-lg"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Buttons for details and gallery */}
      <View className="flex-row gap-4 mt-4">
        <TouchableOpacity
          onPress={() => setViewMode("details")}
          style={{
            borderBottomWidth: viewMode === "details" ? 4 : 0,
            borderBottomColor:
              viewMode === "details" ? "#0284c7" : "transparent",
          }}
          className="flex-1 p-3 rounded-lg justify-center items-center shadow-md"
        >
          <Text className="text-center text-sky-950 text-lg font-semibold">
            Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setViewMode("gallery")}
          style={{
            borderBottomWidth: viewMode === "gallery" ? 4 : 0,
            borderBottomColor:
              viewMode === "gallery" ? "#0284c7" : "transparent",
          }}
          className="flex-1 p-3 rounded-lg justify-center items-center shadow-md"
        >
          <Text className="text-center text-sky-950 text-lg font-semibold">
            Gallery
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conditional rendering based on selected mode */}
      {viewMode === "details" ? <DetailsSection /> : <GallerySection />}

      {/* Buttons */}
      <View className="mt-4 bg-white p-4 flex flex-row items-center justify-center gap-5">
        <TouchableOpacity className="bg-sky-950 p-3 w-48 rounded-lg justify-center items-center flex-row gap-2 shadow-md active:bg-sky-800">
          <FontAwesome name="phone" size={20} color="white" />
          <Text className="text-center text-white text-lg font-semibold">
            Call to Number
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push(
              `/ChatScreen?user_id=${property.user_id}&id=${property.id}`
            )
          }
          className="bg-sky-950 p-3 w-48 rounded-lg justify-center items-center flex-row gap-2 shadow-md active:bg-sky-800"
        >
          <FontAwesome name="phone" size={20} color="white" />
          <Text className="text-center text-white text-lg font-semibold">
            Chat
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
