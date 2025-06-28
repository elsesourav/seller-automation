import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
   return twMerge(clsx(inputs));
}

// Format a number as Indian currency/lakh-crore style
export function formatIndianNumber(x) {
   if (x === "" || x === undefined || x === null) return "";
   const num = Number(x);
   if (isNaN(num)) return x;
   // Preserve decimals if present
   const [intPart, decPart] = x.toString().split(".");
   const formattedInt = new Intl.NumberFormat("en-IN").format(Number(intPart));
   return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}
