// This is the root layout file — Next.js wraps every page with this.
// It sets the HTML structure, page title, and metadata.

export const metadata = {
  title: "Blockchain Voting App",
  description: "A university coursework demo of a blockchain-based voting system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {/* 'children' is replaced by the content of each page (e.g. page.js) */}
        {children}
      </body>
    </html>
  );
}