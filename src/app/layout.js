import './globals.css';

export const metadata = {
  title: "Mahir'sClass",
  description: 'Assignment portal — answer and grade assignments',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
