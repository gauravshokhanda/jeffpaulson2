import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import { API, baseUrl } from "../../config/apiConfig";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const PropertyPost = () => {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const postContentWidth = screenWidth * 0.92;

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
    const fetchPost = async () => {
      try {
        const response = await API.get(`job-post/listing/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const responseData = response.data.data;

        const newdesignImages = JSON.parse(responseData.design_image);
        const newFloorMapImage = JSON.parse(responseData.floor_maps_image);

        if (responseData) {
          setForm((prevForm) => ({
            ...prevForm,
            numberOfDays: responseData.number_of_days?.toString() || 5,
            totalCost: responseData.total_cost || "",
            zipCode: responseData?.zipcode || "",
            area: responseData?.area || "",
            city: responseData?.city || "",
            projectType: responseData?.project_type || "",
            designImages: newdesignImages || [],
            floorMapImages: newFloorMapImage || [],
            description: responseData.description,
          }));
        }

        // const getImages=newdesignImages.map((items)=>{
        //     return `${baseUrl}${items}`
        // })
        // console.log("getImages",getImages)

        //    const imageData= form.designImages.map((items)=>{
        //         return items;
        //     })
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchPost();
  }, [id]);

  const handleImagePick = async (field) => {
    let result = await DocumentPicker.getDocumentAsync({
      type: ["image/*"],
      multiple: true,
      copyToCacheDirectory: true,
    });

    console.log("result", result);

    if (!result.canceled && result.assets?.length > 0) {
      setForm((prevForm) => ({
        ...prevForm,
        [field]: [
          ...(prevForm[field] || []),
          ...result.assets.map((asset) => asset.uri),
        ], // Append new images
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
    const formData = new FormData();
    formData.append("number_of_days", parseInt(form.numberOfDays, 10));
    formData.append("total_cost", form.totalCost);
    formData.append("zipcode", form.zipCode);
    formData.append("area", form.area);
    formData.append("city", form.city);
    formData.append("project_type", form.projectType);
    formData.append("description", form.description);

    form.floorMapImages.forEach((uri, index) => {
      formData.append("floor_maps_image[]", {
        uri: uri,
        type: "image/jpeg",
        name: `floor_map_image_${index}.jpg`,
      });
    });

    form.designImages.forEach((uri, index) => {
      formData.append("design_image[]", {
        uri: uri,
        type: "image/jpeg",
        name: `design_image_${index}.jpg`,
      });
    });

    // console.log("Form Data:", formData);
    if (formData.has("floor_maps_image[]")) {
      console.log(formData.getAll("floor_maps_image[]"));
    } else {
      console.log("No floor_maps_image[] found in FormData");
    }

    setLoading(true);

    try {
      const response = await API.post(`job-post/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // console.log("response job post data", response.data);

      Alert.alert(
        "Success",
        "Your job application has been Updated successfully!",
        [
          {
            text: "Ok",
            onPress: () => {
              router.replace("/MyPosts");
            },
          },
        ]
      );

      // Reset form after successful submission
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
        Alert.alert("Error:", error.response.data);
      } else {
        console.log("Error:", error.message);
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
    router.replace("MyPosts");
  };
  return (
    <ScrollView>
      <LinearGradient
        colors={["#082f49", "transparent"]}
        style={{ height: screenHeight * 0.4 }}
      ></LinearGradient>
      <View
        className="p-4 pt-8 bg-white"
        style={{
          marginTop: -screenHeight * 0.3,
          width: postContentWidth,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,

          marginHorizontal: (screenWidth - postContentWidth) / 2,
          overflow: "hidden",
        }}
      >
        <View className="flex-row mb-6 space-x-4">
          <View className="flex-1">
            <Text className="pl-4 pb-2 text-gray-600">Number of Days</Text>
            <TextInput
              className="bg-white p-4 rounded-2xl text-sky-800 mx-1"
              placeholder="Enter number of days"
              keyboardType="numeric"
              value={form.numberOfDays}
              onChangeText={(text) => handleInputChange("numberOfDays", text)}
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
              value={form.totalCost}
              style={{
                elevation: 15,
                shadowColor: "#082f49",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
              }}
              onChangeText={(text) => handleInputChange("totalCost", text)}
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
              value={form.zipCode}
              style={{
                elevation: 15,
                shadowColor: "#082f49",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
              }}
              onChangeText={(text) => handleInputChange("zipCode", text)}
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
              value={form.area}
              onChangeText={(text) => handleInputChange("area", text)}
            />
          </View>
        </View>

        <View className="flex-row mb-6 space-x-4">
          <View className="flex-1">
            <Text className="pl-4 pb-2 text-gray-600">City</Text>

            <TextInput
              className="bg-white p-4 rounded-2xl shadow-lg text-sky-800 mx-1"
              placeholder="Enter city"
              value={form.city}
              style={{
                elevation: 15,
                shadowColor: "#082f49",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
              }}
              onChangeText={(text) => handleInputChange("city", text)}
            />
          </View>

          <View className="flex-1">
            <Text className="pl-4 pb-2 text-gray-600">Project type</Text>

            <TextInput
              className="bg-white p-4 rounded-2xl shadow-lg text-sky-800 mx-1"
              placeholder="Enter project type"
              value={form.projectType}
              style={{
                elevation: 15,
                shadowColor: "#082f49",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
              }}
              onChangeText={(text) => handleInputChange("projectType", text)}
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
            onChangeText={(text) => handleInputChange("description", text)}
          />
        </View>
        <View className="mb-6">
          {form.designImages.length === 0 && (
            <TouchableOpacity
              className="bg-white p-4 rounded-2xl shadow-lg flex items-center justify-center"
              onPress={() => handleImagePick("designImages")}
            >
              <Text className="text-sky-500">Upload Design Images</Text>
            </TouchableOpacity>
          )}
          <View className="flex-row flex-wrap m-3 ">
            {form.designImages.length > 0 && (
              <View>
                <Text className="ml-4 text-gray-600">Update Design Images</Text>
                <View className="border-dashed border-2 border-gray-400 p-2 rounded-lg mt-3 bg-white">
                  <View className="flex-row items-center flex-wrap mt-2">
                    {form.designImages.map((uri, index) => (
                      <View key={index} className="relative w-24 h-24 m-1">
                        <Image
                          source={{
                            uri: uri.startsWith("file")
                              ? uri
                              : `${baseUrl}${uri}`,
                          }}
                          className="w-full h-full rounded-2xl"
                        />
                        <TouchableOpacity
                          onPress={() => removeImage("designImages", index)}
                          className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
                        >
                          <Ionicons name="close" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity
                      onPress={() => handleImagePick("designImages")}
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

        {/* Floor Map Images Upload */}
        <View className="mb-6">
          {form.floorMapImages.length === 0 && (
            <TouchableOpacity
              className="bg-white p-4 rounded-2xl shadow-lg flex items-center justify-center"
              onPress={() => handleImagePick("floorMapImages")}
            >
              <Text className="text-sky-500">Upload Floor Map Images</Text>
            </TouchableOpacity>
          )}
          <View className="">
            <View className="flex-row flex-wrap m-3">
              {form.floorMapImages.length > 0 && (
                <View>
                  <Text className="text-gray-600 ml-5">
                    {" "}
                    Update Floor Map Images
                  </Text>
                  <View className="border-dashed border-2 border-gray-400 p-2 rounded-lg mt-3 bg-white">
                    <View className="flex-row items-center flex-wrap mt-2">
                      {form.floorMapImages.map((uri, index) => (
                        <View key={index} className="relative w-24 h-24 m-1">
                          <Image
                            source={{
                              uri: uri.startsWith("file")
                                ? uri
                                : `${baseUrl}${uri}`,
                            }}
                            className="w-full h-full rounded-2xl"
                          />
                          <TouchableOpacity
                            onPress={() => removeImage("floorMapImages", index)}
                            className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
                          >
                            <Ionicons name="close" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      ))}

                      <TouchableOpacity
                        onPress={() => handleImagePick("floorMapImages")}
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
          className="bg-sky-950 p-2 rounded-2xl shadow-lg flex items-center w-[50%] text-center ml-[22%]"
          style={{
            elevation: 15,
            shadowColor: "#082f49",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
          }}
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold text-lg">
            Submit Application
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PropertyPost;
