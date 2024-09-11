import "./globals.css";
import { Montserrat } from "next/font/google";
import { Metadata } from "next";


const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MeasureMinds",
  description: "AI-driven converting tool",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning className={montserrat.className}>
        <head />
        <body>
            <div>{children}</div>
        </body>
      </html>
    </>
  );
}
