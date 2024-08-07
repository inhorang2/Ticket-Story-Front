import {API_URL} from '@env';
import {
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  REFRESH_SUCCESS,
  REFRESH_FAIL,
} from './types';
import {
  UPDATE_TICKET_SUCCESS
} from './../ticket/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const checkIdDuplicate = async userId => {
  try {
    console.log(API_URL)
    const response = await axios.get(
      `${API_URL}/api/v1/auth/checkDuplicateId`, 
      {
        params: {
          id: userId,
        },
      });
    console.log('ID duplicate check response:', response.data);
    return response.data.result;
  } catch (error) {
    console.error('ID duplicate check error:', error);
    throw error;
  }
}

export const sendEmail = async userId => {
  try {
    console.log(API_URL)
    const response = await axios.get(
      `${API_URL}/api/v1/auth/password/sendPasswordCertification`, 
      // userId,
      {
        headers: {
          'Content-Type': 'application/json',
          // 'Accept': 'application/json',
          // 'Content-Type': 'application/json;charset=UTF-8',
        },
        params: {
          userId: userId
        },
      },
    );
    console.log('Send Email check response:', response.data);
    return response.data.result;
  } catch (error) {
    console.error('SendEmail check error:', error);
    throw error;
  }
}

export const signUpRequest = async formData => {
  try {
    console.log('Sign-up request:', formData);
    const response = await axios.post(
      `${API_URL}/api/v1/auth/signup`,
      {
        id: formData.id,
        password: formData.password,
        birthday: formData.birthday,
        gender: formData.gender.toUpperCase(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('Sign-up response:', response.data);

    if(response.data.accessToken !== null) {
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  } catch (error) {
    console.error('Sign-up error:', error);
    throw error;
  }
};

export const signInRequest = (id, password, callback) => async dispatch => {
  const body = JSON.stringify({ id, password });

  try {
    const response = await axios.post(
      `${API_URL}/api/v1/auth/login`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('Sign-in response:', response.data);

    if(response.data.accessToken !== null) {
      console.log('refreshToken', response.data.refreshToken);
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      dispatch({
        type: LOGIN_SUCCESS,
        payload: response.data,
      });

      // console.log('왜안돼2');
      dispatch({
        type: UPDATE_TICKET_SUCCESS,
      })

      if(callback) callback([true, response.data]);
    } else {
      if(callback) callback([false, response.data]);
    }
  }
  catch (error) {
    console.error('Sign-in error:', error.response.data);
    if(callback) callback([false, error]);
  }
}

export const logoutRequest = (callback) => async dispatch => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  console.log('잘와? ', refreshToken);
  try {
    const response = await axios.post(
      `${API_URL}/api/v1/auth/logout`,
      {
        refreshToken : refreshToken
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('뭐냐고....',response);

    if(response.data.result) {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');

      dispatch({
        type: LOGOUT_SUCCESS,
        payload: response.data,
      });
      // return;
      // return response.data;
      if(callback) callback([true, response.data]);
    } else {
      console.log('Logout not success: ',response.data)
      // return response.data;
      if(callback) callback([false, response.data]);
    }

  } catch (error) {
    console.error('Logout error:', error.response.data);
    // throw error;
    if(callback) callback([false, error]);
  }
}

export const handleOAuthKaKaoLogin = async () => {
  try {
    console.log('handleKaKaoLogin');
    const response = await axios.get(`${API_URL}/api/v1/auth/oauth/kakao/url`);
    console.log('Kakao login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Kakao login error:', error);
    throw error;
  }
};

// export const saveTokens = async (url) => {
//   try {
//     console.log('Saving tokens:', url)
//     const response = await axios.get(url);
//     console.log('Token response:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Error extracting and storing tokens:', error.response.data);
//     throw error;
//   }
// };

export const saveTokens = (url, callback) => async dispatch => {
  // const body = JSON.stringify({url});
  try {
    console.log('Saving tokens:', url)
    const response = await axios.get(url);
    console.log('Token response:', response.data);

    if(response.data.accessToken !== null) {
      console.log('11', response.data.accessToken)
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      dispatch({
        type: LOGIN_SUCCESS,
        payload: response.data,
      });

      dispatch({
        type: UPDATE_TICKET_SUCCESS,
      })
      console.log('22')
      // return response.data;
      if(callback) callback([true, response.data]);
    } else {
      console.log('kakao accessToken null');
      if(callback) callback([false, response.data]);
      // return response.data;
    }
  } catch (error) {
    console.error('Error extracting and storing tokens:', error.response.data);
    // throw error;
    if(callback) callback([false, error]);
  }
};


export const sendPasswordResetEmail = async (email) => {
  const accessToken = await AsyncStorage.getItem('accessToken');

  try {
    console.log('Sending password reset email:', email);
    const response = await axios.post(
      `${API_URL}/api/v1/auth/password/sendPasswordCertification`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      },
    );
    console.log('Password reset email response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

export const verfiyPasswordResetCode = async (userId, code) => {
  // const token = await AsyncStorage.getItem('accessToken');
  const body = JSON.stringify({ userId, code });
  try {
    console.log('Verifying password reset code:', code);
    const response = await axios.post(
      `${API_URL}/api/v1/auth/password/verifyCertificationCode`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
      },
    );
    console.log('Password reset code verification response:', response.data);
    // return response.data;

    if(response.data.accessToken !== null) {
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      return response.data;
      // if(callback) callback([true, response.data]);
    } else {
      console.log(response.data.accessToken);
      // if(callback) callback([false, response.data]);
    }

  } catch (error) {
    console.error('Error verifying password reset code:', error);
    throw error;
  }
}

export const resetPassword = async (password, token) => {
  console.log('22222', password);
  // const token = await AsyncStorage.getItem('accessToken');
  try {
    const response = await axios.post(
      `${API_URL}/api/v1/auth/password/changePassword`,
      { password : password },
      {
        headers: {
          // 'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': `Bearer ${token}`,
        },
      },
    );
    console.log('Password reset code verification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying password reset code:', error.response.data);
    throw error;
  }
}

export const checkPassword = async password => {
  const token = await AsyncStorage.getItem('accessToken');
  try {
    const response = await axios.post(
      `${API_URL}/api/v1/auth/password/getChangeAuth`,
      { password : password },
      {
        headers: {
          // 'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': `Bearer ${token}`,
        },
      },
    );
    console.log('Password check code verification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error password checking code:', error.response.data);
    throw error;
  }
}

export const deleteAccount = async (survey, token) => {
  // const token = await AsyncStorage.getItem('accessToken');
  try {
    const response = await axios.post(
      `${API_URL}/api/v1/auth/quitTicketStory`,
      { 
        survey : survey
      },
      {
        headers: {
          // 'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': `Bearer ${token}`,
        },
      },
    );
    console.log('Delete Account response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting account code:', error.response.data);
    throw error;
  }
}