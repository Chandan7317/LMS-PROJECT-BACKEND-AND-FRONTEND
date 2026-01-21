import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

import axiosInstance from "../../Helpers/axiosInstance";
const initialState = {
  isLoggedIn: localStorage.getItem("isLoggedIn") || false,
  role: localStorage.getItem("role") || "",
  // data: localStorage.getItem("data"),
  data:
    localStorage.getItem("data") !== undefined
      ? JSON.parse(localStorage.getItem("data"))
      : {},
};

export const createAccount = createAsyncThunk("/auth/signup", async (data) => {
  try {
    const res = axiosInstance.post("user/register", data);
    toast.promise(res, {
      loading: "Wait! creating your account",
      success: (data) => {
        return data?.data?.message;
      },
      error: "Failed to create account",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

export const login = createAsyncThunk("/auth/login", async (data) => {
  try {
    const res = axiosInstance.post("user/login", data);
    toast.promise(res, {
      loading: "Wait! authentication in progress...",
      success: (data) => {
        return data?.data?.message;
      },
      error: "Failed to log in",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

export const logout = createAsyncThunk("/auth/logout", async () => {
  try {
    const res = axiosInstance.post("user/logout");
    toast.promise(res, {
      loading: "Wait! logout in progress...",
      success: (data) => {
        return data?.data?.message;
      },
      error: "Failed to log out",
    });
    return (await res).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

export const updateProfile = createAsyncThunk("/user/update/profile",async (data) => {
    try {
      const res = axiosInstance.put(`user/update/${data[0]}`, data[1]);
      toast.promise(res, {
        loading: "Wait! profile update in progress...",
        success: (data) => {
          return data?.data?.message;
        },
        error: "Failed to update profile",
      });
      return (await res).data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  },
);

export const changePassword = createAsyncThunk("/user/change/password",
async (data) => {
    try {
      // data = { oldPassword, newPassword }
      const res = axiosInstance.post("user/change-password", data);

      toast.promise(res, {
        loading: "Changing password...",
        success: (res) => {
          return res?.data?.message || "Password changed successfully";
        },
        error: "Failed to change password",
      });

      return (await res).data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      throw error;
    }
  }
);


export const getUserData = createAsyncThunk("/user/details", async () => {
  try {
    const res = axiosInstance.get("user/me");
    return (await res).data;
  } catch (error) {
    toast.error(error.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        localStorage.setItem("data", JSON.stringify(action?.payload?.data));
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("role", action?.payload?.data?.role);
        state.isLoggedIn = true;
        state.data = action?.payload?.data;
        state.role = action?.payload?.data?.role;
      })

      .addCase(logout.fulfilled, (state) => {
        localStorage.clear();
        state.data = {};
        state.isLoggedIn = false;
        state.role = "";
      })

      .addCase(getUserData.fulfilled, (state, action) => {
        if (!action?.payload?.data) return;
        localStorage.setItem("data", JSON.stringify(action?.payload?.data));
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("role", action?.payload?.data?.role);
        state.isLoggedIn = true;
        state.data = action?.payload?.data;
        state.role = action?.payload?.data?.role;
      });
  },
});

// export const {} = authSlice.actions;
export default authSlice.reducer;
