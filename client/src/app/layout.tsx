import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Maintenance Dispatch App",
  description:
    "A functional mini-portal where Property Managers can manage and assign maintenance tasks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}

        <ToastContainer
          position="top-right"
          autoClose={5000} // Close after 5 seconds
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
