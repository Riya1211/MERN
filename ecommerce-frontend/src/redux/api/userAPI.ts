import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MessageResponse, UserResponse } from "../../types/api-types";
import { User } from "../../types/types";
import axios from "axios";

export const userAPI = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/user/` }),  //Server common URL that we have created in backend
  endpoints: (builder) => ({
    // <MessageResponse, number> this tells us that query argument is of custom type that is user in this case and whatever it returns it is of custom Type that we have created
    login: builder.mutation<MessageResponse, User>({ //called mutation because query is changing or in this scenerio creating for the first time 
      query: (user) => ({
        url: "new",  //when login is called new is added at the end of baseUrl
        method: "POST",
        body: user,
      }),
    }),
  }),
});

export const getUser = async ( id: string) => {
  try {
    const { data } : {data: UserResponse} = await axios.get(`${import.meta.env.VITE_SERVER}/api/v1/user/${id}`);  
    return data;
  } catch (error) {
    throw error
  }
}
 
// useLoginMutation created on its own because of "@reduxjs/toolkit/query/react" and login is the name we have given
export const { useLoginMutation } = userAPI;