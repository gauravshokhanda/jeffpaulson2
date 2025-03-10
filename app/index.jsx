import { View, Image, Text, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";

export default function Index() {
    const navigation = useNavigation();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const token = useSelector((state) => state.auth.token);

    return (
        <View className="flex-1 items-center bg-white">
            <View className='items-center'>
                <Image
                    source={require('../assets/images/homescreen/homeImage.png')}
                />
            </View>

            <View className=" h-[20%] w-[100%] justify-between items-center">
                <Image
                    className='h-[60%] w-[80%] rounded-lg '
                    source={require('../assets/images/homescreen/MainLogo.jpg')} />
                <TouchableOpacity
                    onPress={() => navigation.navigate('SignIn')}
                    className="text-center rounded-3xl px-10 bg-sky-950"
                >
                    <Text className="font-semibold text-center mx-10 my-3 text-lg text-white">
                        Get Started
                    </Text>
                </TouchableOpacity>

            </View>

        </View>
    );
}
