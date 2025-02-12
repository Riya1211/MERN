import { configureStore } from "@reduxjs/toolkit";
import { productAPI } from "./api/productAPI";
import { userAPI } from "./api/userAPI";
import { userReducer } from "./reducer/userReducer";
import { cartReducer } from "./reducer/cartReducer";
import { orderAPI } from "./api/orderAPI";

export const server = import.meta.env.VITE_SERVER;

export const store = configureStore({
    reducer: {
        //it is written in this way because thisway we will not hardcode the name
        [userAPI.reducerPath]: userAPI.reducer,
        [productAPI.reducerPath]: productAPI.reducer,
        [orderAPI.reducerPath]: orderAPI.reducer,
        [userReducer.name] : userReducer.reducer,
        [cartReducer.name] : cartReducer.reducer
    },
    middleware: (mid) => [...mid(), userAPI.middleware, productAPI.middleware, orderAPI.middleware], //  [...mid(), userAPI.middleware] is used because we are concatinating the middldeware as they are of array type
});