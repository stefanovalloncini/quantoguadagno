import {
  RESTORE_KEYS_ATTRIBUTE,
  RESTORE_PENDING_ATTRIBUTE,
} from "@/islands/runtime/restoreSignal.ts";
import { LOCALE_STORAGE_KEY, THEME_STORAGE_KEY } from "@/islands/runtime/storedKeys.ts";
import { EMPLOYEE_PARAMS, INVERSE_PARAMS } from "@/queryParams.ts";

export const THEME_ATTRIBUTE = "data-theme";
export const THEME_CHOICE_ATTRIBUTE = "data-theme-choice";
export const THEME_TOGGLE_ATTRIBUTE = "data-theme-toggle";
export const DISCLOSURE_ATTRIBUTE = "data-disclosure";
export const DISCLOSURE_CLOSE_ATTRIBUTE = "data-disclosure-close";
export const REQUIRES_SCRIPT_ATTRIBUTE = "data-requires-script";
export const LOCALE_OFFER_ATTRIBUTE = "data-locale-offer";
export const LOCALE_HINT_ATTRIBUTE = "data-locale-hint";
export const LOCALE_HINT_CLOSE_ATTRIBUTE = "data-locale-hint-close";

const THEME_COLORS = { light: "#ffffff", dark: "#101010" } as const;

export const themeScript = `(function () {
  var root = document.documentElement;
  var key = "${THEME_STORAGE_KEY}";
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function stored() {
    try {
      var value = localStorage.getItem(key);
      return value === "light" || value === "dark" ? value : "system";
    } catch (error) {
      return "system";
    }
  }
  var choice = stored();
  function syncInputs() {
    var inputs = document.querySelectorAll("[${THEME_TOGGLE_ATTRIBUTE}] input");
    for (var i = 0; i < inputs.length; i++) inputs[i].checked = inputs[i].value === choice;
  }
  function apply() {
    var dark = choice === "dark" || (choice === "system" && media !== null && media.matches);
    root.setAttribute("${THEME_ATTRIBUTE}", dark ? "dark" : "light");
    root.setAttribute("${THEME_CHOICE_ATTRIBUTE}", choice);
    var colors = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < colors.length; i++) {
      colors[i].setAttribute("content", dark ? "${THEME_COLORS.dark}" : "${THEME_COLORS.light}");
    }
    syncInputs();
  }
  function reload() {
    choice = stored();
    apply();
  }
  apply();
  if (media !== null && media.addEventListener) media.addEventListener("change", apply);
  window.addEventListener("storage", function (event) {
    if (event.key === key || event.key === null) reload();
  });
  window.addEventListener("pageshow", reload);
  document.addEventListener("DOMContentLoaded", syncInputs);
  document.addEventListener("change", function (event) {
    var target = event.target;
    if (!(target instanceof HTMLInputElement) || target.closest("[${THEME_TOGGLE_ATTRIBUTE}]") === null) return;
    var value = target.value;
    if (value !== "light" && value !== "dark" && value !== "system") return;
    choice = value;
    try {
      if (choice === "system") localStorage.removeItem(key);
      else localStorage.setItem(key, choice);
    } catch (error) {}
    apply();
  });
})();`;

export const disclosureScript = `(function () {
  var any = "[${DISCLOSURE_ATTRIBUTE}][open]";
  function close(details) {
    details.removeAttribute("open");
    var summary = details.querySelector("summary");
    if (summary !== null) summary.focus();
  }
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var target = event.target;
    var owner = target instanceof Element ? target.closest(any) : null;
    if (owner !== null) close(owner);
  });
  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    var button = target.closest("[${DISCLOSURE_CLOSE_ATTRIBUTE}]");
    var owner = button === null ? null : button.closest("[${DISCLOSURE_ATTRIBUTE}]");
    if (owner !== null) close(owner);
  });
})();`;

export const localeHintScript = `(function () {
  var root = document.documentElement;
  var key = "${LOCALE_STORAGE_KEY}";
  var offer = root.getAttribute("${LOCALE_OFFER_ATTRIBUTE}");
  function stored() {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }
  function remember(value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (error) {}
  }
  function sync() {
    if (offer !== null && stored() === offer) root.setAttribute("${LOCALE_HINT_ATTRIBUTE}", "");
    else root.removeAttribute("${LOCALE_HINT_ATTRIBUTE}");
  }
  sync();
  window.addEventListener("pageshow", sync);
  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[${LOCALE_HINT_CLOSE_ATTRIBUTE}]") !== null) {
      remember(null);
      sync();
      var main = document.getElementById("main");
      if (main !== null) main.focus({ preventScroll: true });
      return;
    }
    var link = target.closest("a[hreflang]");
    if (link !== null) remember(link.getAttribute("hreflang"));
  });
})();`;

export const restoreScript = `(function () {
  var root = document.documentElement;
  var names = root.getAttribute("${RESTORE_KEYS_ATTRIBUTE}");
  if (!names) return;
  var keys = names.split(" ");
  var pending = false;
  new URLSearchParams(location.search).forEach(function (value, name) {
    if (name === "fbclid" || name.indexOf("utm_") === 0) return;
    if (keys.indexOf(name) !== -1) pending = true;
  });
  if (pending) root.setAttribute("${RESTORE_PENDING_ATTRIBUTE}", "");
})();`;

const NET_MODE_KEYS = Object.keys(INVERSE_PARAMS);

export function netModeForwardScript(target: string): string {
  const names = JSON.stringify(EMPLOYEE_PARAMS);
  const order = JSON.stringify(NET_MODE_KEYS);
  return `(function () {
  var params = new URLSearchParams(location.search);
  var legacy = ${names};
  function read(key) {
    var names = [key].concat(legacy[key] || []);
    for (var i = 0; i < names.length; i++) if (params.has(names[i])) return params.get(names[i]);
    return null;
  }
  if (read("s") !== "n") return;
  var months = Number(read("m"));
  if (!(months >= 12 && months <= 16 && Math.floor(months) === months)) months = 13;
  var order = ${order};
  var out = new URLSearchParams();
  for (var i = 0; i < order.length; i++) {
    var key = order[i];
    var value = read(key);
    if (value === null || value === "") continue;
    if (key === "n") {
      var monthly = Number(value);
      if (!(monthly > 0)) continue;
      value = String(Math.round(monthly * months));
    }
    out.set(key, value);
  }
  var query = out.toString();
  location.replace(${JSON.stringify(target)} + (query ? "?" + query : "") + location.hash);
})();`;
}
