import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Image,
    StyleSheet,
    SafeAreaView,
    Dimensions
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { API } from '../../config/apiConfig';
import { useSelector } from 'react-redux';
import ModalSelector from 'react-native-modal-selector';
import { FontAwesome } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import debounce from 'lodash.debounce';
import { FlashList } from '@shopify/flash-list';
import { useDispatch } from 'react-redux';
import { setBreakdownCost } from '../../redux/slice/breakdownCostSlice';
import { LinearGradient } from 'expo-linear-gradient';


export default function FloorMapScreen() {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const postContentWidth = screenWidth * 0.92;
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [area, setArea] = useState('');
    const [projectType, setProjectType] = useState('');
    const [squareFit, setSquareFit] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUri, setImageUri] = useState(null);
    const [fileName, setFileName] = useState(null);

    const [cities, setCities] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMoreCities, setHasMoreCities] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);


    const token = useSelector((state) => state.auth.token);


    const router = useRouter();

    const getCity = async (zip) => {
        try {
            const response = await API.post(
                "get-cityname",
                { zipcode: zip },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            const cityName = response.data.data.city;
            setCity(cityName);
        } catch (error) {
            console.error("Error fetching city name:", error);
            Alert.alert("Error", "Unable to fetch city name. Please check the zip code.");
        }
    };

    // -----------
    const handleCitySearch = useCallback(
        debounce(async (query, currentPage = 1) => {
            if (!query) return;
            setSearchLoading(true);
            try {
                const response = await API.post(
                    `/citie-search?page=${currentPage}`,
                    { city: query },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

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

                if (error.response?.data?.message) {
                    Alert.alert('Error', error.response.data.message);
                } else {
                    Alert.alert('Error', 'An unknown error occurred while searching for cities.');
                }
            } finally {
                setSearchLoading(false);
                setLoadingMore(false);
            }
        }, 500),
        [token]
    );


    const loadMoreCities = () => {

        if (hasMoreCities && !searchLoading && !loadingMore) {
            setLoadingMore(true); // Mark loading as true
            setPage(prevPage => {
                const nextPage = prevPage + 1;
                handleCitySearch(city, nextPage);
                return nextPage;
            });
        }
    };

    const handleFileUpload = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: ["image/*", "application/pdf"],
            copyToCacheDirectory: true,
        });

        setFileName(result.assets[0]?.name || "Uploaded File");
        setImageUri(result.assets[0]?.uri);
    };

    const handleRemoveImage = () => {
        setImageUri(null);
        setFileName(null);
    };

    const handleSubmit = async () => {
        if (!city || !zipCode || !area || !projectType || !imageUri) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append("city", city);
        data.append("zip_code", zipCode);
        data.append("area", area);
        data.append("project_type", projectType);
        data.append("floor_maps", {
            uri: imageUri,
            name: fileName || "uploaded_file",
            type: "image/jpeg",
        });



        try {
            const response = await API.post("regional_multipliers/details", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            const breakdownCost = JSON.stringify(response.data.data);
            dispatch(setBreakdownCost(breakdownCost));
            router.push(`/BreakdownCost?screenName=FloorMapScreen`);

            setName('');
            setCity('');
            setZipCode('');
            setArea('');
            setProjectType('');
            setImageUri('');
        } catch (error) {
            console.error("Error occurred:", error.message);
            if (error.response?.data?.errors) {
                Alert.alert('Validation Error', Object.values(error.response.data.errors).join('\n'));
            } else if (error.response?.data?.message) {
                Alert.alert('Error', error.response.data.message);
            } else {
                Alert.alert('Error', 'An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const projectTypeOptions = [
        { key: '1', label: 'Basic' },
        { key: '2', label: 'Mid-range' },
        { key: '3', label: 'Luxury' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-200">

            <LinearGradient
                colors={['#082f49', 'transparent']}
                style={{ height: screenHeight * 0.4 }}
            >
                {/* Header Section */}
                <View className={`py-4 mt-3`}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className={`absolute z-10 left-4 top-5 `} >
                        <Ionicons name='arrow-back' size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold text-center text-white">
                        Floor Map Details
                    </Text>
                </View>
            </LinearGradient>
            <View
                className="flex-1 rounded-3xl bg-white"
                style={{
                    marginTop: -screenHeight * 0.25,
                    width: postContentWidth,
                    marginHorizontal: (screenWidth - postContentWidth) / 2,
                }}
            >
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 50}
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >


                        <View className="px-6 mt-4 rounded-3xl mb-2">
                            <View className="bg-white shadow-lg  p-6">
                                <Text className="text-gray-800 font-semibold text-lg mb-4">
                                    Upload Floormap
                                </Text>
                                <View className="border-dashed border-2 border-sky-900 rounded-xl items-center bg-gray-50">
                                    {/* Display preview if imageUri is available */}
                                    {imageUri ? (
                                        <View className="w-full items-center justify-start mb-1">
                                            <Text className="text-gray-800 font-semibold text-center mb-1">
                                                Preview
                                            </Text>
                                            <View className="relative">
                                                <Image
                                                    source={{ uri: imageUri }}
                                                    className="w-40 h-40 rounded-lg object-contain"
                                                    resizeMode="contain"
                                                />
                                                <TouchableOpacity
                                                    onPress={handleRemoveImage}
                                                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md"
                                                >
                                                    <FontAwesome name="close" size={16} color="red" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <>
                                            <FontAwesome
                                                name="cloud-upload"
                                                size={50}
                                                color="#0284C7"
                                                className="pt-2"
                                            />
                                            <Text className="text-gray-900 mt-4">Upload your files</Text>
                                            <Text className="text-sm text-gray-400 mb-4">
                                                Supported formats: JPG, PNG, PDF
                                            </Text>
                                        </>
                                    )}


                                    {!imageUri && (
                                        <TouchableOpacity
                                            onPress={handleFileUpload}
                                            className="bg-sky-900 py-3 my-5 px-8 rounded-lg shadow-md"
                                        >
                                            <Text className="text-white font-bold text-base">
                                                Add Floormap
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Input Fields */}
                            <View>
                                <View className="space-y-6 mt-6">
                                    {/* Name */}
                                    <View className="mx-2">
                                        <Text className="text-gray-800 font-semibold mb-1 text-base">Name</Text>
                                        <TextInput
                                            className="border border-gray-300 bg-white rounded-xl p-4 text-gray-900 shadow-sm"
                                            placeholder="Enter Name"
                                            placeholderTextColor="#A0AEC0"
                                            onChangeText={setName}
                                            value={name}
                                        />
                                    </View>

                                    <View className="mx-2 relative">
                                        <Text className="text-gray-800 font-semibold mb-1 text-base">City</Text>
                                        <TextInput
                                            className="border border-gray-300 bg-white rounded-xl p-4 text-gray-900 shadow-sm"
                                            placeholder="Search city"
                                            placeholderTextColor="#A0AEC0"
                                            onChangeText={(text) => {
                                                setCity(text);
                                                setPage(1);
                                                handleCitySearch(text, 1);
                                            }}
                                            value={city}
                                        />
                                        {searchLoading && (
                                            <ActivityIndicator
                                                size="small"
                                                color="#0000ff"
                                                style={{ marginTop: 5 }}
                                            />
                                        )}
                                        {cities.length > 0 && (
                                            <FlashList
                                                data={cities}
                                                keyExtractor={(item) => item.key}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setCity(item.label);
                                                            setZipCode(item.zip);
                                                            setCities([]);
                                                        }}
                                                        style={{
                                                            padding: 10,
                                                            borderBottomWidth: 1,
                                                            borderBottomColor: '#ccc',
                                                            backgroundColor: '#f9f9f9',

                                                        }}
                                                    // className="p-2 border-b border-b-gray-400 bg-gray-100"
                                                    >
                                                        <Text>{item.label}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                estimatedItemSize={50}
                                                style={{
                                                    maxHeight: 150,
                                                    backgroundColor: 'white',
                                                    borderWidth: 1,
                                                    borderColor: '#ccc',
                                                    borderRadius: 5,
                                                    marginTop: 5,
                                                }}

                                                ListFooterComponent={
                                                    hasMoreCities && (
                                                        <View style={{ alignItems: 'center', marginVertical: 10 }}>
                                                            <TouchableOpacity
                                                                onPress={loadMoreCities}
                                                                style={{
                                                                    backgroundColor: '#0284C7',
                                                                    paddingVertical: 10,
                                                                    paddingHorizontal: 20,
                                                                    borderRadius: 5,
                                                                }}
                                                            >
                                                                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                                                                    Load More
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    )
                                                }
                                            />
                                        )}
                                    </View>
                                    {/* Zip Code */}
                                    <View className="mx-2">
                                        <Text className="text-gray-800 font-semibold mb-1 text-base">Zip Code</Text>
                                        <TextInput
                                            className="border border-gray-300 bg-white rounded-xl p-4 text-gray-900 shadow-sm"
                                            placeholder="Enter zip code"
                                            placeholderTextColor="#A0AEC0"
                                            keyboardType="numeric"
                                            onChangeText={(text) => {
                                                setZipCode(text);
                                                if (text.length >= 5) {
                                                    // Call getCity only if the zip code length is sufficient
                                                    getCity(text);
                                                } else {
                                                    setCity(""); // Clear city name for incomplete zip codes
                                                }
                                            }}
                                            value={zipCode}
                                        />
                                    </View>
                                </View>

                                {/* Area */}
                                <View className="mx-2">
                                    <Text className="text-gray-800 font-semibold mb-1 text-base">Area in Square feet</Text>
                                    <TextInput
                                        className="border border-gray-300 bg-white rounded-xl p-4 text-gray-900 shadow-sm"
                                        placeholder="Enter area"
                                        placeholderTextColor="#A0AEC0"
                                        onChangeText={setArea}
                                        value={area}
                                    />
                                </View>

                                {/* Project Type */}
                                <View className="mx-2">
                                    <Text className="text-gray-800 font-semibold mb-1 text-base">Project Type</Text>
                                    <ModalSelector
                                        data={projectTypeOptions}
                                        initValue={projectType || "Select project type"}
                                        onChange={(option) => setProjectType(option.label)}
                                        style={{
                                            backgroundColor: '#FFF',
                                        }}
                                        initValueTextStyle={{ color: projectType ? 'black' : '#A0AEC0', textAlign: 'start', padding: 5, borderRadius: 10, }}
                                        selectTextStyle={{ color: 'black', fontSize: 16 }}
                                    />
                                </View>

                                {/* Submit Button */}
                                <View className="mt-4">
                                    <TouchableOpacity
                                        onPress={handleSubmit}
                                        className="bg-sky-900 py-4 rounded-xl shadow-md"
                                    >
                                        <Text className="text-white text-center font-semibold">Submit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>


                    {/* Full Screen Loading Indicator */}
                    {
                        loading && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#FFF" />
                            </View>
                        )
                    }
                </KeyboardAvoidingView >
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});
