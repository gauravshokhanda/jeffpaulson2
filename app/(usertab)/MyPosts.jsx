import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  TextInput,
  SafeAreaView,
  Modal
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { API, baseUrl } from "../../config/apiConfig";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import { LinearGradient } from 'expo-linear-gradient';
import SortingModal from "../../components/SortingModal"
import { useWindowDimensions } from "react-native";





export default function MyPosts() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const postContentWidth = screenWidth * 0.92;

  const userId = useSelector((state) => state.auth.user.id);
  const token = useSelector((state) => state.auth.token);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const flatListRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("");


  const [scrollOffset, setScrollOffset] = useState(0);

  const iconRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const [position, setPosition] = useState({ top: 0, left: 0 });

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
    fetchPosts(1)
  };

  useEffect(() => {
    fetchPosts(1);
  }, [userId, token, searchQuery]);

  const fetchPosts = async (page = 1, append = false, order = sortOrder) => {
    setLoading(true);
    try {
      const response = await API.get(`job-posts/${userId}&sort_order=${order}`, {
        params: {
          page,
          city: searchQuery,
          sort_order: order  
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      const newPosts = response.data.data.data || [];
      setResults(append ? [...results, ...newPosts] : newPosts);
      setLastPage(response.data.data.last_page || 1);
    } catch (error) {
      console.error("Error fetching posts:", error);
      if (!append) setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadNextPage = () => {
    if (!loading && currentPage < lastPage) {
      const prevScrollOffset = scrollOffset;
      setCurrentPage((prev) => prev + 1);
      fetchPosts(currentPage + 1, true);

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: prevScrollOffset, animated: false });
      }, 200);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchPosts(1, false);
  };

  const onScroll = (event) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.length < 3) {
      fetchPosts(); // Reset to all posts if query is too short
      return;
    }

    try {
      const response = await axios.post(
        `https://g32.iamdeveloper.in/api/citie-search`,
        { city: query },  // API expects city name in request body
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Include the token
            "Content-Type": "application/json"
          }
        }
      );

      const filteredResults = response.data.data || [];
      setResults(filteredResults);
    } catch (error) {
      console.error("Error searching cities:", error);
      setResults([]);
    }
  };


  const renderItem = ({ item }) => {
    let imageUrls = [];
    try {
      const parsedImages = item.design_image
        ? JSON.parse(item.design_image)
        : [];
      imageUrls = parsedImages.map((imagePath) => `${baseUrl}${imagePath}`);
    } catch (error) {
      console.error("Error processing images:", error);
    }

    return (
      <View
        className="bg-white my-2 rounded-xl overflow-hidden shadow-lg"
        style={{
          shadowColor: "#082f49",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
          elevation: 10,
        }}
      >
        {imageUrls.length > 0 && (
          <FlatList
            horizontal
            data={imageUrls}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item: url }) => (
              <View style={{ width: postContentWidth, height: 150 }}>
                <Image
                  source={{ uri: url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            )}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={postContentWidth}
            decelerationRate="fast"

          />
        )}
        <View className="flex-row justify-between p-3">
          <View>
            <Text className="text-2xl font-bold text-sky-950">
              ${parseFloat(item.total_cost).toLocaleString()}
            </Text>
            <Text className="text-lg text-semiBold text-gray-600">
              #{item.zipcode}, {item.city}
            </Text>
            <Text>{item.area} sqft</Text>
          </View>
          <View>
            <Text className="text-lg font-bold">
              {item.project_type} Apartment
            </Text>
            <TouchableOpacity
              className="bg-sky-950 w-20 rounded-xl ml-14"
              onPress={() => router.push(`/EditPost?id=${item.id}`)}
            >
              <Text className="text-white text-center py-2">Edit</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1">

      <LinearGradient
        colors={['#082f49', 'transparent']}
        style={{ height: screenHeight * 0.4 }}
      >


        <View
          className={`flex-row justify-center items-center py-3 px-10 pb-4`}
        >
          {/* Search Bar */}
          <View className="flex-row items-center border border-white rounded-full px-4  mt-2 bg-white">
            <Ionicons name="search" size={24} color="#000000" />
            <TextInput
              className="flex-1 ml-2 text-black"
              placeholder="Start Search"
              placeholderTextColor="#000000"
              value={searchQuery}
              onChangeText={handleSearch}
              style={Platform.OS === "ios" ? { paddingVertical: 12 } : {}}
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

        className="flex-1 rounded-3xl bg-white"
        style={{
          marginTop: -screenHeight * 0.30,
          width: postContentWidth,

          marginHorizontal: (screenWidth - postContentWidth) / 2,
          overflow: 'hidden'
        }}
      >
        <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              showsVerticalScrollIndicator={false}
              data={results}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              refreshing={loading}
              onRefresh={handleRefresh}
              onScroll={onScroll}
              onEndReached={loadNextPage}
              onEndReachedThreshold={0.1}
              ListFooterComponent={loading && currentPage > 1 ? <ActivityIndicator size="small" color="#0000ff" /> : null}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
