import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: null,
    isAuthenticated: false,
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setSignUp: (state, action) => {
            state.token = action.payload.access_token;
            state.isAuthenticated = true
            state.user = action.payload.user || null;
        },
        setLogin: (state, action) => {
            state.token = action.payload.token;
            state.isAuthenticated = true
            state.user = action.payload.user;
        },
        setLogout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.user = null;
        },
        updateUserProfile: (state, action) => {
            if (state.user) {
                // Extract updated fields from `data`
                const updatedData = action.payload.data || {};
                
                // Merge updated data while keeping previous values if not provided
                state.user = {
                    ...state.user,
                    ...updatedData, // Prioritize new data 
                    address: updatedData.address ?? state.user.address,
                    city: updatedData.city ?? state.user.city,
                    company_address: updatedData.company_address ?? state.user.company_address,
                    company_name: updatedData.company_name ?? state.user.company_name,
                    company_registered_number: updatedData.company_registered_number ?? state.user.company_registered_number,
                    description: updatedData.description ?? state.user.description,
                    email: updatedData.email ?? state.user.email,
                    image: updatedData.image ?? state.user.image,
                    name: updatedData.name ?? state.user.name,
                    number: updatedData.number ?? state.user.number,
                    portfolio: updatedData.portfolio ?? state.user.portfolio,
                    project_name: updatedData.project_name ?? state.user.project_name,
                    upload_organisation: updatedData.upload_organisation ?? state.user.upload_organisation,
                };
            }
        },
        
    },
});

export const { setLogin, setLogout, setSignUp,updateUserProfile  } = authSlice.actions;
export default authSlice.reducer;
