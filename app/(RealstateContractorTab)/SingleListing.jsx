import { useEffect, useState, useMemo } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, FlatList } from "react-native";
import { useRouter, useLocalSearchParams, router } from "expo-router";
import { API, baseUrl } from "../../config/apiConfig";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

export default function PropertyDetails() {
  const { id } = useLocalSearchParams();
  const token = useSelector((state) => state.auth.token);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const [selectedPropertyType, setSelectedPropertyType] = useState('detail');
  const [property, setProperty] = useState(null);
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [designImages, setDesignImages] = useState([]);

  const propertyTypes = useMemo(() => [
    { id: 'detail', label: 'Detail' },
    { id: 'gallery', label: 'Gallery' },
  ], []);

  const handleFetchListing = async () => {
    try {
      const response = await API.get(`realstate-property/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log("single response", response.data);

      if (response.data.property) {
        const propertyData = response.data.property;

        // Parse property_images and add the full API URL if needed
        const imagesArray = JSON.parse(propertyData.property_images || "[]").map(
          (img) => `${baseUrl}/${img}`
        );

        setProperty(propertyData);
        setMainImage(imagesArray.length > 0 ? imagesArray[0] : null);
        setDesignImages(imagesArray);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    handleFetchListing();
  }, [token, id]);

  const renderPropertyTypeItem = ({ item }) => {
    const isSelected = selectedPropertyType === item.id;
    return (
      <View>
      <TouchableOpacity
        className={`px-8 py-2 flex-row items-center justify-between border-b-2 ${isSelected ? "border-sky-900" : "border-gray-300"}`}
        onPress={() => setSelectedPropertyType(item.id)}
      >
        <Text className={`text-lg mx-10 font-medium ${isSelected ? "text-sky-900" : "text-gray-400"}`}>
          {item.label}
        </Text>
        
      </TouchableOpacity>
      </View>
    );
  };

  // Memoize propertyDetails calculation
  const propertyDetails = useMemo(() => {
    return property ? [
      { label: "City", value: property.city },
      { label: "Address", value: property.address },
      { label: "Available from", value: property.available_from.split("T")[0] },
      { label: "Property Type", value: property.property_type },
      { label: "Building Type", value: property.house_type },
      { label: "Area", value: `${property.area} sqft` },
      { label: "Locality", value: property.locale },
      { label: "Price", value: `₹${property.price}` },
      { label: "Furnish Type", value: property.furnish_type },
      { label: "BHK", value: property.bhk },
    ] : [];
  }, [property]);

  const renderDetailsItems = ({ item }) => (
    <View className="flex-row mb-2 ml-3 gap-10">
      <Text className="font-semibold w-32">{item.label}:</Text>
      <Text className="text-gray-700">{item.value || "-"}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* backbutton and chatbutton */}
      <View className="w-[100%] flex-row items-center justify-between p-3 absolute z-10 bg-black/40">
        <TouchableOpacity onPress={() => router.replace("Listings")} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => console.log("Chat Clicked")}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>


      <View className="flex-1">

        {/* Main Image */}
        <View className="relative">
          <Image source={{ uri: mainImage }} className="w-full h-60 rounded-lg" />
        </View>

        {/* Thumbnail Gallery */}
        <ScrollView horizontal className="mt-4 p-2 bg-white rounded-lg mx-2"
          style={{
            elevation: 15,
            shadowColor: "#374151",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
          }}
        >
          {designImages.map((img, index) => (
            <TouchableOpacity key={index} onPress={() => setMainImage(img)}>
              <Image source={{ uri: img }} className="mr-2 rounded-lg"
                style={{ height: screenHeight * 0.1, width: screenWidth * 0.25 }} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Property Type Tabs */}
      <View className="mt-4 p-4 bg-white rounded-lg mx-2">
        <FlatList
          data={propertyTypes}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderPropertyTypeItem}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </View>

      {/* Property Details & Gallery */}
      <View className="flex-1 p-4">
        {selectedPropertyType === 'detail' ? (
          <View>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold mb-2">Property Details:</Text>
              <TouchableOpacity className="bg-sky-950 px-2 py-1 rounded-md flex-row items-center">
                <Text className="text-white text-lg font-semibold">
                  {property?.furnish_type ? `⏳ ${property.furnish_type} Furnished` : "⏳ Fully Furnished"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Property Details List */}
            <FlatList
              data={propertyDetails}
              keyExtractor={(item) => item.label}
              renderItem={renderDetailsItems}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
          </View>
        ) : (
          <View>
            <Text className="text-xl font-bold mb-3">Gallery ({designImages.length})</Text>
            <FlatList
              data={designImages}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              key={"gallery"}
              columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 10 }}
              renderItem={({ item }) => (
                <Image source={{ uri: item }}
                  className="w-[48%] rounded-lg"
                  style={{ height: 150, marginBottom: 10 }} />
              )}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
