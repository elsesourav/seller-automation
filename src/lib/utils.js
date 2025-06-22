"use strict";

/* ----  local storage set and get ---- */
function setDataFromLocalStorage(key, object) {
   let data = JSON.stringify(object);
   localStorage.setItem(key, data);
}

function getDataFromLocalStorage(key) {
   console.log(localStorage);
   return JSON.parse(localStorage.getItem(key));
}

function reloadLocation() {
   window.location.reload();
}

// create element
function CE(first, ...children) {
   let element;

   if (first instanceof Node) {
      element = document.createElement("div");
      element.appendChild(first);
   } else if (typeof first === "object" && first !== null) {
      const tag = first.tag || "div";
      element = document.createElement(tag);

      for (const [attr, value] of Object.entries(first)) {
         if (attr !== "tag") {
            element.setAttribute(attr, value);
         }
      }
   } else if (typeof first === "string" || typeof first === "number") {
      element = document.createElement("div");
      element.innerText = first;
   }

   children.forEach((child) => {
      if (typeof child === "string" || typeof child === "number") {
         element.innerText = child;
      } else if (child instanceof Node) {
         element.appendChild(child);
      }
   });

   element.parent = (parent) => {
      if (parent) {
         parent.appendChild(element);
         return element;
      }
   };

   return element;
}

const N = (string) => Number(string);

/* 
   ---Example 1: Create a simple <div> element and append it to the body
   const div = CE({});
   document.body.appendChild(div);

   ---Example 2: Create a <p> element with text content and append it to the body
   const p = CE({ tag: 'p' }, 'Hello, world!');
   document.body.appendChild(p); 

   ---Example 3: Create an <img> element with attributes and append it to the body
   const img = CE({ tag: 'img', src: 'image.jpg', alt: 'Image' });
   document.body.appendChild(img);

   ---Example 4: Create a <div> with a <span> child element and append it to the body
   const span = document.createElement('span');
   span.textContent = 'Child Element';
   const divWithChild = CE({ tag: 'div' }, span);
   document.body.appendChild(divWithChild); 
*/

function map(os, oe, ns, ne, t, isRound = true) {
   const r = (ne - ns) / (oe - os);
   let v = r * (t - os) + ns;
   v = Math.min(ne, Math.max(ns, v));
   return isRound ? Math.round(v) : v;
}

function setDataToLocalStorage(key, object) {
   let data = JSON.stringify(object);
   localStorage.setItem(key, data);
}

function getDataToLocalStorage(key) {
   return JSON.parse(localStorage.getItem(key));
}

function OBJECTtoJSON(data) {
   return JSON.stringify(data);
}

function JSONtoOBJECT(data) {
   return JSON.parse(data);
}

/* ----------- extension utils ----------- */
function getActiveTab() {
   return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.tabs) {
         chrome.tabs.query(
            {
               currentWindow: true,
               active: true,
            },
            (tabs) => {
               console.log(tabs);
               resolve(tabs[0]);
            }
         );
      } else {
         console.warn("Chrome extension APIs not available");
         resolve(null);
      }
   });
}

function getFormatTime(t) {
   const date = new Date(0);
   date.setSeconds(t);
   return date.toISOString().substr(11, 8);
}

function runtimeSendMessage(type, message, callback) {
   if (typeof chrome === "undefined" || !chrome.runtime) {
      console.warn("Chrome extension APIs not available");
      return;
   }

   if (typeof message === "function") {
      chrome.runtime.sendMessage({ type }, (response) => {
         message && message(response);
      });
   } else {
      chrome.runtime.sendMessage({ ...message, type }, (response) => {
         callback && callback(response);
      });
   }
}

function tabSendMessage(tabId, type, message, callback) {
   if (typeof chrome === "undefined" || !chrome.tabs) {
      console.warn("Chrome extension APIs not available");
      return;
   }

   // if third parameter is not pass. in message parameter pass callback function
   if (typeof message === "function") {
      chrome.tabs.sendMessage(tabId, { type }, (response) => {
         message && message(response);
      });
   } else {
      chrome.tabs.sendMessage(tabId, { ...message, type }, (response) => {
         callback && callback(response);
      });
   }
}

function runtimeOnMessage(type, callback) {
   if (typeof chrome === "undefined" || !chrome.runtime) {
      console.warn("Chrome extension APIs not available");
      return;
   }

   chrome.runtime.onMessage.addListener((message, sender, response) => {
      if (type === message.type) {
         callback(message, sender, response);
      }
      return true;
   });
}

const debounce = (func, delayFn) => {
   let debounceTimer;
   return function (...args) {
      const context = this;
      const delay = delayFn();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
   };
};

/**
 * @param {number} ms
 **/
