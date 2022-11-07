import React, { SVGProps } from "react";

export function IconOpenPadlock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="0.75em" height="1em" viewBox="0 0 384 512" {...props}>
      <title>Padlock open</title>
      <path fill="currentColor"
        d="M192 43q35 0 60 25t25 60q0 21 22 21q21 0 21-21q0-52-38-90T192 0t-90 38t-38 90v64q-27 0-45.5 18.5T0 256v192q0 27 18.5 45.5T64 512h256q27 0 45.5-18.5T384 448V256q0-27-18.5-45.5T320 192H107v-64q0-35 25-60t60-25zm128 192q21 0 21 21v192q0 21-21 21H64q-21 0-21-21V256q0-21 21-21h256zM171 380v25q0 22 21 22t21-22v-25q43-15 43-60q0-27-18.5-45.5T192 256t-45.5 18.5T128 320q0 20 12 36.5t31 23.5zm21-81q21 0 21 21t-21 21t-21-21t21-21z">
      </path>
    </svg>
  )
}


export function IconClosePadlock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="0.75em" height="1em" viewBox="0 0 384 512" {...props}>
      <title>Padlock close</title>
      <path fill="currentColor"
        d="M192 0q-52 0-90 38t-38 90v64q-27 0-45.5 18.5T0 256v192q0 27 18.5 45.5T64 512h256q27 0 45.5-18.5T384 448V256q0-27-18.5-45.5T320 192v-64q0-52-38-90T192 0zm149 256v192q0 21-21 21H64q-21 0-21-21V256q0-21 21-21h256q21 0 21 21zm-234-64v-64q0-35 25-60t60-25t60 25t25 60v64H107zm85 64q-27 0-45.5 18.5T128 320q0 20 12 36.5t31 23.5v25q0 22 21 22t21-22v-25q43-15 43-60q0-27-18.5-45.5T192 256zm0 85q-21 0-21-21t21-21t21 21t-21 21z">
      </path>
    </svg>
  )
}