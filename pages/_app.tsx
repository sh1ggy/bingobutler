import '../styles/globals.css'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/dist/client/router';
import { createContext, Dispatch, useContext, useEffect, useMemo, useState } from 'react';

export interface UserObject {
  _id: string;
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner?: any;
  banner_color?: any;
  accent_color?: any;
  locale: string;
  mfa_enabled: boolean;
  email: string;
  verified: boolean;
  rt: string;
}

interface userContext {
  user: UserObject;
  setUser: Dispatch<any>;
}
//@ts-ignore
export const UserContext = createContext<userContext>({});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const contextValue = useMemo(() => ({
    user, setUser
  }), [user, setUser])

  useEffect(() => {
    if (localStorage.getItem("user")) {
      setUser(JSON.parse(localStorage.getItem("user")));
    }
  }, [])

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.reload();
  }
  return (
    <UserContext.Provider value={contextValue}>
      <Head>
        <title>Bingo Butler</title>
        <meta name="description" content="A bingo board game with Discord Bot integration" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossOrigin="anonymous" />
      </Head>
      <nav className="navbar navbar-expand" style={{backgroundColor: '#cd7b29'}}>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              {!!user && <button className="btn btn-secondary" style={{backgroundColor: "#832900", color: "##ffe69c"}} onClick={logout}>Logout</button>}
            </li>
          </ul>
        </div>
      </nav>
      <Component {...pageProps} />
      <footer className="footer">
        <p>kongi</p>
      </footer>
    </UserContext.Provider>
  )
}
export default MyApp
