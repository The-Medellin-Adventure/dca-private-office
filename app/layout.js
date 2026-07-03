import "./globals.css";

export const metadata = {
  title: "Private Office",
  description: "Tu información. Bajo tu control.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Private Office",
  },
};

export const viewport = {
  themeColor: "#1F2A3C",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-sans">{children}</body>
    </html>
  );
}
