import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import debounce from "lodash.debounce";
import { API } from "../config/apiConfig";
import { useSelector } from "react-redux";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';



const CitySearch = ({ city, setCity }) => {
    const [cities, setCities] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMoreCities, setHasMoreCities] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const token = useSelector((state) => state.auth.token);

    const handleCitySearch = useCallback(
        debounce(async (query, currentPage = 1) => {
            if (!query) return;
            setSearchLoading(true);
            try {
                const response = await API.post(
                    `/citie-search?page=${currentPage}`,
                    { city: query },
                    { headers: { Authorization: `Bearer ${token}` } }
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
                Alert.alert("Error", error.response?.data?.message || "City search failed.");
            } finally {
                setSearchLoading(false);
                setLoadingMore(false);
            }
        }, 500),
        [token]
    );

    const loadMoreCities = () => {
        if (hasMoreCities && !searchLoading && !loadingMore) {
            setLoadingMore(true);
            setPage((prevPage) => {
                const nextPage = prevPage + 1;
                handleCitySearch(city, nextPage);
                return nextPage;
            });
        }
    };

    return (
        <View className="flex-1">
            {/* Search Bar */}
            <View className="flex-row items-center border-b border-gray-300 mt-5">
                <Ionicons name="search" size={18} color="black" />
                <TextInput
                    className="flex-1 text-lg text-gray-800 ml-5"
                    placeholder="Search city"
                    placeholderTextColor="#A0AEC0"
                    onChangeText={(text) => {
                        setCity(text);
                        setPage(1);
                        handleCitySearch(text, 1);
                    }}
                    value={city}
                />
                <MaterialCommunityIcons name="crosshairs-gps" size={25} color="#0C4A6E" />
                {searchLoading && <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 5 }} />}
            </View>
    
            {/* City List */}
            {cities.length > 0 && (
                <View className="mt-2">
                    <FlashList
                        data={cities}
                        keyExtractor={(item) => item.key}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setCity(item.label);
                                    setCities([]);
                                }}
                                style={{
                                    padding: 10,
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                <Text>{item.label}</Text>
                            </TouchableOpacity>
                        )}
                        estimatedItemSize={50}
                        horizontal={false} // Ensures vertical scrolling
                        style={{
                            maxHeight: 150, // Limit height for better visibility
                            backgroundColor: "white",
                            borderWidth: 1,
                            borderColor: "#ccc",
                            borderRadius: 5,
                            marginTop: 5,
                        }}
                        ListFooterComponent={
                            hasMoreCities && (
                                <View style={{ alignItems: "center", marginVertical: 10 }}>
                                    <TouchableOpacity
                                        onPress={loadMoreCities}
                                        style={{
                                            backgroundColor: "#0284C7",
                                            paddingVertical: 10,
                                            paddingHorizontal: 20,
                                            borderRadius: 5,
                                        }}
                                    >
                                        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
                                            Load More
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    />
                </View>
            )}
        </View>
    );
    
};

export default CitySearch;
