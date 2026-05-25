import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './globals.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vibra — Educación emocional interactiva",
  description: "Vibra es un proyecto educativo que utiliza la tecnología para ayudar a estudiantes a explorar, comprender y gestionar sus emociones a través de actividades interactivas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
