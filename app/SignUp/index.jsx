import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  TextInput,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import AuthInput from "../../components/AuthInput";
import { Link, useRouter } from "expo-router";
import { API } from "../../config/apiConfig";
import Logo from "../../assets/images/AC5D_Logo.jpg";
import ModalSelector from "react-native-modal-selector";
import { useDispatch, useSelector } from "react-redux";
import { setSignUp } from "../../redux/slice/authSlice";
import { LinearGradient } from "expo-linear-gradient";

export default function SignUp() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const postContentWidth = screenWidth * 0.92;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState({ key: "", label: "" });
  const dispatch = useDispatch();
  const router = useRouter();
  const isToken = useSelector((state) => state.auth.token);

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = useSelector((state) => state.auth.token);

  // useEffect(() => {
  //     if (isAuthenticated || token) {
  //         router.replace("/(usertab)");
  //     }
  // }, [isAuthenticated, token, router]);

  const handleSignUp = async () => {
    if (!name || !email || !password || !passwordConfirmation || !role.key) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (password !== passwordConfirmation) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    const data = {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      role: role.key,
    };

    try {
      const response = await API.post("auth/register", data);
      // console.log("username", response.data.data.user)
      const { access_token } = response.data;
      console.log("access token", access_token);
      const user = response.data.data.user;
      dispatch(setSignUp({ access_token, user }));

      Alert.alert("Success", "Account created successfully!");
      console.log("User Role After API Call:", role.key);
      if (role.key == 3) {
        router.replace("/ContractorProfileComplete");
      } else if (role.key == 4) {
        router.replace("/RealstateSelector");
      } else {
        router.replace("/(usertab)");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <LinearGradient
        colors={["#082f49", "transparent"]}
        style={{ height: screenHeight * 0.4 }}
      />

      <View
        className="flex-1 rounded-3xl bg-white"
        style={{
          marginTop: -screenHeight * 0.2,
          width: postContentWidth,
          marginHorizontal: (screenWidth - postContentWidth) / 2,
        }}
      >
        <View className="flex-1 rounded-3xl bg-white px-6 py-8">
          {/* Logo Section */}
          <View className="items-center justify-center">
            <View
              style={{
                width: screenWidth * 0.38,
                height: screenWidth * 0.38,
                borderRadius: screenWidth * 0.19, // Ensures it remains a perfect circle
                borderWidth: 4,
                borderColor: "#082f49",
                overflow: "hidden",
                marginTop: screenHeight * 0.01, // Adjusted positioning
              }}
              className="items-center justify-center"
            >
              <Image
                source={Logo}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: screenHeight * 0.1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Input Fields */}
            <View
              style={{ marginTop: screenHeight * 0.04 }}
              className="w-full space-y-4"
            >
              <AuthInput
                placeholder="Name"
                secureTextEntry={false}
                onChangeText={setName}
                value={name}
              />
              <AuthInput
                placeholder="Email Address"
                secureTextEntry={false}
                onChangeText={setEmail}
                value={email}
              />
              <AuthInput
                placeholder="Password"
                secureTextEntry={true}
                onChangeText={setPassword}
                value={password}
              />
              <AuthInput
                placeholder="Confirm Password"
                secureTextEntry={true}
                onChangeText={setPasswordConfirmation}
                value={passwordConfirmation}
              />

              {/* Role Selection Dropdown */}
              <ModalSelector
                data={[
                  { key: 2, label: "Customer" },
                  { key: 3, label: "General Contractor" },
                  { key: 4, label: "Real Estate Contractor" },
                ]}
                initValue="Select Role"
                onChange={(option) =>
                  setRole({ key: option.key, label: option.label })
                }
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#e2e8f0",
                    paddingVertical: screenHeight * 0.02,
                    borderRadius: screenWidth * 0.03,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: screenWidth * 0.03,
                    }}
                    className={role.label ? "text-gray-700" : "text-gray-500"}
                  >
                    {role.label || "Select Role"}
                  </Text>
                </TouchableOpacity>
              </ModalSelector>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              className="rounded-2xl bg-sky-950 items-center"
              style={{
                paddingVertical: screenHeight * 0.015,
                fontSize: screenWidth * 0.04,
                borderRadius: screenWidth * 0.03,
                marginTop: screenHeight * 0.03,
              }}
            >
              <Text
                className="text-white font-bold"
                style={{ fontSize: screenHeight * 0.02 }}
              >
                SIGN UP
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View className="items-center mt-8">
              <View className="flex-row mt-4">
                <Text
                  style={{ fontSize: screenHeight * 0.018 }}
                  className="text-gray-700 text-lg"
                >
                  Already have an account?
                </Text>
                <Link
                  href="/SignIn"
                  style={{ fontSize: screenHeight * 0.018 }}
                  className="text-blue-600 text-lg pl-1"
                >
                  Sign In
                </Link>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
