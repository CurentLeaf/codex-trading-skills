import type { ReactNode } from "react";
import "./style.css";
export const metadata = {title:"MarketLab AI",description:"Market research and paper portfolio lab"};
export default function RootLayout({children}:{children:ReactNode}) {return <html lang="en"><body>{children}</body></html>}
