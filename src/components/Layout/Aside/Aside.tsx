import React, { useContext } from "react";
import Link from 'next/link';
import S from './Aside.module.scss'
import { UI_context, UI_context_type } from "../../../context/UI_Provider";

export function Aside(): JSX.Element {

  const { UI, dispatch } = useContext(UI_context) as UI_context_type;

  function handleClick() { }

  return (
    <>
      <aside className={`${S.container}`} data-open={UI.menu}>
        {/* <header className="">
          <div className="burger_menu cursor">
            <span onClick={() => { handleClick() }}></span>
          </div>
        </header> */}
        <ul className={S.list}>
          <li>
            <Link href='/breadcrumb'>
              breadcrumbList
            </Link>
          </li>
          <li>
            FAQ
          </li>
          <li>
            organisation
          </li>
        </ul>
      </aside>
    </>
  )
}