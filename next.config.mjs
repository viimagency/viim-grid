/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Permite que Notion muestre el widget dentro de un bloque /embed
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
    ]
  },
}
export default nextConfig
