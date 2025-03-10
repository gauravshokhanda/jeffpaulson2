import { View, Text, Modal, TouchableOpacity, Image, TextInput } from 'react-native'
import React from 'react'
import { Feather } from "@expo/vector-icons";
import Swiper from "react-native-swiper";
import TextInputField from './TextInputField';



export default function EditPortfolioModal({
    modalVisible,
    setModalVisible,
    portfolio,
    formData,
    setFormData,
    handleUpdate,
    pickImage
}) {
    return (
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
            <View className="flex-1 justify-center bg-black/50 p-6">
                <View className="bg-white p-6 rounded-lg">
                    {/* Modal Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-semibold">Edit Portfolio</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Feather name="x" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View className="h-72 w-full rounded-lg overflow-hidden">
                        {portfolio?.portfolio_images &&
                            <Swiper
                                showsPagination={true}
                                autoplay={true}
                                autoplayTimeout={3}
                                loop={true}
                                dot={<View className="w-2 h-2 bg-gray-400 mx-1 rounded-full" />}
                                activeDot={<View className="w-2 h-2 bg-blue-950 mx-1 rounded-full" />}
                            >
                                {JSON.parse(portfolio.portfolio_images || "[]").map((image, index) => (
                                    <Image
                                        key={index}
                                        source={{ uri: `https://g32.iamdeveloper.in/public/${image}` }}
                                        className="w-full h-72"
                                        resizeMode="cover"
                                    />
                                ))}
                            </Swiper>
                        }

                    </View>
                    <TextInputField
                        label="Project Name"
                        value={formData.project_name}
                        onChange={(text) =>
                            setFormData({ ...formData, project_name: text })
                        }
                    />
                    <TextInputField
                        label="Description"
                        value={formData.description}
                        onChange={(text) =>
                            setFormData({ ...formData, description: text })
                        }
                    />
                    <TextInputField
                        label="Address"
                        value={formData.address}
                        onChange={(text) => setFormData({ ...formData, address: text })}
                    />
                    <TextInputField
                        label="City"
                        value={formData.city}
                        onChange={(text) => setFormData({ ...formData, city: text })}
                    />
                    <TouchableOpacity
                        onPress={pickImage}
                        className="p-3 bg-sky-950 rounded-lg"
                    >
                        <Text className="text-white text-center">Pick an Image</Text>
                    </TouchableOpacity>

                    {/* Buttons */}
                    <View className="flex-row justify-end mt-4">
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="px-4 py-2 bg-gray-300 rounded-lg mr-2"
                        >
                            <Text className="text-black">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleUpdate}
                            className="px-4 py-2 bg-sky-950 rounded-lg"
                        >
                            <Text className="text-white">Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
    // const TextInputField = ({ label, value, onChange }) => (
    //     <View className="mb-4">
    //         <Text className="text-gray-700 mb-1">{label}</Text>
    //         <TextInput
    //             value={value}
    //             onChangeText={onChange}
    //             className="border border-gray-300 p-2 rounded-lg"
    //         />
    //     </View>
    // );
}
