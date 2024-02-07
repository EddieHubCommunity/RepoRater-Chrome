import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Options = () => {
  return (
    <>
      Hello! This is the options page.
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
