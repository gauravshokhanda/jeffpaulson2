import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    contractors: [],
};

const contractorsSlice = createSlice({
    name: 'contractors',
    initialState,
    reducers: {
        setContractors: (state, action) => {
            state.contractors = action.payload;
        },
        clearContractors: (state) => {
            state.contractors = [];
        },
    },
});

export const { setContractors, clearContractors } = contractorsSlice.actions;

export default contractorsSlice.reducer;
