import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "LearnAI – AI-Powered Interactive Learning Platform",
  description: "Master any subject through 3D models, simulations, AI tutoring, interactive quizzes, and personalized learning experiences.",
  keywords: "AI learning, interactive education, 3D models, simulations, quizzes, biology, physics, chemistry, mathematics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Suspense fallback={<div style={{ height: '64px', background: '#080b14', borderBottom: '1px solid rgba(255,255,255,0.06)' }} />}>
          <Navbar />
        </Suspense>
        <main style={{ minHeight: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
