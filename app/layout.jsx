import './globals.css'

export const metadata = {
  title: 'VIIM Grid — vista previa de feed en Notion',
  description: 'Convierte tu calendario de contenido de Notion en una vista previa del feed de Instagram.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