function wait(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

function chromeStorageSet(key, value, callback) {
   return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage) {
         console.warn("Chrome extension APIs not available");
         resolve();
         return;
      }

      let items = {};
      items[key] = value;
      chrome.storage.sync.set(items, function () {
         if (chrome.runtime.lastError) {
            console.error("Error setting item:", chrome.runtime.lastError);
         } else if (callback) {
            callback();
         }
         resolve();
      });
   });
}

function chromeStorageGet(key, callback = () => {}) {
   return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage) {
         console.warn("Chrome extension APIs not available");
         resolve(null);
         return;
      }

      chrome.storage.sync.get([key], function (result) {
         if (chrome.runtime.lastError) {
            console.error("Error getting item:", chrome.runtime.lastError);
         } else if (callback) {
            callback(result[key]);
            resolve(result[key]);
         }
      });
   });
}

function setInputLikeHuman(element) {
   const event = new Event("change", { bubbles: true });
   element.dispatchEvent(event);
}

function chromeStorageSetLocal(key, value, callback) {
   if (typeof chrome === "undefined" || !chrome.storage) {
      console.warn("Chrome extension APIs not available");
      return;
   }

   const obj = JSON.stringify(value);
   chrome.storage.local.set({ [key]: obj }).then(() => {
      if (chrome.runtime.lastError) {
         console.error("Error setting item:", chrome.runtime.lastError);
      } else if (callback) {
         callback(true);
      } else {
         return true;
      }
   });
}

function chromeStorageGetLocal(key, callback) {
   return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage) {
         console.warn("Chrome extension APIs not available");
         resolve(null);
         return;
      }

      chrome.storage.local.get([key]).then((result) => {
         if (chrome.runtime.lastError) {
            console.error("Error getting item:", chrome.runtime.lastError);
         } else {
            const OBJ =
               typeof result[key] === "string" ? JSON.parse(result[key]) : null;
            callback && callback(OBJ);
            resolve(OBJ);
         }
      });
   });
}

function chromeStorageRemoveLocal(key) {
   if (typeof chrome === "undefined" || !chrome.storage) {
      console.warn("Chrome extension APIs not available");
      return;
   }

   chrome.storage.local.remove(key).then(() => {
      if (chrome.runtime.lastError) {
         console.log("Error removing item:", chrome.runtime.lastError);
      }
   });
}

function chromeStorageClear(callback) {
   return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage) {
         console.warn("Chrome extension APIs not available");
         resolve();
         return;
      }

      chrome.storage.sync.clear().then(() => {
         if (chrome.runtime.lastError) {
            console.error("Error clearing storage:", chrome.runtime.lastError);
         } else if (callback) {
            callback();
         }
         resolve();
      });
   });
}

// imageURL:  e.g., "data:image/jpeg;base64,..."
function putImageIntoInputFile(fileInputElement, imageURL, fileType = "jpeg") {
   fetch(imageURL)
      .then((response) => response.blob())
      .then((blob) => {
         const imageFile = new File([blob], `image.${fileType}`, {
            type: `image/${fileType}`,
         });

         const dataTransfer = new DataTransfer();
         dataTransfer.items.add(imageFile);
         fileInputElement.files = dataTransfer.files;

         const event = new Event("change", { bubbles: true });
         fileInputElement.dispatchEvent(event);
      });
}

function DATE() {
   const date = new Date();
   const yy = date.getFullYear();
   const mm = date.getMonth() + 1;
   const dd = date.getDate();
   const hh = date.getHours();
   const ss = date.getMinutes();
   const ms = date.getSeconds();
   return { yy, mm, dd, hh, ss, ms };
}

function selectRandomImage(images) {
   if (images.length > 1) {
      const imgs = [...images].sort(() => Math.random() - 0.5);
      return imgs[Math.floor(Math.random() * imgs.length)];
   }
   return [];
}

function getSecondsForMonths(months) {
   // Average days in a month
   return Math.round(months * 60 * 60 * 30 * 24);
}

function dateToMilliseconds(dateString) {
   const date = new Date(dateString);
   return date.getTime();
}

// Export functions for use in other modules
export {
   CE,
   chromeStorageClear,
   chromeStorageGet,
   chromeStorageGetLocal,
   chromeStorageRemoveLocal,
   chromeStorageSet,
   chromeStorageSetLocal,
   DATE,
   dateToMilliseconds,
   debounce,
   getActiveTab,
   getDataFromLocalStorage,
   getDataToLocalStorage,
   getFormatTime,
   getSecondsForMonths,
   JSONtoOBJECT,
   map,
   N,
   OBJECTtoJSON,
   putImageIntoInputFile,
   reloadLocation,
   runtimeOnMessage,
   runtimeSendMessage,
   selectRandomImage,
   setDataFromLocalStorage,
   setDataToLocalStorage,
   setInputLikeHuman,
   tabSendMessage,
   wait,
};
