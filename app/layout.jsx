import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../lib/auth"
import { LanguageProvider } from "../lib/language-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const metadata = {
  title: "Breedify - AI-Powered Livestock Classification",
  description:
    "Revolutionize cattle and buffalo breeding with AI precision. Automated image analysis for precise measurements and standardized scoring.",
  generator: "v0.app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
