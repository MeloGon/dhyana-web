-- Habilita formatos de imagen estandar (JPG, PNG, WebP) en el bucket 'site-media'
-- para permitir la subida de la fotografia de perfil de la seccion "Sobre Nosotros".
update storage.buckets
set allowed_mime_types = array[
  'video/mp4',
  'video/webm',
  'image/svg+xml',
  'image/jpeg',
  'image/png',
  'image/webp'
]
where id = 'site-media';