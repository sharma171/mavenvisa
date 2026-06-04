import { configureStore } from "@reduxjs/toolkit";
import reducerData from "./sliceData";

const store = configureStore({
  reducer: {
    data: reducerData,
  },
});

export default store;
