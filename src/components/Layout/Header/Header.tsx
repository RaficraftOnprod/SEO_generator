import { useRouter } from "next/router";
import React, { useContext } from "react";
import { UI_context, UI_context_type } from "../../../context/UI_Provider";
import BreadCrumb from "../Breadcrumb/Breadcrumb";
import S from './Header.module.scss';

export function Header(): JSX.Element {

  const { UI, dispatch } = useContext(UI_context) as UI_context_type
  const router = useRouter();

  return (
    <header className={`${S.container} `}>
      <div className="burger_container">
        <div className="burger_menu cursor"
          onClick={() => { dispatch.toggleMenu(!UI.menu) }}
        >
          <span></span>
        </div>
      </div>
      {

        <BreadCrumb />
      }
    </header>
  )
}


