import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TextInput, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Polygon, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getAreaOfPolygon } from 'geolib';
import { useDispatch } from 'react-redux';
import { setPolygonData } from '../../redux/slice/polygonSlice';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [isLocationFetched, setIsLocationFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dispatch = useDispatch();

  const fetchLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setIsLocationFetched(true);
    } catch (error) {
      Alert.alert('Error', `Unable to fetch location: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => {
    if (location) {
      setLocation((prevLocation) => ({ 
        ...prevLocation,
        latitudeDelta: prevLocation.latitudeDelta / 2,
        longitudeDelta: prevLocation.longitudeDelta / 2,
      }));
    }
  };

  const handleZoomOut = () => {
    if (location) {
      setLocation((prevLocation) => ({
        ...prevLocation,
        latitudeDelta: prevLocation.latitudeDelta * 2,
        longitudeDelta: prevLocation.longitudeDelta * 2,
      }));
    }
  };

  const searchLocation = async (input) => {
    console.log('Input:', input);

    if (!input.trim()) {
      Alert.alert('Error', 'Please enter a valid location name or coordinates.');
      return;
    }


    const coordinatePattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
    if (coordinatePattern.test(input)) {

      const [latitude, longitude] = input.split(',').map(Number);
      try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (results.length > 0) {
          const location = results[0];
          setLocation({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setSearchText("");
          // Alert.alert('Location Found', `Location Name: ${location.city || location.region || 'Unknown'}`);
        } else {
          Alert.alert('Not Found', 'No matching location found.');
        }
      } catch (error) {
        console.log('Error', `Unable to fetch location: ${error.message}`);
      }
    } else {
      // Handle location name input
      try {
        const results = await Location.geocodeAsync(input);
        if (results.length > 0) {
          const { latitude, longitude } = results[0];
          setLocation({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          // console.log(latitude, longitude);
          // Alert.alert('Location Found', `Moved to: ${input}`);
          setSearchText("");
        } else {
          Alert.alert('Not Found', 'No matching location found.');
        }
      } catch (error) {
        console.log('Error', `Unable to fetch location: ${error.message}`);
      }
    }
  };


  const handleMapPress = (event) => {
    if (isDrawing) {
      const newPoint = event.nativeEvent.coordinate;
      setPolygonPoints((prevPoints) => [...prevPoints, newPoint]);
    }
  };

  const handleClearPolygon = () => {
    setPolygonPoints([]);
  };

  const handleCalculateArea = async () => {
    if (polygonPoints.length >= 3) {
      try {
        const area = getAreaOfPolygon(polygonPoints);
        const areaInSquareFeet = (area * 10.7639).toFixed(2);
        console.log("Area in square feet:", areaInSquareFeet);

        const centroid = polygonPoints.reduce(
          (acc, point) => {
            acc.latitude += point.latitude;
            acc.longitude += point.longitude;
            return acc;
          },
          { latitude: 0, longitude: 0 }
        );
        centroid.latitude /= polygonPoints.length;
        centroid.longitude /= polygonPoints.length;

        // console.log("Polygon Centroid:", centroid);

        const [locationDetails] = await Location.reverseGeocodeAsync({
          latitude: centroid.latitude,
          longitude: centroid.longitude,
        });

        if (locationDetails) {
          // console.log("full location detail", locationDetails)
          const { city, region, country, postalCode } = locationDetails;
          // console.log("City:", city);
          // console.log("Region:", region);
          // console.log("Country:", country);
          // console.log("postalCode:", postalCode);

          // Alert.alert(
          //   "Area Details",
          //   `Area: ${areaInSquareFeet} sq. ft.\nCity: ${city}\nRegion: ${region}\nCountry: ${country}\npostalCode: ${postalCode}`
          // );
        } else {
          console.log("Reverse geocoding returned no results.");
        }

        dispatch(
          setPolygonData({
            coordinates: polygonPoints,
            area: areaInSquareFeet,
            city: locationDetails?.city,
            postalCode: locationDetails.postalCode
          })
        );


        router.push('/AreaDetailsScreen');

        setPolygonPoints([]);
      } catch (error) {
        console.error("Error calculating area or fetching location details:", error);
        Alert.alert("Error", `Unable to fetch details: ${error.message}`);
      }
    } else {
      Alert.alert("Error", "A polygon requires at least 3 points.");
    }
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setPolygonPoints([]);
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <View className={`flex-1 ${Platform.OS === 'ios' ? 'mt-16' : ''}`}>
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Fetching location...</Text>
        </View>
      ) : location ? (
        <View className="flex-1 relative">
          <TouchableOpacity
            className={`absolute z-10 left-2 ${Platform.OS === 'ios' ? 'top-7' : 'top-7'}`}
            onPress={() => router.back()}
          >
            <Ionicons
              className="bg-white p-2 rounded-full"
              name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <View className="bg-white w-[80%] h-12 absolute top-6 z-10 flex-row-reverse left-14 items-center justify-around rounded-2xl">
            <TouchableOpacity className="px-3">
              <Ionicons name="search-outline" size={24} color="#172554" />
            </TouchableOpacity>
            <TextInput
              className="text-slate-600 text-xl"
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by location name or co."
              placeholderTextColor="gray"
              onSubmitEditing={() => searchLocation(searchText)}
            />

          </View>

          <MapView
            style={{ flex: 1 }}
            region={location}
            onPress={handleMapPress}
            mapType="satellite"
          >
            {polygonPoints.length > 0 && (
              <Polygon
                coordinates={polygonPoints}
                strokeColor="#000"
                fillColor="rgba(0, 200, 0, 0.5)"
                strokeWidth={2}
              />
            )}
            <Circle
              center={location}
              radius={50}
              fillColor="rgba(0, 100, 255, 0.2)"
              strokeColor="rgba(0, 100, 255, 0.8)"
            />
            <Marker coordinate={location} title="You are here" />
          </MapView>

          <View className="absolute bottom-80 right-4 z-10 flex">

            <TouchableOpacity onPress={handleZoomIn} className="p-3 bg-white mb-2 rounded-full">
              <Ionicons name="add-outline" size={30} color="#172554" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleZoomOut} className="p-3 bg-white rounded-full">
              <Ionicons name="remove-outline" size={30} color="#172554" />
            </TouchableOpacity>
          </View>
          <View className="absolute right-4 z-10 flex bottom-5">
            <TouchableOpacity
              onPress={handleStartDrawing}
              className="p-3 bg-white rounded-full my-2"
            >
              <Ionicons name="create-outline" size={28} color="#0EA5E9" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClearPolygon}
              className="p-3 bg-white rounded-full"
            >
              <Ionicons name="trash-outline" size={28} color="#0EA5E9" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCalculateArea}
              className="p-3 bg-white rounded-full my-2"
            >
              <Ionicons name="arrow-forward" size={28} color="#0EA5E9" />
            </TouchableOpacity>
          </View>


        </View>
      ) : (
        <Text className="text-center text-lg mt-20">Click below to fetch your location</Text>
      )}
    </View>
  );
}
