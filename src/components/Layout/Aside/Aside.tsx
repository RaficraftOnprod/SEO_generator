import React from "react";
import Link from 'next/link';
import S from './Aside.module.scss'

export function Aside(): JSX.Element {
  return (
    <>
      <aside className={`${S.container}`}>
        <ul className={S.list}>
          <li>
            <Link href='/breadcrumb'>
              breadcrumbList
            </Link>
          </li>
        </ul>
      </aside>
    </>
  )
}