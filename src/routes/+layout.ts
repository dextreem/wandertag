// The app is a client-rendered PWA: geolocation, MapLibre and Keycloak PKCE all
// require the browser, so there is nothing meaningful to render on the server.
export const ssr = false;
export const prerender = false;
