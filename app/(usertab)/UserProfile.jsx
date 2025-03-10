import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useSelector } from "react-redux";
import { API, baseUrl } from "../../config/apiConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const MenuHeader = () => {
  const postContentWidth = screenWidth * 0.92;
  const userId = useSelector((state) => state.auth.user.id);
  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const getMyPosts = async () => {
      try {
        const response = await API.get(`job-posts/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data.data.data || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    getMyPosts();
  }, [userId, token]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await API.get(`user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data.data);
      } catch (error) {
        Alert.alert("API Error", "Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUserData();
  }, [token]);

  if (loading) return <ActivityIndicator size="large" color="#000" />;
  if (!userData) return <Text className="text-center text-red-500">User not found</Text>;

  return (
    <SafeAreaView className="flex-1">
      {/* Header with Gradient */}
      <LinearGradient colors={["#082f49", "transparent"]} className="h-[40%]">
        <View className="mt-10 px-4 gap-2 flex-row items-center">
          <Image
            source={{ uri: "https://xsgames.co/randomusers/assets/avatars/male/74.jpg" }}
            className="w-14 h-14 border-2 border-white rounded-full"
          />
          <View className="gap-1">
            <Text className="text-2xl font-semibold text-white">
              Welcome! {userData?.name || "User"}
            </Text>
            <Text className="text-gray-400">📍 Florida, USA</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content Container */}
      <View
        className="flex-1 rounded-3xl bg-white"
        style={{
          marginTop: -screenHeight * 0.20, // Overlap with gradient
          width: postContentWidth,
          marginHorizontal: (screenWidth - postContentWidth) / 2,
        }}
      >
        <View className="flex-1 p-4">
          {/* User Info */}
          <View className="p-4 rounded-lg gap-3">
            <Text className="text-xl font-semibold tracking-widest">Name - {userData.name}</Text>
            <Text className="text-xl font-semibold tracking-wider">Email - {userData.email}</Text>
            <Text className="text-xl font-semibold tracking-wider">
              Company - {userData.company_name || ""}
            </Text>
            <Text className="text-xl font-semibold tracking-wider">City - {userData.city || ""}</Text>
            <Text className="text-xl font-semibold tracking-wider">
              Address - {userData.company_address || ""}
            </Text>
            <Text className="text-xl font-semibold tracking-wider">
              Zip Code - {userData.zip_code || ""}
            </Text>
          </View>

          {/* My Posts Section */}
          <View className="mt-5 flex-1">
            <View className="flex-row gap-2 items-center">
              <Text className="font-bold text-xl text-sky-950 tracking-widest pl-5">My Posts</Text>
              <Ionicons name="images" size={30} color="gray" />
            </View>

            {posts.length > 0 ? (
              <FlatList
                data={posts}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="m-2 p-3 bg-white rounded-lg shadow-md w-full flex-row">
                    {item.design_image && JSON.parse(item.design_image).length > 0 && (
                      <Image
                        source={{ uri: `${baseUrl}/${JSON.parse(item.design_image)[0]}` }}
                        className="w-32 h-32 rounded-lg mr-4"
                        resizeMode="cover"
                      />
                    )}
                    <View className="flex-1">
                      <Text className="text-lg font-semibold">{item.description}</Text>
                      <Text className="text-gray-600">Project Type: {item.project_type}</Text>
                      <Text className="text-gray-600">City: {item.city}</Text>
                      <Text className="text-gray-600">Total Cost: ${item.total_cost}</Text>
                    </View>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }} // Ensure last item is scrollable
              />
            ) : (
              <Text className="text-gray-500 mt-3">No job posts available.</Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MenuHeader;