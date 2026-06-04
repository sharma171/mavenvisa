import { createSlice } from "@reduxjs/toolkit";

let userData = {};
try {
  const stored = localStorage.getItem("userData");
  userData = stored ? JSON.parse(stored) : {};
} catch (e) {
  userData = {};
}

const initialState = {
  userData: userData,
};

const sliceData = createSlice({
  name: "data",
  initialState,
  reducers: {
    setUserData(state, action) {
      state.userData = action?.payload;
    },
     // 2) New reducer to set all applications
    setAllApplications(state, action) {
      state.allApplications = action.payload || [];
    },
  },
});

export const {setUserData, setAllApplications } = sliceData.actions;
export default sliceData.reducer;
