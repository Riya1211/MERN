import { configureStore } from "@reduxjs/toolkit";
import { productAPI } from "./api/productAPI";
import { userAPI } from "./api/userAPI";
import { userReducer } from "./reducer/userReducer";
import { cartReducer } from "./reducer/cartReducer";

export const server = import.meta.env.VITE_SERVER;

export const store = configureStore({
    reducer: {
        //it is written in this way because thisway we will not hardcode the name
        [userAPI.reducerPath]: userAPI.reducer,
        [productAPI.reducerPath]: productAPI.reducer,
        [userReducer.name] : userReducer.reducer,
        [cartReducer.name] : cartReducer.reducer
    },
    middleware: (mid) => [...mid(), userAPI.middleware, productAPI.middleware], //  [...mid(), userAPI.middleware] is used because we are concatinating the middldeware as they are of array type
});