import { createContext, useContext } from "react";

// True when rendering the vertical (9:16) phone version.
export const PortraitContext = createContext(false);
export const usePortrait = () => useContext(PortraitContext);
