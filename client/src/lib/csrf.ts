import Cookies from "js-cookie";

export function getCSRFToken() {
    return Cookies.get("csrftoken");
}