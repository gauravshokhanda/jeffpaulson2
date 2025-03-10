import {
  View,
  Dimensions,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Modal
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { API, baseUrl } from "../../config/apiConfig";
import { router } from "expo-router";
import moment from "moment";
import Swiper from "react-native-swiper";
import SortingModal from "../../components/SortingModal"
import { useWindowDimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";


export default function Index() {
  const token = useSelector((state) => state.auth.token);
  const [contractors, setContractors] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedTab, setSelectedTab] = useState("realEstate");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [sortOrder, setSortOrder] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const iconRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const postContentWidth = screenWidth * 0.92;
  const flatListRef = useRef(null);

  const openModal = () => {
    iconRef.current?.measure((_fx, _fy, _width, _height, px, py) => {
      // Ensure dropdown does not overflow the screen
      const leftPosition = Math.min(px, width - 150);
      const topPosition = Math.min(py + _height + 5, height - 100);

      setPosition({ top: topPosition, left: leftPosition });
    });
    setModalVisible(true);
  };

  const handleSort = (order) => {
    setSortOrder(order);
    setModalVisible(false);
    setCurrentPage(1);
    if (selectedTab === "realEstate") {
      setProperties([]);
      fetchRealEstateProperties(1, order);
    } else {
      setContractors([]);
      fetchContractors(searchTerm, 1, order);
    }
  };

  const fetchContractors = async (query = "", page = 1, order = sortOrder) => {
    if (loading || page > totalPages) return;

    setLoading(true);
    try {
      const url = `contractors/listing?${query ? `city=${encodeURIComponent(query)}&` : ""}page=${page}&sort_order=${order}

`;
      const response = await API.get(url, { headers: { Authorization: `Bearer ${token}` } });
      const formattedData = response.data.data.data.map((item) => ({
        id: item.id.toString(),
        image: { uri: `${baseUrl}${item.image}` },
        banner: { uri: `${baseUrl}${item.upload_organisation}` },
        name: item.name,
        email: item.email,
        city: item.city,
        contactNumber: item.company_registered_number,
        company: item.company_name,
        address: item.company_address,
        createdAt: moment(item.created_at).fromNow(),
      }));
      setContractors((prev) => (page === 1 ? formattedData : [...prev, ...formattedData]));
      setCurrentPage(response.data.data.current_page);
      setTotalPages(response.data.data.last_page);
    } catch (error) {
      console.error("Error fetching contractors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealEstateProperties = async (page = 1) => {
    if (loading || page > totalPages) return;

    setLoading(true);
    try {
      const response = await API.get(
        `get-property/type?page=${page}&city=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProperties((prev) => (page === 1 ? response.data.properties.data : [...prev, ...response.data.properties.data]));
      setCurrentPage(response.data.properties.current_page);
      setTotalPages(response.data.properties.last_page);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      setCurrentPage(1);
      if (selectedTab === "realEstate") {
        setProperties([]);
        fetchRealEstateProperties(1);
      } else {
        setContractors([]);
        fetchContractors(searchTerm, 1);
      }
    }, 500);

    return () => clearTimeout(debounceSearch);
  }, [searchTerm, selectedTab]);

  const handleScroll = (event) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  const loadMore = () => {
    if (loading || currentPage >= totalPages) return;

    console.log("Loading more data...");
    const nextPage = currentPage + 1;

    if (selectedTab === "realEstate") {
      fetchRealEstateProperties(nextPage).then(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: scrollOffset, animated: false });
        }
      });
    } else {
      fetchContractors(searchTerm, nextPage).then(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: scrollOffset, animated: false });
        }
      });
    }
  };

  // Reset scroll position when tab changes
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  }, [selectedTab]);

  const renderContractor = ({ item }) => (
    <View className="bg-white shadow-lg rounded-2xl mb-4 overflow-hidden border">
      <View className="relative">
        <Image source={item.banner} className="w-full h-24" resizeMode="cover" />
        <View className="absolute bottom-1 left-4 flex-row items-center">
          <Image
            source={item.image}
            className="w-16 h-16 rounded-full border-2 border-white"
          />
          <View className="ml-4">
            <Text className="text-lg font-bold text-white">{item.name}</Text>
            <Text className="text-white text-sm">{item.company}</Text>
          </View>
        </View>
      </View>
      <View className="p-4">
        <Text className="font-semibold text-gray-700">
          Email: <Text className="text-gray-600">{item.email}</Text>
        </Text>
        <Text className="font-semibold text-gray-700">
          Phone: <Text className="text-gray-600">{item.contactNumber}</Text>
        </Text>
        <Text className="font-semibold text-gray-700">
          City: <Text className="text-gray-600">{item.city}</Text>
        </Text>
        <Text className="font-semibold text-gray-700">
          Address: <Text className="text-gray-600">{item.address}</Text>
        </Text>
      </View>
      <View className="flex-row justify-between items-center px-4 pb-4 gap-2">
        <TouchableOpacity
          className="bg-sky-950 p-2 rounded-lg"
          onPress={() => router.push(`ContractorProfile/?id=${item.id}`)}
        >
          <Text className="text-white">Visit Profile</Text>
        </TouchableOpacity>
        <View className="flex-row gap-5">
          <TouchableOpacity onPress={() => router.push(`/ChatScreen?user_id=${item.id}`)}>
            <Ionicons name="mail-outline" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(`/ChatScreen?id=${item.id}`)}>
            <Ionicons name="call-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderListening = ({ item }) => {
    const propertyImages = JSON.parse(item.property_images) || [];
    return (
      <View className="rounded-xl bg-white shadow-md overflow-hidden mb-4">
        <TouchableOpacity
          className="bg-sky-950 p-4 flex-row items-start"
          onPress={() => router.push(`SingleListing?id=${item.id}`)}
        >
          <View className="flex-1">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color="white" />
                <Text className="text-white font-bold ml-2">{item.city}</Text>
              </View>
              <View className="flex-row gap-2">
                <View className="bg-white rounded-full p-1">
                  <Text className="text-slate-700" style={{ fontSize: screenWidth * 0.022 }}>
                    {item.house_type}
                  </Text>
                </View>
                <View className="bg-white rounded-full p-1">
                  <Text className="text-slate-700" style={{ fontSize: screenWidth * 0.022 }}>
                    {(item.locale.split(" ").slice(0, 2).join(" ") +
                      (item.locale.split(" ").length > 2 ? "..." : "")).trim()}
                  </Text>
                </View>
              </View>
            </View>
            <Text className="text-gray-100 my-2">{item.address}</Text>
            <View className="flex-row items-center">
              <View style={{ width: screenWidth * 0.2, height: screenWidth * 0.2 }} className="mr-4">
                {propertyImages.length > 0 ? (
                  <Swiper className="w-full h-full" loop autoplay autoplayTimeout={3} showsPagination={false}>
                    {propertyImages.map((image, index) => (
                      <Image
                        key={index}
                        className="rounded-full"
                        source={{ uri: `${baseUrl}${image.replace(/\\/g, "/")}` }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ))}
                  </Swiper>
                ) : (
                  <Image
                    source={require("../../assets/images/realState/checkoutProperty.png")}
                    style={{ width: "100%", height: "100%", borderRadius: 10 }}
                    resizeMode="cover"
                  />
                )}
              </View>
              <View className="flex-1 space-y-2">
                <Text className="text-white text-2xl font-bold">
                  ${item.price} <Text className="text-gray-300 text-lg">USD</Text>
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="white" />
                  <Text className="text-gray-300 ml-2">
                    Available from {new Date(item.available_from).toISOString().split("T")[0]}
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
      <LinearGradient colors={["#082f49", "transparent"]} style={{ height: screenHeight * 0.4 }}>
        <View className="mt-8 px-4">
          <Text className="text-2xl font-semibold text-white">Properties & Contractors</Text>
        </View>
        <View className="mx-5 mt-5 items-end">
          <View className="bg-gray-100 h-12 rounded-full px-3 flex-row items-center justify-between">
            <Ionicons name="search" size={18} color="black" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="gray"
              className="flex-1 ml-5 text-lg"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <TouchableOpacity ref={iconRef} onPress={openModal}>
              <Ionicons name="filter-sharp" size={26} color="black" />
            </TouchableOpacity>
            <SortingModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onSelect={handleSort} position={position} />
          </View>
        </View>
      </LinearGradient>
      <View
        className="rounded-3xl"
        style={{
          position: "absolute",
          top: screenHeight * 0.2,
          width: postContentWidth,
          height: screenHeight * 0.75,
          left: (screenWidth - postContentWidth) / 2,
          backgroundColor: "white",
          padding: 20,
        }}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="flex-row justify-around mb-4">
            <TouchableOpacity
              onPress={() => setSelectedTab("realEstate")}
              className={`px-4 py-2 rounded-xl ${selectedTab === "realEstate" ? "bg-sky-950" : "bg-gray-300"}`}
            >
              <Text className={selectedTab === "realEstate" ? "text-white" : "text-black"}>
                Real Estate Property
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab("contractors")}
              className={`px-4 py-2 rounded-xl ${selectedTab === "contractors" ? "bg-sky-950" : "bg-gray-300"}`}
            >
              <Text className={selectedTab === "contractors" ? "text-white" : "text-black"}>
                Contractors
              </Text>
            </TouchableOpacity>
          </View>
          {loading && currentPage === 1 ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <FlashList
              ref={flatListRef}
              data={selectedTab === "realEstate" ? properties : contractors}
              renderItem={selectedTab === "realEstate" ? renderListening : renderContractor}
              keyExtractor={(item, index) => item.id + "-" + index}
              estimatedItemSize={150}
              onEndReached={loadMore}
              onEndReachedThreshold={0.2}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              ListFooterComponent={loading && <ActivityIndicator size="large" color="#007AFF" />}
              showsVerticalScrollIndicator={false}
            />

          )}
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}