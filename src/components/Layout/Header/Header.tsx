import React from "react";
import S from './Header.module.scss';

export function Header(): JSX.Element {
  return (
    <header className={`${S.container} `}>
      <h1 className={`${S.text_white}`}>SEO Generate</h1>
    </header>
  )
}