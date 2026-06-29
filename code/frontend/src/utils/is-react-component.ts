import { isValidElement } from "react";

// TODO: Check if a given prop is a functional React component rather than an already rendered ReactNode

export const isReactComponent = (value: unknown): value is React.FC =>
    typeof value === "function" && !isValidElement(value);
