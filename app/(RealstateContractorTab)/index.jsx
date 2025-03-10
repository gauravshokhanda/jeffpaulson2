import { View, Dimensions, Text, TextInput, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from "react-redux";
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { API, baseUrl } from '../../config/apiConfig';
import Swiper from 'react-native-swiper';





export default function Index() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const postContentWidth = screenWidth * 0.92;
  const userName = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const userId = userName.id;

  const [properties, setProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);



  const fetchProperties = async (page = 1) => {
    if (loading || page > totalPages) return;

    setLoading(true);
    try {
      const response = await API.get(
        `realstate-property/contractor/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log("response", response.data.properties.data)
      // console.log("response", response.data.properties.last_page)
      // console.log("response", response.data.properties)
      setProperties(page === 1 ? [response.data.properties.data[0]] : [...prev, response.data.properties.data[0]]);

      setCurrentPage(response.data.properties.current_page);
      setTotalPages(response.data.properties.last_page);
    } catch (error) {
      console.log("Error fetching properties:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setProperties([]);
      setCurrentPage(1);
      fetchProperties(1, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [token]);

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
                <View className="bg-white rounded-full p-1 justify-center items-center"
                >
                  <Text className="text-slate-700 text-sm "
                    style={{ fontSize: screenWidth * 0.022 }}
                  >{item.house_type}</Text>
                </View>
                <View className="bg-white rounded-full p-1 justify-center items-center">
                  <Text className="text-slate-700"
                    style={{ fontSize: screenWidth * 0.022 }}
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

        <View className="mt-2 items-end">
          <View className="bg-gray-100 w-52 h-12 mr-5 rounded-full px-3 flex-row items-center justify-between">
            <Ionicons name="search" size={18} color="black" />
            <TextInput
              placeholder="Home Search"
              placeholderTextColor={"gray"}
              style={{ fontSize: 14 }}
              className="flex-1 ml-2 text-lg text-sm"
            />
          </View>
        </View>
      </LinearGradient>


      <View className="rounded-3xl "
        style={{
          position: 'absolute',
          top: screenHeight * 0.20,
          width: postContentWidth,
          height: screenHeight * 0.80,
          left: (screenWidth - postContentWidth) / 2,
          backgroundColor: 'white',


        }}
      >





        <View className="m-5">

          <View className="rounded-2xl p-2">


            {loading == true ? (
              <ActivityIndicator size="large" color="#082f49" />
            ) : (
              <FlatList
                ListHeaderComponent={
                  <View>
                    <Text className="text-2xl font-semibold tracking-widest mb-4 text-black">Checkout your properties.</Text>
                  </View>
                }
                showsVerticalScrollIndicator={false}
                data={properties}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderListening}
                ListFooterComponent={
                  <View>
                    <View className="bg-[#505C3F] py-4 rounded-2xl  mt-6 shadow-lg flex-row  justify-between w-full">
                      {/* Left Section - Text */}
                      <View className="pl-2">
                        <Text className="text-white text-2xl font-semibold tracking-widest">New Properties!</Text>
                        <Text className="text-gray-100 text-lg tracking-wider">house and land packages</Text>
                      </View>

                      {/* Right Section - Image */}
                      <Image
                        source={require("../../assets/images/realState/NewProperty.png")}
                        className="w-32 h-24 "
                        style={{ resizeMode: "cover" }}
                      />
                    </View>

                    {/*  */}
                    <View className="py-10">
                      {/* Caution Box */}
                      <View className="bg-gray-100 rounded-xl p-4 flex-row items-start">
                        <Image
                          source={require("../../assets/images/realState/warning.png")} // Replace with the warning icon image
                          className="w-12 h-12 mr-3"
                        />
                        <View className="flex-1">
                          <Text className="text-xl font-bold text-black tracking-widest">Caution!</Text>
                          <Text className="text-gray-700 text-lg">
                            Be cautious of suspicious calls received from users posing as
                            ‘armyman’ or ‘Public Service’ & asking to transfer money.
                          </Text>
                          <TouchableOpacity
                            onPress={() => router.push("/KnowMore")}
                            className="mt-2">
                            <Text className="text-black font-bold">Know more &gt;</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* User Post */}
                      <View className="mt-8 flex-row items-start">
                        <Image
                          source={require("../../assets/images/realState/user-profile.png")} // Replace with the user image
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <View className="flex-1">
                          <Text className="text-black font-semibold text-xl tracking-widest">Jimmy Brooke</Text>
                          <Text className="text-gray-600 mt-1 tracking-wider text-lg w-[90%]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                            eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            <Text className="font-bold text-black"> Read more...</Text>
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="p-8 bg-gray-100 rounded-xl mb-5">
                      {/* Call Us Card */}
                      <TouchableOpacity className="bg-white border border-gray-300 rounded-xl p-4 flex-row items-center mb-3">
                        <View className="bg-gray-200 p-2 rounded-full mr-5">
                          <Ionicons name="call" size={20} color="black" />
                        </View>
                        <View className=" items-center ml-5">
                          <Text className="text-lg font-bold text-black">Call Us</Text>
                          <Text className="text-gray-700">1800-131-56677</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Email Us Card */}
                      <TouchableOpacity className="bg-white border border-gray-300 rounded-xl p-4 flex-row items-center">
                        <View className="bg-gray-200 p-2 rounded-full mr-3">
                          <Ionicons name="chatbubble-ellipses" size={20} color="black" />
                        </View>
                        <View className=" items-center ml-5">
                          <Text className="text-lg font-bold text-black">Email Us</Text>
                          <Text className="text-gray-700">Supportjeff@gmail.com</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>}

              />
            )}




          </View>

        </View>


      </View>
    </SafeAreaView>
  );
}