
import { View, Dimensions, Text, TextInput, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import RadioGroup from "react-native-radio-buttons-group";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomTextInput from "../../components/CustomTextInput"
import CustomDatePicker from "../../components/CustomDatePicker"
import API from "../../config/apiConfig"
import { useSelector, useDispatch } from 'react-redux';
import CitySearch from '../../components/CitySearch';
import axios from 'axios';
import { router } from 'expo-router';
import { setRealStateProperty } from "../../redux/slice/realStatePropertySlice"
import * as DocumentPicker from 'expo-document-picker';




export default function Index() {
  const dispatch = useDispatch();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const postContentWidth = screenWidth * 0.95;
  const [selectedBHK, setSelectedBHK] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const [selectedHomeType, setSelectedHomeType] = useState(null);
  const [images, setImages] = useState([]);

  const [selectedCity, setSelectedCity] = useState(null);


  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [availableFrom, setAvailableFrom] = useState(null);

  const handleImagePick = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: ["image/*"],
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImages((prevImages) => [...prevImages, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };




  const propertyTypes = [
    { id: 'residential', label: 'Residential' },
    { id: 'commercial', label: 'Commercial' },
  ];
  const renderPropertyTypeItem = ({ item }) => {
    const isSelected = selectedPropertyType === item.id;

    return (
      <View className="rounded-lg bg-sky-950 px-4 py-2 overflow-hidden">
        <TouchableOpacity

          onPress={() => setSelectedPropertyType(item.id)}
        >
          
            <Text className={`text-lg font-medium ${isSelected ? "text-white" : "text-gray-400"}`}>
              {item.label}
            </Text>
        </TouchableOpacity>

      </View>

    );
  };

  // Home type
  const homeTypes = [
    {
      id: '1',
      name: 'Apartment',
      image: require('../../assets/images/realState/ApartmentHouse.png'),
    },
    {
      id: '2',
      name: 'Independent Floor',
      image: require('../../assets/images/realState/IndependentFloor.png'),
    },
    {
      id: '3',
      name: 'Independent House',
      image: require('../../assets/images/realState/IndependentHouse.png'),
    },
  ];
  const renderHomeTypeItem = ({ item }) => {
    const isSelected = selectedHomeType === item.name;

    return (
      <TouchableOpacity
      onPress={() => setSelectedHomeType(item.name)}
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: isSelected ? "gray" : "#F3F4F6", // Sky blue when selected, light gray otherwise
        overflow: "hidden",
        marginHorizontal: 8,
        elevation: isSelected ? 5 : 0, // Add shadow when selected
      }}
    >
      {/* Image */}
      <Image source={item.image} style={{ width: 50, height: 50 }} resizeMode="contain" />

      {/* Text */}
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          marginTop: 6,
          textAlign: "center",
          color: isSelected ? "white" : "#374151", // White text when selected, gray otherwise
        }}
      >
        {item.name}
      </Text>
    </TouchableOpacity>

    );
  };

  // nhk render
  const bhkOptions = ["1RK", "1BHK", "2BHK", "3BHK", "4BHK"];
  const renderBHKItem = ({ item }) => {
    const isSelected = selectedBHK === item;
    return (
      <View className="mx-2 rounded-lg overflow-hidden" >
        <TouchableOpacity
        className="bg-gray-500 p-4"
          onPress={() => setSelectedBHK(item)}

        >
            <Text className={`text-lg font-medium ${isSelected ? "text-white" : "text-gray-400"}`}>
              {item}
            </Text>
        </TouchableOpacity>
      </View>
    )
  }

  // furnish type
  const furnishOptions = [
    { id: "fully", label: "Fully Furnished", icon: require('../../assets/images/realState/Fullfurnish.png') },
    { id: "semi", label: "Semi Furnished" },
    { id: "unfurnished", label: "Unfurnished" }
  ];

  // Render each Furnish Type option
  const renderFurnishItem = ({ item }) => {
    const isSelected = selectedType === item.id;
    return (
      <View className="mx-2 rounded-lg overflow-hidden" >

      <TouchableOpacity
        className="bg-gray-400 p-3"
        onPress={() => setSelectedType(item.id)}
      >
         
          <Text className={`text-lg ${isSelected ? "text-white" : "text-gray-900"}`}>
            {item.label}
          </Text>
      </TouchableOpacity>
      </View>
    );
  };


  // handle submit
  const token = useSelector((state) => state.auth.token);
  const handleSubmit = async () => {
    console.log("handle submit function")
    const formData = new FormData();
    formData.append("property_type", selectedPropertyType);
    formData.append("city", city);
    formData.append("house_type", selectedHomeType);
    formData.append("address", address);
    formData.append("locale", locality);
    formData.append("bhk", selectedBHK);
    formData.append("area", area);
    formData.append("furnish_type", selectedType);
    formData.append("price", price);
    formData.append("available_from", availableFrom.toISOString());
    images.forEach((uri, index) => {
      console.log("add floormap images", uri)
      formData.append('property_images[ ]', {
        uri: uri,
        type: 'image/jpeg',
        name: `property_image_${index}_${Date.now()}.jpg`
      });
    });

    console.log("form data", formData)
    dispatch(
      setRealStateProperty({
        property_type: selectedPropertyType,
        city,
        house_type: selectedHomeType,
        address,
        locale: locality,
        bhk: selectedBHK,
        area,
        furnish_type: selectedType,
        price,
        available_from: availableFrom.toISOString(),
      })
    );

    try {
      const response = await axios.post("https://g32.iamdeveloper.in/api/realstate-property", formData, {
        headers:
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",

        },
      })
      // console.log("response", response.data.message)

      Alert.alert(
        "Success",
        response.data.message,
        [
          {
            text: "OK",
            onPress: () => {
              setSelectedPropertyType("");
              setCity("");
              setSelectedHomeType("");
              setAddress("");
              setLocality("");
              setSelectedBHK("");
              setArea("");
              setSelectedType("");
              setPrice("");
              setAvailableFrom("");
              setImages(null)
              // router.replace("/");
            },
          },
        ],
        { cancelable: false }
      );


    } catch (error) {
      console.log(error, "error")
    }

  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <LinearGradient
        colors={['#082f49', 'transparent']}
        style={{ height: screenHeight * 0.4 }}
      >
        <View className="p-5">
          <Text className="text-3xl font-bold text-center text-white">Property Post</Text>
        </View>

      </LinearGradient>

      <View className="rounded-3xl border border-gray-400"
        style={{
          position: 'absolute',
          top: screenHeight * 0.12,
          width: postContentWidth,
          height: screenHeight * 0.80,
          left: (screenWidth - postContentWidth) / 2,
          backgroundColor: 'white',
          marginBottom: 10,
        }}
      >

        <KeyboardAvoidingView
          className="flex-1 m-4"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >


            <View className="flex-1">

              <View className="mb-8">
                <Text className="text-xl font-medium mb-3 tracking-widest">Property Type</Text>

                <FlatList
                  data={propertyTypes}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderPropertyTypeItem}
                  contentContainerStyle={{ gap: 10 }}
                />

                <View className="flex-row items-center border-b border-gray-300 mt-5">
                  <CitySearch city={city} setCity={setCity} />
                  {/* <Ionicons name="search" size={18} color="black" />
                                     <TextInput
                                        value={city}
                                        onChangeText={(text) => setCity(text)}
                                        placeholder="Search City"
                                        placeholderTextColor="gray"
                                        className="flex-1 text-lg text-gray-800 ml-5"
                                    />
                                    //  <MaterialCommunityIcons name="crosshairs-gps" size={25} color="#0C4A6E" />  */}
                </View>

                {/* House Type */}
                <View className="mt-10">
                  <Text className="text-xl font-medium mb-3 tracking-widest">House Type</Text>
                  <FlatList
                    data={homeTypes}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    renderItem={renderHomeTypeItem}
                  />
                </View>



                <View className="mt-5">
                  <CustomTextInput
                    placeholder="Building/Project/Society(Optional)"
                    value={address}
                    onChangeText={setAddress}
                  />
                  <CustomTextInput
                    placeholder="Enter Locality"
                    value={locality}
                    onChangeText={setLocality}
                  />
                  <CustomTextInput
                    value={price}
                    onChangeText={setPrice}
                    placeholder="Price" />
                  <CustomTextInput
                    placeholder="Built Up Area"
                    value={area}
                    onChangeText={setArea}
                  />

                </View>


                {/* BHK */}
                <View className="my-10">
                  <Text className="text-lg font-medium mb-3 tracking-widest">BHK</Text>
                  <FlatList
                    data={bhkOptions}
                    keyExtractor={(item) => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 5 }}
                    renderItem={renderBHKItem}
                  />
                </View>


                <View className="mb-10">
                  <Text className="text-lg font-medium mb-4">Furnish Type</Text>

                  {/* Horizontal Scrollable FlatList */}
                  <FlatList
                    data={furnishOptions}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    renderItem={renderFurnishItem}
                  />
                </View>
              
                <View>
                  <CustomDatePicker
                    label="Available From"
                    value={availableFrom}
                    onChangeDate={setAvailableFrom}
                  />
                </View>

                <View className="mt-10">
                  {images.length === 0 && (
                    <TouchableOpacity
                      className="border-2 border-gray-400 bg-white p-4 rounded-2xl flex items-center justify-center"
                      onPress={() => handleImagePick()}
                    >
                      <Text className="text-sky-500">Upload Property Images</Text>
                    </TouchableOpacity>
                  )}
                  <View className="flex-row flex-wrap m-3 ">


                    {images.length > 0 && (
                      <View>
                        <Text className="ml-4 text-gray-600">Design Images</Text>
                        <View className="border-dashed border-2 border-gray-400 p-2 rounded-lg mt-3 bg-white">
                          <View className="flex-row items-center flex-wrap mt-2">
                            {images.map((uri, index) => (
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

              </View>

            </View>

            <View className="mx-10">
              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-sky-950 justify-center items-center rounded-xl">
                <Text className="text-white text-xl py-4">Add Property Details</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>


      </View>
    </SafeAreaView>
  );
}