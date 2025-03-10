import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { FlashList } from '@shopify/flash-list';
import debounce from 'lodash.debounce';
import API from '../config/apiConfig';
import { useSelector } from "react-redux";
import axios from 'axios';


export default function AddPortfolioModal({ visible, onClose, setPortfolioData, addPortfolioItem }) {
  const [projectName, setProjectName] = useState('');
  const [cityName, setCityName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreCities, setHasMoreCities] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
      if (!visible) {
          setProjectName('');
          setCityName('');
          setAddress('');
          setDescription('');
          setSelectedImages([]);
      }
  }, [visible]);


  const handleCitySearch = useCallback(
      debounce(async (query, currentPage = 1) => {
          if (!query) return;
          setSearchLoading(true);

          try {
              const response = await axios.post(
                  `https://g32.iamdeveloper.in/api/citie-search?page=${currentPage}`,
                  { city: query },
                  {
                      headers: { Authorization: `Bearer ${token}` },
                  }
              );
              console.log("city response", response)
              const cityData = response.data.data.map((city) => ({
                  key: city.id.toString(),
                  label: city.city,
                  zip: city.pincode,
              }));

              if (currentPage === 1) {
                  setCities(cityData);
              } else {
                  setCities((prevCities) => [...prevCities, ...cityData]);
              }

              setHasMoreCities(currentPage < response.data.pagination.last_page);
          } catch (error) {
              console.log('City search error:', error);
              Alert.alert('Error', error.response?.data?.message || 'An unknown error occurred.');
          } finally {
              setSearchLoading(false);
              setLoadingMore(false);
          }
      }, 500),
      [token]
  );

  const loadMoreCities = () => {
      if (!hasMoreCities || loadingMore) return;
      setLoadingMore(true);
      setPage((prevPage) => {
          handleCitySearch(cityName, prevPage + 1);
          return prevPage + 1;
      });
  };

  const pickImage = async () => {
      let result = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });

      if (!result.canceled) {
          const compressedImage = await ImageManipulator.manipulateAsync(
              result.assets[0].uri,
              [{ resize: { width: 800 } }],
              { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );

          setSelectedImages([...selectedImages, compressedImage.uri]);
      }
  };

  const handleUpload = () => {
      const newData = {
          projectName,
          cityName,
          address,
          description,
          selectedImages,
      };
      // setPortfolioData(newData); 
      addPortfolioItem(newData); // Pass the updated data directly
      onClose();
  };

  return (
      <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
          <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white p-6 rounded-2xl w-[80%]">
                  <TouchableOpacity className="absolute top-3 right-3" onPress={onClose}>
                      <Ionicons name="close" size={24} color="black" />
                  </TouchableOpacity>
                  <Text className="text-gray-700 text-lg font-bold mb-4">Upload Portfolio</Text>

                  <Text className="text-gray-600 mb-2">Project Name</Text>
                  <TextInput
                      className="border border-gray-400 rounded-lg p-3 bg-white"
                      placeholder="Enter Project Name"
                      placeholderTextColor="gray"
                      value={projectName}
                      onChangeText={setProjectName}
                  />

                  <Text className="text-gray-600 mt-4 mb-2">City Name</Text>
                  <TextInput
                      className="border border-gray-400 rounded-lg p-3 bg-white"
                      placeholder="Enter City Name"
                      placeholderTextColor="gray"
                      value={cityName}
                      onChangeText={(text) => {
                          setCityName(text);
                          setPage(1);
                          handleCitySearch(text, 1);
                      }}
                  />

                  {searchLoading && <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 5 }} />}

                  {cities.length > 0 && (
                      <View className="h-40 w-full bg-white border border-gray-300 rounded-lg mt-2">
                          <FlashList
                              data={cities}
                              keyExtractor={(item) => item.key}
                              renderItem={({ item }) => (
                                  <TouchableOpacity
                                      onPress={() => {
                                          setCityName(item.label);
                                          setCities([]);
                                      }}
                                      className="p-4 border-b border-gray-400 bg-gray-100"
                                  >
                                      <Text>{item.label}</Text>
                                  </TouchableOpacity>
                              )}
                              estimatedItemSize={50}
                              className="flex-1"
                              ListFooterComponent={
                                  hasMoreCities && (
                                      <TouchableOpacity
                                          onPress={loadMoreCities}
                                          className="bg-blue-600 p-2 rounded-lg mt-2"
                                      >
                                          <Text className="text-white text-center">Load More</Text>
                                      </TouchableOpacity>
                                  )
                              }
                          />
                      </View>
                  )}

                  <Text className="text-gray-600 mt-4 mb-2">Address</Text>
                  <TextInput
                      className="border border-gray-400 rounded-lg p-3 bg-white"
                      placeholder="Enter Address"
                      placeholderTextColor="gray"
                      value={address}
                      onChangeText={setAddress}
                  />

                  <Text className="text-gray-600 mt-4 mb-2">Description</Text>
                  <TextInput
                      className="border border-gray-400 rounded-lg p-3 bg-white"
                      placeholder="Enter Description"
                      placeholderTextColor="gray"
                      value={description}
                      onChangeText={setDescription}
                  />

                  <Text className="text-gray-600 mt-4 mb-2">Add Images</Text>
                  <TouchableOpacity onPress={pickImage} className="bg-gray-200 rounded-xl p-6 items-center justify-center w-[60%]">
                      <Text>Select Images</Text>
                  </TouchableOpacity>

                  <ScrollView horizontal className="mt-4">
                      {selectedImages.map((uri, index) => (
                          <View key={index} className="relative mx-2">
                              <Image source={{ uri }} className="w-20 h-20 rounded-lg" />
                          </View>
                      ))}
                  </ScrollView>

                  <TouchableOpacity className="bg-sky-950 mt-6 rounded-2xl p-3" onPress={handleUpload}>
                      <Text className="text-white text-center">Upload</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
  );
}
