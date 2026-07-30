import axios from "axios";
import fluigConfig, { useMocks } from "../config";
import { datasetMockAdapter } from "../mock/dataset-mock.adapter";

axios.interceptors.request.use(
  (config) => {
    config.headers.Authorization = fluigConfig.header;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

if (useMocks) {
  axios.defaults.adapter = datasetMockAdapter;
  console.info("[mock] Fluig dataset mocks ON (VITE_USE_MOCKS!=false). Set VITE_USE_MOCKS=false to hit the real cloud.");
}

export default axios;
