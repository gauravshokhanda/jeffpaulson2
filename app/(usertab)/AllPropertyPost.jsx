import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, TextInput, Platform } from "react-native";
import { useSelector } from "react-redux";
import { API, baseUrl } from "../../config/apiConfig";
import moment from "moment";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

const ContractorScreen = () => {
    const token = useSelector((state) => state.auth.token);
    const [contractors, setContractors] = useState([]);

    useEffect(() => {
        const fetchContractors = async () => {
            try {
                const response = await API.get("contractors/listing", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const formattedData = response.data.data.map((item) => ({
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

                setContractors(formattedData);
            } catch (error) {
                console.error("Error fetching contractors:", error);
            }
        };

        fetchContractors();
    }, []);

    const renderContractor = ({ item }) => (
        <View className="bg-white shadow-lg rounded-2xl mb-4 overflow-hidden">
            {/* Banner Section */}
            <View className="relative">
                <Image source={item.banner} className="w-full h-24" resizeMode="cover" />
                <View className="absolute bottom-0 left-4 flex-row items-center">
                    <Image source={item.image} className="w-16 h-16 rounded-full border-2 border-white" />
                    <View className="ml-4">
                        <Text className="text-lg font-bold text-white">{item.name}</Text>
                        <Text className="text-white text-sm">{item.company}</Text>
                    </View>
                </View>
            </View>

            {/* Contact Details */}
            <View className="p-4">
                <View className="flex-row items-center mb-1">
                    <Text className="font-semibold text-gray-700">Email: </Text>
                    <Text className="text-gray-600">{item.email}</Text>
                </View>
                <View className="flex-row items-center mb-1">
                    <Text className="font-semibold text-gray-700">Phone: </Text>
                    <Text className="text-gray-600">{item.contactNumber}</Text>
                </View>
                <View className="flex-row items-center mb-1">
                    <Text className="font-semibold text-gray-700">City: </Text>
                    <Text className="text-gray-600">{item.city}</Text>
                </View>
                <View className="flex-row items-center mb-2">
                    <Text className="font-semibold text-gray-700">Address: </Text>
                    <Text className="text-gray-600">{item.address}</Text>
                </View>
            </View>

            {/* Contact Icons */}
            <View className="flex-row justify-between items-center px-4 pb-4">
                <TouchableOpacity onPress={() => router.push(`/ChatScreen?id=${item.id}`)}>
                    <Ionicons name="mail-outline" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push(`/ChatScreen?id=${item.id}`)}>
                    <Ionicons name="call-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 ">
            {/* Search Bar */}
            <View className={`bg-sky-950 flex-row justify-center items-center gap-1 px-8 p-4 ${Platform.OS === 'ios' ? 'mt-16' : ''}`}>
            <Ionicons name="arrow-back" size={25} color="white" />
                <View className="flex-row items-center bg-white rounded-full px-4 py-2">
                    <Ionicons name="search" size={20} color="black" />
                    <TextInput className="flex-1 ml-2 p-2 text-black" placeholder="Search" placeholderTextColor="#000000" />
                </View>
            </View>

            {/* Contractor List */}
            <FlatList
                data={contractors}
                renderItem={renderContractor}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 10 }}
            />
        </View>
    );
};

export default ContractorScreen;
