import { View, Text, Image, FlatList, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { API, baseUrl } from "../../config/apiConfig";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ContractorProfile = () => {
  const { id } = useLocalSearchParams();
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchContractorDetails = async () => {
      setLoading(true);
      try {
        const response = await API.get(`contractors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const contractorData = response.data.data;
        
        // Parse portfolio images if it's a JSON string
        let portfolioImages = [];
        try {
          portfolioImages = JSON.parse(contractorData.portfolio.replace(/\\/g, ""));
        } catch (error) {
          console.log("Error parsing portfolio:", error);
        }

        setContractor({
          ...contractorData,
          image: `${baseUrl}${contractorData.image}`,
          upload_organisation: `${baseUrl}${contractorData.upload_organisation}`,
          portfolio: portfolioImages.map((img) => `${baseUrl}${img}`),
        });

      } catch (error) {
        console.log("Error fetching contractor details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContractorDetails();
    }
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  if (!contractor) {
    return <Text className="text-center text-red-500">Contractor not found</Text>;
  }

  return (
    <ScrollView className="bg-white p-4 shadow-lg rounded-lg">
      {/* Header with Company Image */}
      <View className="mt-5 relative w-full h-52">
        <Image source={{ uri: contractor.upload_organisation }} className="w-full h-full rounded-lg" />
        <Text className="absolute bottom-4 right-4 text-black font-bold text-lg">
          {contractor.company_name}
        </Text>
        <Image source={{ uri: contractor.image }} className="absolute -bottom-9 left-4 w-28 h-28 rounded-full border-2 border-white" />
      </View>

      {/* Contractor Details */}
      <View className="mt-16 p-4 w-full gap-3 bg-gray-100 rounded-lg">
        <Text className="text-xl font-semibold tracking-widest">Name - {contractor.name}</Text>
        <Text className="text-xl font-semibold mt-1 tracking-wider">Company - {contractor.company_name}</Text>
        <Text className="text-xl font-semibold mt-1 tracking-wider">City - {contractor.city}</Text>
        <Text className="text-xl font-semibold mt-1 tracking-wider">Address - {contractor.company_address}</Text>
        <Text className="text-xl font-semibold mt-1 tracking-wider">Zip Code - {contractor.zip_code}</Text>
        <Text className="text-xl font-semibold mt-1 tracking-wider">Description - {contractor.description}</Text>
      </View>

      {/* Portfolio Section */}
      <View className="mt-10 px-2 w-full">
        <View className="flex-row gap-1 items-center">
          <Text className="font-bold text-xl text-sky-950 tracking-widest">Portfolio</Text>
          <Ionicons name="images" size={30} color="gray" />
        </View>

        {contractor.portfolio.length > 0 ? (
          <FlatList
            data={contractor.portfolio}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} className="w-32 h-32 m-2 rounded-lg" />
            )}
          />
        ) : (
          <Text className="text-gray-500 mt-3">No portfolio images available.</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default ContractorProfile;
