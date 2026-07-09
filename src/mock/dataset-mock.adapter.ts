import axios, { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { DATASET_RULES, DatasetBody } from "./dataset-rules";

// The real adapter axios would have used; we delegate to it for non-dataset calls.
const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

const isDatasetCall = (config: InternalAxiosRequestConfig): boolean =>
  (config.method ?? "").toLowerCase() === "post" &&
  (config.url ?? "").includes("/ecm/dataset/datasets");

const parseBody = (data: unknown): DatasetBody => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as DatasetBody;
    } catch {
      return {};
    }
  }
  return (data ?? {}) as DatasetBody;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const datasetMockAdapter: AxiosAdapter = async (config) => {
  if (!isDatasetCall(config)) {
    return defaultAdapter(config);
  }

  const body = parseBody(config.data);
  const rule = DATASET_RULES.find((r) => r.match(body));

  if (!rule) {
    console.warn("[mock] no rule matched dataset call:", body);
  }

  await delay(300);

  const response: AxiosResponse = {
    data: { content: { values: rule?.values ?? [] } },
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  };
  return response;
};
