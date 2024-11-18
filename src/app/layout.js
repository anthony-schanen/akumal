import Providers from "./providers";

export const metadata = {
  title: "Zoho Analytics Integration",
  description: "Integrate Zoho Analytics with Next.js and NextAuth.js",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
