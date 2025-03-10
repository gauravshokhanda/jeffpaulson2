import axios from "axios";
export default async function fetchUserData( token, userId,setLoading) {
    // console.log(` ${token} ${userId}`)
    setLoading(true)
    try {
        if (!token) {
            throw new Error("No authentication token found");
        }
        const response = await axios.get(`https://g32.iamdeveloper.in/api/users/listing/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        // console.log("data when function", response.data)
        return response.data;
    }
    catch (error) {
        console.error("Error while fetching userData:", error);
        return null;
    }
    finally{
        setLoading(false)
    }
}