import { createSlice } from '@reduxjs/toolkit';

const breakdownCostSlice = createSlice({
    name: 'breakdownCost',
    initialState: {
        breakdownCost: null,
    },
    reducers: {
        setBreakdownCost: (state, action) => {
            state.breakdownCost = action.payload;
        },
    },
});

export const { setBreakdownCost } = breakdownCostSlice.actions;
export default breakdownCostSlice.reducer;
