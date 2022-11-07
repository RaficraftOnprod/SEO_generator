import React, { createContext, useState, Dispatch } from "react";
import { callbackify } from "util";

type UI_Provider_props = {
  children: JSX.Element;
};

export type UI_context_type = {
  UI: {
    modal: boolean | string;
    notification: { show: boolean | string; message: string; type: string };
    shop: { vat: number; ship: number };
  };
  callback: {
    openModal: (state: boolean | string) => void;
    closeModal: () => void;
    openNotification: (message: string, type: string) => void;
    closeNotification: (message: string, type: string) => void;
    removeNotification: () => void;
  };
  setUI?: Dispatch<boolean>;
};

export type UI_state_type = {
  modal: boolean | string;
  notification: { show: boolean | string; message: string; type: string };
  shop: { vat: number; ship: number };

  setUI?: Dispatch<boolean>;
};

export const UI_context = createContext<UI_context_type | null>(null);
export default function UI_provider({ children }: UI_Provider_props) {
  /**
   * Modal Initial Context
   */
  const [UI, setUI] = useState<UI_state_type>({
    modal: false,
    notification: {
      show: false,
      message: "",
      type: "alert",
    },
    shop: {
      vat: 20,
      ship: 50,
    },
  });

  const callback = {
    openModal: (state: boolean | string) => {
      setUI((S) => ({ ...S, modal: state }));
    },

    closeModal: () => {
      setUI((S) => ({ ...S, modal: "reverse" }));
      setTimeout(() => {
        setUI((S) => ({ ...S, modal: false }));
      }, 500);
    },

    openNotification: (message: string, type: string) => {
      if (!UI.notification.show) {
        setUI((S) => ({
          ...S,
          notification: { show: true, message: message, type },
        }));
        setTimeout(() => {
          callback.closeNotification(message, type);
        }, 5000);
      }
    },

    closeNotification: (message: string, type: string) => {
      setUI((S) => ({
        ...S,
        notification: {
          show: "reverse",
          message: message,
          type: type,
        },
      }));

      setTimeout(() => {
        callback.removeNotification();
      }, 500);
    },

    removeNotification: () => {
      setUI((S) => ({
        ...S,
        notification: { show: false, message: "", type: "" },
      }));
    },
  };

  return (
    <UI_context.Provider value={{ UI, callback }}>
      {children}
    </UI_context.Provider>
  );
}
