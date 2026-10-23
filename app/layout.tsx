import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GymRex Operating System',
  description: 'High Performance Gym Operating System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0f1115] text-[#e5e7eb] min-h-screen">
        {children}
      </body>
    </html>
  );
}
