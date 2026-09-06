import 'dotenv/config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginData {
  valid: LoginCredentials;
  invalid: {
    wrongPassword: LoginCredentials;
    wrongUsername: LoginCredentials;
    emptyUsername: LoginCredentials;
    emptyPassword: LoginCredentials;
    emptyBoth: LoginCredentials;
  };
}

const username = process.env.SALESFORCE_USERNAME ?? '';
const password = process.env.SALESFORCE_PASSWORD ?? '';

export const loginData: LoginData = {
  valid: { username, password },
  invalid: {
    wrongPassword: { username, password: 'incorrect-password' },
    wrongUsername: { username: 'incorrect-username@example.com', password },
    emptyUsername: { username: '', password },
    emptyPassword: { username, password: '' },
    emptyBoth: { username: '', password: '' },
  },
};
