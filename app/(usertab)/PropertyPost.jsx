import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, BackHandler, Dimensions, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from "react-redux";
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { router, useFocusEffect } from 'expo-router';
import { API } from '../../config/apiConfig';
import { LinearGradient } from 'expo-linear-gradient';





const PropertyPost = () => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const postContentWidth = screenWidth * 0.92;
    const [loading, setLoading] = useState(false);
    const costData = useSelector((state) => state.breakdownCost);
    // console.log("breakdownCostDetail",breakdownCostDetail)
    const token = useSelector((state) => state.auth.token);

    const breakdownCostDetail = JSON.parse(costData.breakdownCost);
    // console.log(breakdownCostDetail)
    // console.log("area parsed", breakdownCostDetail.area)
    const [form, setForm] = useState({
        numberOfDays: "",
        totalCost: "",
        zipCode: "",
        area: "",
        city: "",
        projectType: "",
        designImages: [],
        floorMapImages: [],
        description: "",
    });


    useEffect(() => {
        // console.log("breakdownCostDetail changed", breakdownCostDetail);
        // console.log("new data", breakdownCostDetail.area)

        if (breakdownCostDetail && breakdownCostDetail.days) {
            setForm((prevForm) => ({
                ...prevForm,
                numberOfDays: breakdownCostDetail?.days?.estimated_time?.toString() || "",
                totalCost: breakdownCostDetail?.total_cost?.toString() || "",
                zipCode: breakdownCostDetail?.zip_code || "",
                area: breakdownCostDetail?.area || "",
                city: breakdownCostDetail?.city || "",
                projectType: breakdownCostDetail?.days?.project_type || "",
                floorMapImages: [],
            }));
        }
    }, [costData]);





    const handleImagePick = async (field) => {
        let result = await DocumentPicker.getDocumentAsync({
            type: ["image/*"],
            multiple: true,
            copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets?.length > 0) {
            setForm((prevForm) => ({
                ...prevForm,
                [field]: [...prevForm[field], ...result.assets.map(asset => asset.uri)],
            }));
        }
    };

    const removeImage = (field, index) => {
        setForm((prevForm) => ({
            ...prevForm,
            [field]: prevForm[field].filter((_, i) => i !== index),
        }));
    };

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleSubmit = async () => {
        if (!form.numberOfDays.trim()) return Alert.alert("Error", "Number of days is required!");
        if (!form.totalCost.trim()) return Alert.alert("Error", "Total cost is required!");
        if (!form.zipCode.trim()) return Alert.alert("Error", "Zip code is required!");
        if (!form.area.trim()) return Alert.alert("Error", "Area is required!");
        if (!form.city.trim()) return Alert.alert("Error", "City is required!");
        if (!form.projectType.trim()) return Alert.alert("Error", "Project type is required!");
        if (!form.description.trim()) return Alert.alert("Error", "Description is required!");
        if (form.floorMapImages.length === 0) return Alert.alert("Error", "At least one floor map image is required!");
        if (form.designImages.length === 0) return Alert.alert("Error", "At least one design image is required!");
    
        const formData = new FormData();
        formData.append('number_of_days', form.numberOfDays);
        formData.append('total_cost', form.totalCost);
        formData.append('zipcode', form.zipCode);
        formData.append('area', form.area);
        formData.append('city', form.city);
        formData.append('project_type', form.projectType);
        formData.append('description', form.description);

        // ✅ Correct way to append multiple images
        form.floorMapImages.forEach((uri, index) => {
            console.log("add floormap images", uri)
            formData.append('floor_maps_image[]', {
                uri: uri,
                type: 'image/jpeg',  // Ensure correct type
                name: `floor_map_${index}.jpg`
            });
        });

        form.designImages.forEach((uri, index) => {
            formData.append('design_image[]', {
                uri: uri,
                type: 'image/jpeg',
                name: `design_image_${index}.jpg`
            });
        });

        // console.log("Form Data:", formData);

        setLoading(true);

        try {
            const response = await axios.post('https://g32.iamdeveloper.in/api/job-post', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                    Accept: 'application/json',
                },
            });

            // console.log("Response:", response.data);

            Alert.alert("Success", "Your job application has been posted successfully!", [
                { text: "Ok", onPress: () => router.replace("/") }
            ]);

            setForm({
                numberOfDays: "",
                totalCost: "",
                zipCode: "",
                area: "",
                city: "",
                projectType: "",
                designImages: [],
                floorMapImages: [],
                description: "",
            });

        } catch (error) {
            if (error.response) {
                Alert.alert('Error:', error.response.data.message || "Something went wrong!");
            } else {
                console.log('Error:', error.message);
            }
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }


    const handleBackPress = () => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to leave this page?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", onPress: () => router.push('BreakdownCost') }
            ]
        );
    };



    return (
        <SafeAreaView className="flex-1 bg-gray-200">

            {/* <LinearGradient
                colors={['#082f49', 'transparent']}
                style={{ height: screenHeight * 0.4 }}
            >
                <View className="flex-row items-center p-5">
                    <TouchableOpacity onPress={handleBackPress}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-extrabold text-white ml-10">Property Post</Text>
                </View>

            </LinearGradient> */}

            <LinearGradient
                colors={["#082f49", "transparent"]}
                style={{ height: "40%" }}
            >

                <View className="mt-2">
                    <TouchableOpacity
                        className="absolute top-6 z-10 left-5"
                        onPress={handleBackPress}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-semibold text-white mb-4 py-4 text-center">
                        Property Post
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
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
                >
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* <TouchableOpacity className="absolute top-4 left-3 z-10">
                            <Ionicons
                                name="arrow-back" size={25} color="white"
                                onPress={handleBackPress}
                            />
                        </TouchableOpacity>
                        <Text className="text-3xl font-extrabold text-center mb-6 bg-sky-950 text-white p-3">Property Post</Text> */}

                        <View className="p-4">
                            <View className="flex-row mb-6 space-x-4">
                                <View className="flex-1">
                                    <Text className="pl-4 pb-2 text-gray-600">Number of Days</Text>
                                    <TextInput
                                        className="bg-white p-4 rounded-2xl text-sky-800 mx-1"
                                        placeholder="Enter number of days"
                                        keyboardType="numeric"
                                        editable={false}
                                        value={form.numberOfDays}
                                        onChangeText={(text) => handleInputChange('numberOfDays', text)}
                                        style={{
                                            elevation: 15,
                                            shadowColor: "#082f49",
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 2,
                                        }}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="pl-4 pb-2 text-gray-600">Total cost</Text>

                                    <TextInput
                                        className="bg-white p-4 rounded-2xl shadow-lg text-sky-800 mx-1"
                                        placeholder="Enter total cost"
                                        keyboardType="numeric"
                                        editable={false}
                                        value={form.totalCost}
                                        style={{
                                            elevation: 15,
                                            shadowColor: "#082f49",
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 2,
                                        }}
                                        onChangeText={(text) => handleInputChange('totalCost', text)}
                                    />
                                </View>
                            </View>

                            <View className="flex-row mb-6 space-x-4">
                                <View className="flex-1">
                                    <Text className="pl-4 pb-2 text-gray-600">Zip code</Text>

                                    <TextInput
                                        className="bg-white p-4 rounded-2xl shadow-lg text-sky-800 mx-1"
                                        placeholder="Enter zip code"
                                        keyboardType="numeric"
                                        editable={false}
                                        value={form.zipCode}
                                        style={{
                                            elevation: 15,
                                            shadowColor: "#082f49",
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 2,
                                        }}
                                        onChangeText={(text) => handleInputChange('zipCode', text)}
                                    />
                                </View>

                                <View className="flex-1">
                                    <Text className="pl-4 pb-2 text-gray-600">Area </Text>

                                    <TextInput
                                        style={{
                                            elevation: 15,
                                            shadowColor: "#082f49",
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 2,
                                        }}
                                        className="bg-white p-4 rounded-2xl shadow-lg text-sky-800 mx-1"
                                        placeholder="Enter area"
                                        keyboardType='numeric'
                                        editable={false}
                                        value={form.area}
                                        onChangeText={(text) => handleInputChange('area', text)}
                                    />
                                </View>
                            </View>

                            <View className="flex-row mb-6 space-x-4">
                                <View className="flex-1">
                                    <Text className="pl-4 pb-2 text-gray-600">City</Text>

                                    <TextInput
                                        className="bg-white p-4 rounded-2xl shadow-lg text-sky-800 mx-1"
                                        placeholder="Enter city"
                                        editable={false}
                                        value={form.city}
                                        style={{
                                            elevation: 15,
                                            shadowColor: "#082f49",
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 2,
                                        }}
                                        onChangeText={(text) => handleInputChange('city', text)}
                                    />
                                </View>

                                <View className="flex-1">
                                    <Text className="pl-4 pb-2 text-gray-600">Project type</Text>

                                    <TextInput
                                        className="bg-white p-4 rounded-2xl shadow-lg text-sky-800 mx-1"
                                        placeholder="Enter project type"
                                        value={form.projectType}
                                        editable={false}
                                        style={{
                                            elevation: 15,
                                            shadowColor: "#082f49",
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 2,
                                        }}
                                        onChangeText={(text) => handleInputChange('projectType', text)}
                                    />
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="pl-4 pb-2 text-gray-600">Description</Text>
                                <TextInput
                                    className="bg-white p-4 rounded-2xl shadow-lg text-sky-800 h-40 justify-start align-top"
                                    placeholder="Enter project description"
                                    value={form.description}
                                    multiline
                                    numberOfLines={10}
                                    style={{
                                        elevation: 15,
                                        shadowColor: "#082f49",
                                        shadowOffset: { width: 0, height: 3 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 2,
                                    }}
                                    onChangeText={(text) => handleInputChange('description', text)}
                                />
                            </View>
                            <View className="mb-6">
                                {form.designImages.length === 0 && (
                                    <TouchableOpacity
                                        className="bg-white p-4 rounded-2xl shadow-lg flex items-center justify-center"
                                        onPress={() => handleImagePick('designImages')}
                                    >
                                        <Text className="text-sky-500">Upload Design Images</Text>
                                    </TouchableOpacity>
                                )}
                                <View className="flex-row flex-wrap m-3 ">


                                    {form.designImages.length > 0 && (
                                        <View>
                                            <Text className="ml-4 text-gray-600">Design Images</Text>
                                            <View className="border-dashed border-2 border-gray-400 p-2 rounded-lg mt-3 bg-white">
                                                <View className="flex-row items-center flex-wrap mt-2">
                                                    {form.designImages.map((uri, index) => (
                                                        <View key={index} className="relative w-24 h-24 m-1">
                                                            <Image source={{ uri }} className="w-full h-full rounded-2xl" />
                                                            <TouchableOpacity
                                                                onPress={() => removeImage('designImages', index)}
                                                                className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
                                                            >
                                                                <Ionicons name="close" size={16} color="white" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ))}
                                                    <TouchableOpacity onPress={() => handleImagePick('designImages')} className="w-24 h-24 m-1 flex items-center justify-center bg-gray-200 rounded-2xl">
                                                        <Text className="text-4xl text-gray-600">+</Text>
                                                    </TouchableOpacity>
                                                </View>

                                            </View>

                                        </View>

                                    )}
                                </View>


                            </View>

                            {/* Floor Map Images Upload */}
                            <View className="mb-6">
                                {form.floorMapImages.length === 0 && (
                                    <TouchableOpacity
                                        className="bg-white p-4 rounded-2xl shadow-lg flex items-center justify-center"
                                        onPress={() => handleImagePick('floorMapImages')}
                                    >
                                        <Text className="text-sky-500">Upload Floor Map Images</Text>
                                    </TouchableOpacity>
                                )}
                                <View className="">
                                    <View className="flex-row flex-wrap m-3">
                                        {form.floorMapImages.length > 0 && (
                                            <View>
                                                <Text className="text-gray-600 ml-5">Floor Map Images</Text>
                                                <View className="border-dashed border-2 border-gray-400 p-2 rounded-lg mt-3 bg-white">
                                                    <View className="flex-row items-center flex-wrap mt-2">
                                                        {form.floorMapImages.map((uri, index) => (
                                                            <View key={index} className="relative w-24 h-24 m-1">
                                                                <Image source={{ uri }} className="w-full h-full rounded-2xl" />
                                                                <TouchableOpacity
                                                                    onPress={() => removeImage('floorMapImages', index)}
                                                                    className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
                                                                >
                                                                    <Ionicons name="close" size={16} color="white" />
                                                                </TouchableOpacity>
                                                            </View>
                                                        ))}

                                                        <TouchableOpacity
                                                            onPress={() => handleImagePick('floorMapImages')}
                                                            className="w-24 h-24 m-1 flex items-center justify-center bg-gray-200 rounded-2xl"
                                                        >
                                                            <Text className="text-4xl text-gray-600">+</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                </View>

                            </View>

                            <TouchableOpacity
                                className="bg-sky-950 p-2 rounded-2xl shadow-lg flex items-center text-center justify-center"
                                style={{
                                    elevation: 15,
                                    shadowColor: "#082f49",
                                    shadowOffset: { width: 0, height: 3 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 2,
                                }}
                                onPress={handleSubmit}
                            >
                                <Text className="text-white font-bold text-lg">Submit Application</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
};

export default PropertyPost;
