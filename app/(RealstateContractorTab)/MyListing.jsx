import { View, Dimensions, Text, TextInput, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { API, baseUrl } from '../../config/apiConfig';
import Swiper from 'react-native-swiper';
export default function Listing() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const postContentWidth = screenWidth * 0.92;

  const [selectedPropertyType, setSelectedPropertyType] = useState('residential');

  const [properties, setProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.user.id);



  const fetchProperties = async (page = 1) => {
    if (loading || page > totalPages) return;

    setLoading(true);
    try {
      const response = await API.get(
        `realstate-property/contractor/${userId}?property_type=${selectedPropertyType}&page=${page}&city=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log("response", response.data.properties.data)
      // console.log("response", response.data.properties.last_page)
      // console.log("response", response.data.properties)
      setProperties((prev) =>
        page === 1 ? response.data.properties.data : [...prev, ...response.data.properties.data]
      );
      setCurrentPage(response.data.properties.current_page);
      setTotalPages(response.data.properties.last_page);
    } catch (error) {
      console.log("Error fetching properties:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setProperties([]); // Reset properties list
      setCurrentPage(1);
      fetchProperties(1, searchQuery); // Pass search query to API
    }, 500); // Debounce time (500ms)

    return () => clearTimeout(delayDebounceFn); // Cleanup timeout
  }, [searchQuery, selectedPropertyType]);


  const loadMore = () => {
    if (currentPage < totalPages) {
      fetchProperties(currentPage + 1);
    }
  };



  const propertyTypes = [
    { id: 'residential', label: 'Residential' },
    { id: 'commercial', label: 'Commercial' },
  ];

  const renderPropertyTypeItem = ({ item }) => {
    const isSelected = selectedPropertyType === item.id
    return (
      <TouchableOpacity
        className={`px-8 py-2 flex-row items-center justify-center border-b-2 ${isSelected ? "border-sky-900" : "border-gray-300"}`}
        onPress={() => setSelectedPropertyType(item.id)}
      >
        <Text className={`text-lg font-medium ${isSelected ? "text-sky-900" : "text-gray-400"}`}>
          {item.label}
        </Text>
      </TouchableOpacity>
    )
  }


  const renderListening = ({ item }) => {
    const propertyImages = JSON.parse(item.property_images) || [];

    return (
      <View
        style={{
        }}
        className="rounded-xl bg-white shadow-md overflow-hidden mb-4"
      >
        <TouchableOpacity
          className="bg-sky-950 p-4 flex-row items-start"
          onPress={() => router.push(`SingleListing?id=${item.id}`)}
        >
          <View className="flex-1">
            {/* Location and Tags */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color="white" />
                <Text className="text-white font-bold ml-2">{item.city}</Text>
              </View>
              <View className="flex-row gap-2">
                <View className="bg-white rounded-full px-3 justify-center items-center"
                >
                  <Text className="text-slate-700"
                    style={{ fontSize: screenWidth * 0.03 }}
                  >{item.house_type}
                  </Text>
                </View>
                <View className="bg-white rounded-full p-1 justify-center items-center">
                  <Text className="text-slate-700"
                    style={{ fontSize: screenWidth * 0.03 }}
                  >
                    {(item.locale.split(" ").slice(0, 2).join(" ") + (item.locale.split(" ").length > 2 ? "..." : "")).trim()}

                  </Text>
                </View>
              </View>
            </View>

            <View className="my-2">
              <Text className="text-gray-100">{item.address}</Text>
            </View>

            <View className="flex-row items-center">
              <View
                style={{
                  width: screenWidth * 0.2,
                  height: screenWidth * 0.2,
                }}
                className="mr-4"
              >
                {propertyImages.length > 0 ? (
                  <Swiper
                    className="w-full h-full"
                    loop
                    autoplay
                    autoplayTimeout={3}
                    showsPagination={false}
                  >
                    {propertyImages.map((image, index) => (
                      <View key={index} className="w-full h-full">
                        <Image
                          className="rounded-full"
                          source={{
                            uri: `${baseUrl}${image.replace(/\\/g, '/')}`,
                          }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </Swiper>
                ) : (
                  <Image
                    source={require("../../assets/images/realState/checkoutProperty.png")}
                    style={{ width: '100%', height: '100%', borderRadius: 10 }}
                    resizeMode="cover"
                  />
                )}
              </View>

              <View className="flex-1 space-y-2 mt-2">
                <View className="flex-row items-center justify-start">
                  <View className="flex-row items-center justify-center gap-2">
                    <Text className="text-white text-2xl font-bold">${item.price}</Text>
                    <Text className="text-gray-300 text-lg">USD</Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="white" />
                  <Text className="text-gray-300 ml-2">
                    Available from {new Date(item.available_from).toISOString().split('T')[0]}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Ionicons name="resize-outline" size={16} color="white" />
                  <Text className="text-gray-300 ml-2">Area - {item.area} sq ft</Text>
                </View>

                <View className="flex-row items-center">
                  <Ionicons name="bed-outline" size={16} color="white" />
                  <Text className="text-gray-300 ml-2">{item.furnish_type}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bottom Section with Button */}
        <View className="bg-gray-200 rounded-b-2xl p-4 flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-gray-600">Get ready list of buyers</Text>
          <TouchableOpacity className="bg-white px-4 py-2 rounded-lg shadow-md">
            <Text className="text-indigo-900 font-semibold">Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView className="flex-1 bg-gray-200">

      <LinearGradient
        colors={['#082f49', 'transparent']}

        style={{ height: screenHeight * 0.4 }}
      >
        <View className="mt-2">
          <TouchableOpacity
            className="absolute top-6 z-10 left-5"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-white mb-4 py-4 text-center">
            My property Listing
          </Text>
        </View>
        <View className="mx-5 mt-5 items-end">
          <View className="bg-gray-100  h-12 mr-5 rounded-full px-3 flex-row items-center justify-between ">
            <Ionicons name="search" size={18} color="black" />
            <TextInput

              placeholder="Search by City"
              placeholderTextColor={"gray"}
              style={{ fontSize: 14 }}
              className="flex-1 ml-5 text-lg text-sm"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="filter-sharp" size={26} color="black" />

          </View>
        </View>


      </LinearGradient>


      <View className="rounded-3xl"
        style={{
          position: 'absolute',
          top: screenHeight * 0.20,
          width: postContentWidth,
          height: screenHeight * 0.75,
          left: (screenWidth - postContentWidth) / 2,
          backgroundColor: 'white',

        }}
      >

        <View className="flex-1 m-5">
          <View className="p-3 rounded-lg">
            <FlatList
              data={propertyTypes}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderPropertyTypeItem}
              contentContainerStyle={{ flexGrow: 1, gap: 10 }}
            />
          </View>
          <View className=" flex-1 mt-2 mb-3">
            {loading == true ? (
              <ActivityIndicator size="large" color="#082f49" />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={properties}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderListening}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
              />
            )}


          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}