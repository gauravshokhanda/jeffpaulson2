import { createSlice } from "@reduxjs/toolkit";

const realStatePropertySlice = createSlice({
  name: "property",
  initialState: {
    propertyDetails: null,
  },
  reducers: {
    setRealStateProperty: (state, action) => {
      state.propertyDetails = action.payload;
      console.log("Action received:", action.payload);
    },
  },
});

export const { setRealStateProperty } = realStatePropertySlice.actions;
export default realStatePropertySlice.reducer;
