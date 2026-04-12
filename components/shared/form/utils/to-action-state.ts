// import { AxiosError } from "axios";
import { ZodError } from "zod";

export type ActionState = {
  status?: "SUCCESS" | "ERROR";
  message: string;
  payload?: Record<string, string>;
  fieldErrors: Record<string, string[] | undefined>;
  timestamp: number;
  response?: Record<string, string | number | undefined | null>;
};

export const EMPTY_ACTION_STATE: ActionState = {
  message: "",
  fieldErrors: {},
  timestamp: Date.now(),
};

const toPayload = (formData?: FormData): Record<string, string> | undefined =>
  formData ? Object.fromEntries(formData) as Record<string, string> : undefined;

export const fromErrorToActionState = (
  error: unknown,
  formData?: FormData,
  response?: Record<string, string | number>
): ActionState => {
  if (error instanceof ZodError) {
    return {
      status: "ERROR",
      message: "",
      fieldErrors: error.flatten().fieldErrors,
      payload: toPayload(formData),
      timestamp: Date.now(),
      response,
    };
  }
  // if (error instanceof AxiosError) {
  //   return {
  //     status: "ERROR",
  //     message: error.response?.data.message,
  //     fieldErrors: {},
  //     payload: toPayload(formData),
  //     timestamp: Date.now(),
  //     response,
  //   };
  // }
  if (error instanceof Error) {
    return {
      status: "ERROR",
      message: error.message,
      fieldErrors: {},
      payload: toPayload(formData),
      timestamp: Date.now(),
      response,
    };
  }
  return toActionState(
    "ERROR",
    "An unknown error occurred",
    formData,
    response
  );
};

export const toActionState = (
  status: ActionState["status"],
  message: string,
  formData?: FormData,
  response?: Record<string, string | number | undefined | null>
): ActionState => {
  return {
    status,
    message,
    fieldErrors: {},
    timestamp: Date.now(),
    payload: toPayload(formData),
    response,
  };
};
