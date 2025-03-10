import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons, Entypo, AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { API } from "../../config/apiConfig";

const ChatScreen = () => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const postContentWidth = screenWidth * 0.92;
  const { user_id, id } = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [property, setProperty] = useState(null);
  const [draftAttachment, setDraftAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const token = useSelector((state) => state.auth.token);
  const router = useRouter();

  useEffect(() => {
    setDraftAttachment(null);
    const fetchData = async () => {
      // console.log(`id ${id} user_id ${user_id}`)
      try {
        setLoading(true);
        if (user_id) {
          const userResponse = await API.get(
            `users/listing/${user_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // console.log("userResponse", userResponse.data.data)

          if (userResponse.status === 200) {
            setUser(userResponse.data.data);

          }

        }

        if (id) {
          const propertyResponse = await axios.get(
            `https://g32.iamdeveloper.in/api/realstate-property/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );


          if (propertyResponse.status === 200) {
            // console.log("API working");
            // console.log(propertyResponse.data);

            const propertyData = propertyResponse.data.property;
            setProperty(propertyData);

            setDraftAttachment({
              id: propertyData.id,
              title: `${propertyData.bhk} in ${propertyData.city}`,
              image: "https://via.placeholder.com/200",
              price: `₹${propertyData.price}`,
              address: propertyData.address,
            });
          }
          else {
            setDraftAttachment(null);
          }
        }

      } catch (error) {
        console.log("Error fetching data:", error.response?.data || error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (user_id || id) {
      fetchData();
    }
  }, [id,user_id]);

  const sendMessage = () => {
    if (inputText.trim() === "") return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "me",
      attachment: draftAttachment,
    };

    setMessages([newMessage, ...messages]);
    setInputText("");
    // Only reset draftAttachment if it was used in the message
    
      setDraftAttachment(null);
    
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <LinearGradient
        colors={["#082f49", "transparent"]}
        style={{ height: screenHeight * 0.4 }}
      >
        <View className="flex-row items-center p-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : user ? (
            <>
              <Image
                source={{
                  uri: user.profile_photo || "https://via.placeholder.com/50",
                }}
                className="w-10 h-10 rounded-full mr-3"
              />
              <Text className="text-white text-lg font-bold">{user.name}</Text>
            </>
          ) : (
            <Text className="text-white text-lg font-bold">User Not Found</Text>
          )}
        </View>
      </LinearGradient>

      {/* Main Chat Container */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20} // Adjust this value based on your header height
        className="flex-1"
      >
        <View
          className="flex-1 rounded-3xl bg-white"
          style={{
            width: postContentWidth,
            marginHorizontal: (screenWidth - postContentWidth) / 2,
            marginTop: -screenHeight * 0.25, 
          }}
        >
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            inverted
            renderItem={({ item }) => (
              <View
                className={`flex-row items-end mx-3 my-2 ${item.sender === "me" ? "self-end flex-row-reverse" : "self-start"
                  }`}
              >
                <Image
                  source={{
                    uri:
                      item.sender === "me"
                        ? "https://randomuser.me/api/portraits/men/2.jpg"
                        : user?.profile_photo ||
                          "https://via.placeholder.com/50",
                  }}
                  className="w-8 h-8 rounded-full mx-1"
                />
                <View
                  className={`p-3 w-[80%] rounded-lg ${item.sender === "me"
                    ? "bg-sky-950 self-end"
                    : "bg-white border border-gray-300 self-start"
                    }`}
                >
                  <Text
                    className={`${
                      item.sender === "me" ? "text-white" : "text-gray-900"
                    } text-lg`}
                  >
                    {item.text}
                  </Text>
                  {item.attachment && (
                    <TouchableOpacity
                      onPress={() =>
                        router.push(
                          `/RealEstateDetails?id=${item.attachment.id}`
                        )
                      }
                      className="mt-2 bg-gray-200 p-2 rounded-lg"
                    >
                      <Text className="text-gray-900 text-center font-semibold">
                        {item.attachment.title}
                      </Text>
                      <Text className="text-gray-600 text-center">
                        {item.attachment.address}
                      </Text>
                      <Text className="text-green-600 text-center font-bold">
                        {item.attachment.price}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingVertical: 10 }}
          />

          {/* Draft Property Attachment */}
          {draftAttachment ? (
            <View className="flex-row items-center bg-white p-3 border-t border-gray-300">
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">
                  {draftAttachment.title}
                </Text>
                <Text className="text-gray-600">{draftAttachment.address}</Text>
                <Text className="text-green-600 font-bold">
                  {draftAttachment.price}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setDraftAttachment(null)}
                className="ml-2"
              >
                <AntDesign name="closecircle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ) : ""}

          {/* Chat Input Box */}
          <View className="flex-row items-center p-4 bg-white border-t border-gray-300">
            <TouchableOpacity className="mr-2">
              <Entypo name="emoji-happy" size={28} color="gray" />
            </TouchableOpacity>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              className="flex-1 p-3 bg-gray-200 rounded-full text-gray-900"
            />
            <TouchableOpacity
              onPress={sendMessage}
              className="ml-3 bg-sky-950 p-3 rounded-full"
            >
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
