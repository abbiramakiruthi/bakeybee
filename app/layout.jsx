import './globals.css'

export const metadata = {
  title: 'BakeyBee',
  description: 'Bakey Bee — handcrafted brownies, cakes & more',
  icons: {
    icon: '/icons/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
