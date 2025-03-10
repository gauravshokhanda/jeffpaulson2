import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { API, baseUrl } from "../config/apiConfig";
import { useSelector } from "react-redux";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const EstateSlider = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const token = useSelector((state) => state.auth.token);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const response = await API.get("get/real-state-contractors", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.contractors || !Array.isArray(response.data.contractors.data)) {
        console.error("❌ No valid contractors data found");
        return;
      }

      const contractorsData = response.data.contractors.data.map((item) => ({
        id: item.id.toString(),
        image: item.image ? { uri: `${baseUrl}${item.image}` } : null,
        name: item.name || "Unknown",
        email: item.email || "No Email",
        number: item.number || "Not Available",
        address: item.address || "No Address",
      }));

      setContractors(contractorsData);
    } catch (error) {
      console.error("🚨 API Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  const handleCall = (phone) => {
    Alert.alert("Calling", `Dialing: ${phone}`);
  };

  const renderCard = ({ item }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "white",
          padding: 15,
          marginHorizontal: 15,
          marginVertical: 10,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 5,
        }}
      >
        {/* Profile Image */}
        {item.image ? (
          <Image
            source={item.image}
            style={{ width: 70, height: 70, borderRadius: 35, marginRight: 15 }}
          />
        ) : (
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "gray",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 15,
            }}
          >
            <Text style={{ color: "white" }}>No Image</Text>
          </View>
        )}

        {/* Contractor Details */}
        <View style={{ flex: 1 }}>
          <TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 2 }}>{item.name}</Text>
          <Text style={{ color: "gray", marginBottom: 2 }}>📍 {item.address}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="p-4">
      {loading ? (
        <ActivityIndicator size="large" color="#000" className="mt-10" />
      ) : contractors.length > 0 ? (
        <FlatList
          data={contractors}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchContractors}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
      ) : (
        <Text style={{ textAlign: "center", color: "gray", marginTop: 20 }}>
          No contractors available.
        </Text>
      )}

      {/* View All Button */}
      <View className="mt-4 items-center">
        <TouchableOpacity
          className="bg-sky-950 rounded-md px-6 py-2 flex-row items-center"
          onPress={() => navigation.navigate("ContractorPage")}
        >
          <Ionicons name="eye" size={20} color="white" className="mr-2" />
          <Text className="text-white text-base font-semibold">View All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EstateSlider;
