import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, Alert, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { API, baseUrl } from "../config/apiConfig";
import { router } from "expo-router";

const CardSlider = () => {
  const token = useSelector((state) => state.auth.token);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  const getContractors = async () => {
    setLoading(true);
    try {
      const response = await API.get("contractors/listing", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedData = response.data?.data?.data?.map((item) => ({
        id: item.id.toString(),
        image: item.image ? { uri: `${baseUrl}${item.image}` } : null,
        name: item.name,
        email: item.email,
        address: item.address,
        title: item.company_name,
        description: item.description,
        profileLink: `${baseUrl}${item.upload_organisation}`,
        contact: item.company_registered_number || "Not Available",
      }));

      setContractors(formattedData);
    } catch (error) {
      console.log("Error fetching contractors:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    getContractors();
  }, []);

  const handleVisitProfile = (id) => {
    router.push(`/ContractorProfile?id=${id}`);
  };

  const handleCall = (phone) => {
    if (phone === "Not Available") {
      Alert.alert("Info", "Contact number not available.");
    } else {
      Alert.alert("Calling", `Dialing: ${phone}`);
    }
  };

  const renderCard = ({ item }) => (
    <View
      className="bg-gray-200 rounded-lg p-5 mb-4 w-full items-center"
      style={{
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      }}
    >
      {/* Contractor Image */}
      {item.image ? (
        <Image source={item.image} className="w-24 h-24 rounded-full mb-3" resizeMode="cover" />
      ) : (
        <View className="w-24 h-24 border rounded-full bg-gray-300 flex items-center justify-center mb-3">
          <Text className="text-black text-3xl font-bold">
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Contractor Info */}
      <Text className="text-lg font-semibold text-gray-900 text-center">{item.name}</Text>
      <Text className="text-sm text-black text-center">{item.email}</Text>
      <Text className="text-sm text-black text-center">{item.address}</Text>
      <Text className="text-xs text-gray-600 text-center mt-1 mb-3" numberOfLines={2}>
        {item?.description?.length > 50 ? `${item.description.substring(0, 50)}...` : item.description}
      </Text>

      {/* Buttons */}
      <View className="flex-row gap-2 space-x-4 mt-3">
        <TouchableOpacity
          className="bg-sky-950 px-4 py-2 rounded-md"
          onPress={() => handleVisitProfile(item.id)}
        >
          <Text className="text-white font-semibold text-sm">View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-sky-950 px-4 py-2 rounded-md"
          onPress={() => handleCall(item.contact)}
        >
          <Text className="text-white font-semibold text-sm">Call Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="py-3 px-4">
      {loading ? (
        <View className="flex-1 justify-center items-center mt-5">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={contractors}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          refreshing={loading}
          onRefresh={getContractors}
        />
      )}

      {/* View All Button */}
      {!loading && contractors.length > 0 && (
        <View className="flex-row justify-center mt-6">
          <TouchableOpacity
            onPress={() => router.push("ContractorLists")}
            className="bg-blue-600 rounded-full py-3 px-8 items-center"
          >
            <Text className="text-white font-bold">View All Contractors</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CardSlider;
