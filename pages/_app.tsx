import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

import React from "react";
import { useRouter } from "next/router";
import { createGlobalStyle } from "styled-components";
import { darkTheme, ITheme, lightTheme } from "../context/ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GlobalStyles = createGlobalStyle`
body,html {
  background: ${({ theme }: { theme: ITheme }) =>
    theme === "dark" ? darkTheme.body : lightTheme.body};
  color: ${({ theme }: { theme: ITheme }) =>
    theme === "dark" ? darkTheme.text : lightTheme.text};
  transition: all 0.50s linear;
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}
`;

export const SocketContext = React.createContext<typeof Socket | null>(null);
export const ThemeContext = React.createContext<ITheme | null>(null);

function MyApp({ Component, pageProps }: AppProps) {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [theme, setTheme] = useState<ITheme | null>(null);

  const URL = process.env.NEXT_PUBLIC_API_URL;
  const [authentication, setAuthentication] = useState<"user" | "guest">(
    "guest"
  );

  const router = useRouter();

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const { token } = router.query;

  const toggleChangeTheme = () => {
    setTheme(oldState => (oldState === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    const authenticate = async (receivedToken: string) => {
      try {
        const response = await fetch(`${URL}/user/login`, {
          method: "GET",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${receivedToken}`
          }
        });
        router.replace("", undefined, { shallow: true });
        const { statusCode } = await response.json();
        if (statusCode === 401) {
          setAuthentication("guest");
          sessionStorage.removeItem("Authentication");
          return;
        }
        sessionStorage.setItem("Authentication", receivedToken);
        setAuthentication("user");
      } catch (error) {
        setAuthentication("guest");
      }
    };
    if (sessionStorage.getItem("Authentication")) {
      authenticate(String(sessionStorage.getItem("Authentication")));
    }
    if (token) {
      authenticate(String(token));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [URL, token]);

  useEffect(() => {
    if (authentication === "user") {
      const newSocket = io(`http://${window.location.hostname}:5000`, {
        query: {
          Authorization: `${sessionStorage.getItem("Authentication")}`
        }
      });
      setSocket(newSocket);
      return () => {
        newSocket.close();
      };
    }
  }, [authentication]);

  useEffect(() => {
    if (theme) localStorage.setItem("Theme", theme);
  }, [theme]);

  useEffect(() => {
    const localTheme = localStorage.getItem("Theme");
    if (localTheme && ["dark", "light"].includes(localTheme)) {
      setTheme(localTheme as ITheme);
    } else {
      setTheme("light");
    }
  }, []);

  return (
    <ChakraProvider>
      <SocketContext.Provider value={socket}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ThemeContext.Provider value={theme}>
            {theme && <GlobalStyles theme={theme} />}
            <Component
              {...pageProps}
              authentication={authentication}
              changeTheme={toggleChangeTheme}
            />
          </ThemeContext.Provider>
        </GoogleOAuthProvider>
      </SocketContext.Provider>
    </ChakraProvider>
  );
}

export default MyApp;
