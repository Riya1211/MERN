import { configureStore } from "@reduxjs/toolkit";
import { dashboardAPI } from "./api/dashboardAPI";
import { orderAPI } from "./api/orderAPI";
import { productAPI } from "./api/productAPI";
import { userAPI } from "./api/userAPI";
import { cartReducer } from "./reducer/cartReducer";
import { userReducer } from "./reducer/userReducer";

export const server = import.meta.env.VITE_SERVER;

export const store = configureStore({
  reducer: {
    //it is written in this way because thisway we will not hardcode the name
    [userAPI.reducerPath]: userAPI.reducer,
    [productAPI.reducerPath]: productAPI.reducer,
    [orderAPI.reducerPath]: orderAPI.reducer,
    [dashboardAPI.reducerPath]: dashboardAPI.reducer,
    [userReducer.name]: userReducer.reducer,
    [cartReducer.name]: cartReducer.reducer,
  },
  middleware: (mid) => [
    ...mid(),
    userAPI.middleware,
    productAPI.middleware,
    orderAPI.middleware,
    dashboardAPI.middleware,
  ], //  [...mid(), userAPI.middleware] is used because we are concatinating the middldeware as they are of array type
});

export type RootState = ReturnType<typeof store.getState>;
