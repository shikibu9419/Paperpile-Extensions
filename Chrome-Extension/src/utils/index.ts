export * from "./elements";
export * from "./react";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
