import { View, Text, TouchableOpacity, Platform, Dimensions, SafeAreaView, ImageBackground } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setBreakdownCost } from '../../redux/slice/breakdownCostSlice';

export default function CostDetail() {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const postContentWidth = screenWidth * 0.92;
    const dispatch = useDispatch();
    const { CostDetails } = useLocalSearchParams();

    const costDetails = CostDetails ? JSON.parse(CostDetails) : null;

    if (!costDetails) {
        return (
            <View className="flex-1 bg-gray-100 justify-center items-center">
                <Text className="text-xl text-gray-700">No Cost Details Available</Text>
            </View>
        );
    }

    const detailItems = [
        { label: "Area", value: `${costDetails.area} sqft`, icon: "ruler-combined" },
        { label: "City", value: costDetails.city, icon: "city" },
        { label: "State", value: costDetails.state, icon: "map-marker-alt" },
        { label: "Zip Code", value: costDetails.zip_code, icon: "map-pin" },
        { label: "Unit Price", value: `$${costDetails.unit_price}`, icon: "money-bill-wave" },
        { label: "Total Cost", value: `$${costDetails.total_cost}`, icon: "calculator" },
    ];

    const handleBreakdownCost = () => {
        const breakdownCost = JSON.stringify(costDetails);
        dispatch(setBreakdownCost(breakdownCost));
        router.push(`/BreakdownCost?breakdownCost=${breakdownCost}&screenName=MapScreen`)
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100">

            <LinearGradient
                colors={["#082f49", "transparent"]}
                style={{ height: "40%" }}
            >

                <View className="mt-2">
                    <TouchableOpacity
                        className="absolute top-6 z-10 left-5"
                        onPress={() => router.push("/MapScreen")}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-semibold text-white mb-4 py-4 text-center">
                        Cost Details
                    </Text>
                </View>

            </LinearGradient>

            <View
                className="flex-1 rounded-3xl bg-white"
                style={{
                    marginTop: -screenHeight * 0.25,
                    width: postContentWidth,
                    marginHorizontal: (screenWidth - postContentWidth) / 2,
                    overflow:'hidden'
                }}
            >
                <ImageBackground
                    style={{ backgroundColor: 'black' }}
                    source={require('../../assets/images/userImages/costDetail.png')}
                    className="flex-1 shadow-lg">
                    <View className="p-6 ">

                        {detailItems.map((item, index) => (
                            <View key={index} className="flex-row items-center mb-4 p-2 rounded-2xl bg-black/50">
                                <View
                                    className="justify-center items-center bg-white"
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        marginRight: 12,
                                        borderRadius: 20,
                                        borderWidth: 2,
                                        borderColor: 'white',
                                    }}
                                >
                                    <FontAwesome5
                                        name={item.icon}
                                        size={20}
                                        color="#082f49"
                                    />
                                </View>
                                <View>
                                    <Text className="text-white font-semibold">{item.label}:</Text>
                                    <Text
                                        className={`text-lg ${item.label.includes("Cost") ? "text-red-600" : "text-gray-100"}`}
                                        style={{ fontWeight: item.label.includes("Cost") ? 'bold' : 'normal' }}
                                    >
                                        {item.value}
                                    </Text>
                                </View>


                            </View>

                        ))}
                        <TouchableOpacity
                            onPress={handleBreakdownCost}
                            className="bg-black/50 mt-10 rounded-lg py-3 px-6 flex-row justify-center items-center border border-white">
                            <Text className="text-white font-semibold">Cost Breakdown</Text>
                            <Ionicons name="arrow-forward" size={26} color="white" style={{ marginLeft: 20 }} />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </View>
        </SafeAreaView>
    );
}
