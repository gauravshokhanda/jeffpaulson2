import { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  View,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { setLogin } from "../redux/slice/authSlice";
import { API } from "../config/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthInput from "../components/AuthInput";
import { LinearGradient } from "expo-linear-gradient";
import fetchUserData from "./utils/fetchUserData";

export default function SignIn() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const postContentWidth = screenWidth * 0.92;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userProfileComplete, setUserProfileComplete] = useState(null); // Initialize as null for clarity
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Unified loading state

  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);

  // Centralized auth and profile check
  useEffect(() => {
    const initializeAuth = async () => {
      setIsCheckingAuth(true);
      try {
        // Check for persisted token
        const storedData = await AsyncStorage.getItem("persist:root");
        if (!storedData || !token || !user?.id) {
          setIsCheckingAuth(false);
          return;
        }

        // Fetch user profile data if token and user ID exist
        const userData = await fetchUserData(token, user.id, setIsCheckingAuth);
        if (userData?.data?.is_profile_complete !== undefined) {
          setUserProfileComplete(userData.data);
        }

        // Navigate based on role and profile completion
        if (isAuthenticated && token && userData?.data) {
          const { role, id } = user;
          if (role === 3) {
            router.replace(
              userData.data.is_profile_complete
                ? "/(generalContractorTab)"
                : "/ContractorProfileComplete"
            );
          } else if (role === 4) {
            router.replace(
              userData.data.is_profile_complete
                ? "/(RealstateContractorTab)"
                : "/RealstateSelector"
            );
          } else {
            router.replace("/(usertab)");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializeAuth();
  }, [isAuthenticated, token, user, router, dispatch]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and Password are required.");
      return;
    }

    setIsCheckingAuth(true);
    try {
      const response = await API.post("auth/login", { email, password });
      const { token, user } = response.data;

      // Save token and user in Redux
      dispatch(setLogin({ token, user }));

      // Fetch profile data after login
      const userData = await fetchUserData(token, user.id, setIsCheckingAuth);
      const profileComplete = userData?.data?.is_profile_complete;

      // Navigate based on role and profile completion
      if (user.role === 3) {
        router.replace(
          profileComplete
            ? "/(generalContractorTab)"
            : "/ContractorProfileComplete"
        );
      } else if (user.role === 4) {
        router.replace(
          profileComplete ? "/(RealstateContractorTab)" : "/RealstateSelector"
        );
      } else {
        router.replace("/(usertab)");
      }
    } catch (err) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (!err.response) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (err.response.status === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Show loading spinner while checking auth or signing in
  if (isCheckingAuth) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0c4a6e" />
      </View>
    );
  }

  // Render sign-in form only if auth check is complete and user is not authenticated
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView>
            <View className="items-center">
              <View
                style={{
                  width: screenWidth * 0.38,
                  height: screenWidth * 0.38,
                  borderRadius: screenWidth * 0.19, // Ensures always a perfect circle
                  borderWidth: 4,
                  borderColor: "#082f49",
                  overflow: "hidden",
                  marginTop: screenHeight * 0.01,
                }}
                className="items-center justify-center"
              >
                <Image
                  source={require("../assets/images/AC5D_Logo.jpg")}
                  style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                />
              </View>
            </View>
            <View
              className="flex-1 px-6"
              style={{ marginTop: screenHeight * 0.03 }}
            >
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
              <TouchableOpacity
                onPress={handleSignIn}
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
                  SIGN IN
                </Text>
              </TouchableOpacity>
              <View className="items-center mt-8">
                <Link
                  href={""}
                  className="text-gray-500 font-medium"
                  style={{ fontSize: screenHeight * 0.02 }}
                >
                  Forgot Your Password ?
                </Link>
                <View className="flex-row mt-8">
                  <Text
                    style={{ fontSize: screenHeight * 0.018 }}
                    className="text-gray-700 text-lg"
                  >
                    Don’t have an account?
                  </Text>
                  <Link
                    style={{ fontSize: screenHeight * 0.018 }}
                    className="text-blue-600 text-lg pl-1"
                    href={"/SignUp"}
                  >
                    Sign up
                  </Link>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
