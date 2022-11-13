import React, { createContext, useState, Dispatch, useContext } from "react";

type UI_Provider_props = {
  children: JSX.Element;
};

export type UI_context_type = {
  UI: {
    menu: boolean | string,
    modal: boolean | string;
    notification: { show: boolean | string; message: string; type: string };
    breadcrumb: any,
  };
  dispatch: {
    toggleMenu: (state: boolean | string) => void;
    openModal: (state: boolean | string) => void;
    closeModal: () => void;
    openNotification: (message: string, type: string) => void;
    closeNotification: (message: string, type: string) => void;
    removeNotification: () => void;
    breadcrumb: (state: any) => void;
    resetBreadcrumb: () => void;
  };
  setUI?: Dispatch<boolean>;
};

export type UI_state_type = {
  menu: boolean,
  modal: boolean | string;
  notification: { show: boolean | string; message: string; type: string };
  breadcrumb: any,
  setUI?: Dispatch<boolean>;
};

const InitialState =
{
  menu: false,
  modal: false,
  notification: {
    show: false,
    message: "",
    type: "alert",
  },
  breadcrumb: [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListOrder: 'ItemListOrderAscending',
    itemListElement:
      [{
        "@type": "ListItem",
        "position": 1,
        "name": "breadcrumb"
      }]
  }]
}

export const UI_context = createContext<UI_context_type | null>(null);
export default function UI_provider({ children }: UI_Provider_props) {
  /**
   * Modal Initial Context
   */
  const [UI, setUI] = useState<UI_state_type>(InitialState);

  const dispatch = {

    breadcrumb: (state: any) => {
      setUI((S) => ({ ...S, breadcrumb: state }));
    },

    resetBreadcrumb: () => {
      setUI((S) => ({ ...S, breadcrumb: false }));
    },

    toggleMenu: (state: boolean | string) => {
      setUI((S) => ({ ...S, menu: !UI.menu }));
    },

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
          dispatch.closeNotification(message, type);
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
        dispatch.removeNotification();
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
    <UI_context.Provider value={{ UI, dispatch }}>
      {children}
    </UI_context.Provider>
  );
}


