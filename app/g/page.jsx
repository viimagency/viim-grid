import Grid from './Grid'

export const dynamic = 'force-dynamic'

export default function PaginaGrid({ searchParams }) {
  const config = {
    db: searchParams?.db || '',
    handle: searchParams?.handle || '',
    bio: searchParams?.bio || '',
    avatar: searchParams?.avatar || '',
    estado: searchParams?.estado || '',
    cliente: searchParams?.cliente || '',
    tema: searchParams?.tema || '',
  }
  return <Grid config={config} />
}
