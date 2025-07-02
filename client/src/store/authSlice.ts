import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api/axios';
import { deriveKey, generateSalt } from '../crypto/keyDerivation';
import { encryptData } from '../crypto/encryption';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }: any, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ username, password }: any, { rejectWithValue }) => {
    try {
      const salt = generateSalt();
      const hashedPassword = await deriveKey(password, salt);
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(hashedPassword),
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
      const encryptedData = await encryptData(
        JSON.stringify({ someSecureData: 'This is a test' }), // Example data
        key
      );
      const response = await axios.post('/auth/register', {
        username,
        password: hashedPassword,
        salt,
        data: encryptedData,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as any;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as any;
      });
  },
});

export default authSlice.reducer;
