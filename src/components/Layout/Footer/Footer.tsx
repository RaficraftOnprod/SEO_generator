import React from "react";
import S from './Footer.module.scss'


export function Footer(): JSX.Element {
  return (
    <footer className={`${S.container}`}>
      <p className={`${S.text_white}`}>Made by Raficraft</p>
    </footer>
  )
}