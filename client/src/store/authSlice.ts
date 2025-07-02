import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api/axios';
import { deriveKey, generateSalt } from '../crypto/keyDerivation';
import { encryptData } from '../crypto/encryption';

interface UserCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

/**
 * Converts a hex string to an ArrayBuffer.
 */
function hexStringToArrayBuffer(hex: string): ArrayBuffer {
  return new Uint8Array(hex.match(/[\da-f]{2}/gi)!.map((h) => parseInt(h, 16))).buffer;
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }: UserCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      return response.data as LoginResponse;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ username, password }: UserCredentials, { rejectWithValue }) => {
    try {
      const salt = generateSalt();
      const hashedPassword = await deriveKey(password, salt);
      const keyData = hexStringToArrayBuffer(hashedPassword);
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
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

interface AuthState {
  user: { username: string } | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: { message: string } | string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = { username: action.meta.arg.username };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as { message: string }) ?? 'Login failed';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as { message: string }) ?? 'Registration failed';
      });
  },
});

export default authSlice.reducer;
