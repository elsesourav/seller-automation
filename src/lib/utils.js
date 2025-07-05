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

// LocalStorage utility functions
const STORAGE_KEYS = {
   SELECTED_BASE_FORM_DATA: "seller_automation_selected_base_form_data",
   SELECTED_DESC_FORM_DATA: "seller_automation_selected_desc_form_data",
   COLLECTED_PRODUCT_DATA: "seller_automation_collected_product_data",
};

/**
 * Save data to localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @returns {boolean} - Success status
 */
export function setLocalStorageData(key, data) {
   try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
   } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
   }
}

/**
 * Get data from localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Retrieved data or default value
 */
export function getLocalStorageData(key, defaultValue = null) {
   try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
   } catch (error) {
      console.error("Error reading from localStorage:", error);
      return defaultValue;
   }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - Success status
 */
export function removeLocalStorageData(key) {
   try {
      localStorage.removeItem(key);
      return true;
   } catch (error) {
      console.error("Error removing from localStorage:", error);
      return false;
   }
}

/**
 * Clear all seller automation data from localStorage
 */
export function clearAllSellerData() {
   Object.values(STORAGE_KEYS).forEach((key) => {
      removeLocalStorageData(key);
   });
}

// Specific functions for seller automation data
export function saveSelectedBaseFormData(baseFormDataId) {
   return setLocalStorageData(
      STORAGE_KEYS.SELECTED_BASE_FORM_DATA,
      baseFormDataId
   );
}

export function getSelectedBaseFormData() {
   return getLocalStorageData(STORAGE_KEYS.SELECTED_BASE_FORM_DATA);
}

export function saveSelectedDescFormData(descFormDataId) {
   return setLocalStorageData(
      STORAGE_KEYS.SELECTED_DESC_FORM_DATA,
      descFormDataId
   );
}

export function getSelectedDescFormData() {
   return getLocalStorageData(STORAGE_KEYS.SELECTED_DESC_FORM_DATA);
}

export function saveCollectedProductData(productData) {
   return setLocalStorageData(STORAGE_KEYS.COLLECTED_PRODUCT_DATA, productData);
}

export function getCollectedProductData() {
   return getLocalStorageData(STORAGE_KEYS.COLLECTED_PRODUCT_DATA);
}

export function clearSelectedData() {
   removeLocalStorageData(STORAGE_KEYS.SELECTED_BASE_FORM_DATA);
   removeLocalStorageData(STORAGE_KEYS.SELECTED_DESC_FORM_DATA);
   removeLocalStorageData(STORAGE_KEYS.COLLECTED_PRODUCT_DATA);
}

// Additional product fields localStorage functions
const ADDITIONAL_FIELDS_KEY = "seller_automation_additional_product_fields";

export function saveAdditionalProductFields(fields) {
   return setLocalStorageData(ADDITIONAL_FIELDS_KEY, fields);
}

export function getAdditionalProductFields() {
   return getLocalStorageData(ADDITIONAL_FIELDS_KEY, {});
}

export function clearAdditionalProductFields() {
   return removeLocalStorageData(ADDITIONAL_FIELDS_KEY);
}
