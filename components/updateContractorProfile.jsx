import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useSelector } from "react-redux";

const ProfileCard = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editableData, setEditableData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [organizationImage, setOrganizationImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  const token = useSelector(state => state.auth.token); // Assuming you're using Redux for token

  // Function to pick an image (for profile or organization)
  const pickImage = async (type) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You need to allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.cancelled) {
      if (type === "profile") {
        setProfileImage(result.uri);
      } else if (type === "organization") {
        setOrganizationImage(result.uri);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!userData) return;

    setUpdating(true);

    try {
      const response = await axios.post(
        `https://g32.iamdeveloper.in/api/contractors/update/${userData.id}`,
        editableData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setUserData(editableData);
        Alert.alert("Success", "Profile updated successfully.");
        setEditModalVisible(false);
      } else {
        Alert.alert("Error", "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating user data:", error.response?.data || error.message);
      Alert.alert("API Error", "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal visible={editModalVisible} transparent={true} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 p-5">
        <View className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
          <TouchableOpacity
            className="absolute top-3 right-3"
            onPress={() => setEditModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-center mb-5">Edit Profile</Text>

          {/* Profile Image */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-1">Profile Image</Text>
            <TouchableOpacity onPress={() => pickImage("profile")} className="items-center">
              <Image
                source={{ uri: profileImage || userData?.profile_image }}
                className="w-24 h-24 rounded-full border-2 border-gray-400"
              />
              <Text className="bg-gray-300 p-1 rounded-xl font-bold text-sky-950 mt-2">
                Change Profile Image
              </Text>
            </TouchableOpacity>
          </View>

          {/* Organization Image */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-1">Organization Image</Text>
            <TouchableOpacity onPress={() => pickImage("organization")} className="items-center">
              <Image
                source={{ uri: organizationImage || userData?.organization_image }}
                className="w-32 h-20 rounded-lg border-2 border-gray-400"
              />
              <Text className="bg-gray-300 p-1 rounded-xl font-bold text-sky-950 mt-2">
                Change Organization Image
              </Text>
            </TouchableOpacity>
          </View>

          {/* Editable Fields */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-1">Full Name</Text>
            <TextInput
              placeholder="Enter your name"
              value={editableData.name || userData?.name}
              onChangeText={(text) => setEditableData((prevData) => ({ ...prevData, name: text }))}
              className="border border-gray-300 rounded-lg p-3"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-1">Email</Text>
            <TextInput
              placeholder="Enter your email"
              value={editableData.email || userData?.email}
              onChangeText={(text) => setEditableData((prevData) => ({ ...prevData, email: text }))}
              className="border border-gray-300 rounded-lg p-3"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-1">Company</Text>
            <TextInput
              placeholder="Enter company name"
              value={editableData.company_name || userData?.company_name}
              onChangeText={(text) => setEditableData((prevData) => ({ ...prevData, company_name: text }))}
              className="border border-gray-300 rounded-lg p-3"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-1">City</Text>
            <TextInput
              placeholder="Enter city"
              value={editableData.city || userData?.city}
              onChangeText={(text) => setEditableData((prevData) => ({ ...prevData, city: text }))}
              className="border border-gray-300 rounded-lg p-3"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-1">Address</Text>
            <TextInput
              placeholder="Enter address"
              value={editableData.company_address || userData?.company_address}
              onChangeText={(text) => setEditableData((prevData) => ({ ...prevData, company_address: text }))}
              className="border border-gray-300 rounded-lg p-3"
            />
          </View>

          <TouchableOpacity className="bg-sky-950 p-3 rounded-lg" onPress={handleSaveChanges}>
            <Text className="text-white text-center font-bold">
              {updating ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ProfileCard;
