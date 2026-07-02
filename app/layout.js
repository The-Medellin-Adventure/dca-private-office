import "./globals.css";

export const metadata = {
  title: "Private Office",
  description: "Tu información. Bajo tu control.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-sans">{children}</body>
    </html>
  );
}
