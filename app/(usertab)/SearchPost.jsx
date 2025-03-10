import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { useSelector } from "react-redux";
import { API } from '../../config/apiConfig';

const BASE_URL = "https://g32.iamdeveloper.in/public/"; 

const SearchPost = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noCityFound, setNoCityFound] = useState(""); 

  const token = useSelector((state) => state.auth.token);

  const handleSearch = async () => {
    setLoading(true);
    setNoCityFound(""); // Reset error message on new search
    try {
      const response = await API.get(`job-posts/${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = response.data;
      if (data && data.data) {
        setResults(data.data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response) {
        setNoCityFound("No results found for this ID.");
      } else {
        setNoCityFound("Something went wrong. Please try again.");
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderPost = ({ item }) => (
    <View className="bg-white mb-4 rounded-lg shadow-sm p-4">
      <Text className="text-gray-900 text-lg font-bold mb-2">Project Type: {item.project_type}</Text>
      <Text className="text-gray-600 mb-1">City: {item.city}</Text>
      <Text className="text-gray-600 mb-1">Zipcode: {item.zipcode}</Text>
      <Text className="text-gray-600 mb-1">Area: {item.area} sq.ft</Text>
      <Text className="text-gray-600 mb-1">Total Cost: ${item.total_cost}</Text>
      <Text className="text-gray-600 mb-1">Number of Days: {item.number_of_days}</Text>

      {/* Render floor maps images */}
      {item.floor_maps_image && JSON.parse(item.floor_maps_image).length > 0 && (
      <FlatList
        data={JSON.parse(item.floor_maps_image)}
        horizontal
        keyExtractor={(image, index) => index.toString()}
        renderItem={({ item: image }) => {
          const imageUrl = `${BASE_URL}${image}`;
          // console.log("Floor Map Image URL:", imageUrl);
          return (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 150, height: 150, marginRight: 10, borderRadius: 10, borderWidth: 2 }}
            />
          );
        }}
      />
    )}

      {/* Render design images */}
      {item.design_image && JSON.parse(item.design_image).length > 0 && (
        <FlatList
          data={JSON.parse(item.design_image)}
          horizontal
          keyExtractor={(image, index) => index.toString()}
          renderItem={({ item: image }) => (
            <Image
              source={{ uri: `${BASE_URL}${image}` }}
              style={{ width: 150, height: 150, marginRight: 10, borderRadius: 10 }}
              resizeMode="cover"
            />
          )}
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="text-gray-700 mt-4 text-lg">Searching...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 px-5 pt-16">
      <Text className="text-3xl font-bold text-gray-900 text-center">Search Property Post</Text>

      <View className="mt-8 flex-row items-center bg-white rounded-full p-3 shadow-md">
        <Icon name="search" size={24} color="#4A4A4A" />
        <TextInput
          className="flex-1 ml-3 text-gray-900"
          placeholder="Enter User ID to Search Posts..."
          placeholderTextColor="#A3A3A3"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-full"
          onPress={handleSearch}
        >
          <Text className="text-white font-medium">Search</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        className="mt-8"
        renderItem={renderPost}
        ListEmptyComponent={
          <View className="items-center mt-5">
            <Text className="text-gray-500">{noCityFound || "No job posts found for this ID"}</Text>
          </View>
        }
      />
    </View>
  );
};

export default SearchPost;
