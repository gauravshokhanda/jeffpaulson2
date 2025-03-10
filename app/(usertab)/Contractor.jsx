import React, { useEffect, useState } from "react";
import { FlatList, View, Text, TouchableOpacity, Image, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";

const ContractorList = () => {
    const { contractors } = useLocalSearchParams();
    const [contractorList, setContractorList] = useState([]);


    useEffect(() => {
        if (contractors) {
            const decodedContractors = JSON.parse(decodeURIComponent(contractors));
            setContractorList(decodedContractors);
        }
    }, [contractors]);

    const renderContractor = ({ item }) => (
        <View className="mx-4">
            <View className="bg-white rounded-xl shadow-md p-5 mt-8 border border-gray-200">
                <View className="flex-row items-center justify-between">
                    <Image
                        source={{ uri: `https://g32.iamdeveloper.in/public/${item.image}` }}
                        className="w-14 h-14 rounded-full border-2 border-gray-600"
                    />
                    <Text className="text-xl font-bold text-gray-800">{item.name}</Text>
                    <TouchableOpacity className={`bg-sky-900 px-5  rounded-full `}>
                        <Text className={`text-white text-lg font-medium p-1`}>Choose</Text>
                    </TouchableOpacity>
                </View>

                <View className="mt-4">
                    <View className="flex-row items-center space-x-2">
                        <Text className="font-bold text-gray-700 mr-1 text-sm">Email:</Text>
                        <Text className="text-gray-600 text-sm">{item.email}</Text>
                    </View>

                    <View className="flex-row items-center space-x-2 mt-2">
                        <Text className="font-bold text-gray-700 text-sm">Address:</Text>
                        <Text className="text-gray-600 text-sm">{item.address}</Text>
                    </View>

                    <View className="flex-row items-center space-x-2 mt-2">
                        <Text className="font-bold text-gray-700 text-sm">Location:</Text>
                        <Text className="text-gray-600 text-sm">{item.location}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100">
            <View className="bg-sky-950 pt-8 pb-3">
                <Text className={`text-white ml-3 text-2xl font-bold ${Platform.OS === 'ios' ? 'py-4' : 'py-2'}`}>Choose Contractor</Text>
            </View>

            <FlatList
                data={contractorList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderContractor}
                showsVerticalScrollIndicator={false}
            />
            
        </View>
    );
};

export default ContractorList;
