import { configureStore } from "@reduxjs/toolkit";
import { userAPI } from "./api/userAPI";
import { userReducer } from "./reducer/userReducer";

export const server = import.meta.env.VITE_SERVER;

export const store = configureStore({
    reducer: {
        //it is written in this way because thisway we will not hardcode the name
        [userAPI.reducerPath]: userAPI.reducer,
        [userReducer.name] : userReducer.reducer
    },
    middleware: (mid) => [...mid(), userAPI.middleware], //  [...mid(), userAPI.middleware] is used because we are concatinating the middldeware as they are of array type
});