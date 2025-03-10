import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const ChatListScreen = ({ navigation }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const postContentWidth = screenWidth * 0.92;
  const router = useRouter();
  const [chats, setChats] = useState([
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      id: "2",
      name: "Alice Smith",
      lastMessage: "See you tomorrow!",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      id: "3",
      name: "Michael Johnson",
      lastMessage: "Can we reschedule?",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      id: "4",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      id: "5",
      name: "Alice Smith",
      lastMessage: "See you tomorrow!",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      id: "6",
      name: "Michael Johnson",
      lastMessage: "Can we reschedule?",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      id: "7",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      id: "8",
      name: "Alice Smith",
      lastMessage: "See you tomorrow!",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      id: "9",
      name: "Michael Johnson",
      lastMessage: "Can we reschedule?",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      id: "10",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      id: "11",
      name: "Alice Smith",
      lastMessage: "See you tomorrow!",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      id: "12",
      name: "Michael Johnson",
      lastMessage: "Can we reschedule?",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
    },
  ]);

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#082f49", "transparent"]}
        style={{ height: screenHeight * 0.4 }}
      >
        {/* Header */}
        <View className="p-4 flex-row justify-center items-center">
          <Text className="text-white text-2xl mt-5 font-bold ">Chats</Text>
        </View>
        <View className="mx-5 mt-5 items-end">
          <View className="bg-gray-100 h-12 rounded-full px-3 flex-row items-center justify-between">
            <Ionicons name="search" size={18} color="black" />
            <TextInput
              placeholder="Search"
              placeholderTextColor={"gray"}
              style={{ fontSize: 14 }}
              className="flex-1 ml-5 text-lg"
            />
            <Ionicons name="filter-sharp" size={26} color="black" />
          </View>
        </View>
      </LinearGradient>
      <View
        className="flex-1 rounded-3xl bg-white"
        style={{
          marginTop: -screenHeight * 0.23,
          width: postContentWidth,
          marginHorizontal: (screenWidth - postContentWidth) / 2,
          overflow: "hidden",
        }}
      >
        <View className="flex-1 mt-3">
          {/* Chat List */}
          <FlatList
            contentContainerStyle={{ borderRadius: 5 }}
            showsVerticalScrollIndicator={false}
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push("ChatScreen", {
                    name: item.name,
                    image: item.image,
                  })
                }
                className="flex-row items-center p-4 border-b border-gray-300 bg-white"
              >
                <Image
                  source={{ uri: item.image }}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {item.name}
                  </Text>
                  <Text className="text-gray-500">{item.lastMessage}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="gray" />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
export default ChatListScreen;