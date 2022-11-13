import React from "react";
import { Header } from "./Header/Header";
import { Aside } from "./Aside/Aside";
import { Footer } from "./Footer/Footer";

export function Layout({ children }: { children: JSX.Element | JSX.Element }): JSX.Element {
  return (
    <>
      <Header></Header>
      <main>
        <Aside></Aside>
        {children}
      </main>
      {/* <Footer></Footer> */}
    </>
  )
}