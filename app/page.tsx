import { HomePage } from '@/components/HomePage';
import { getPublicHomeContent } from '@/lib/server/site-settings';

export default async function Page() {
  const { content, contact } = await getPublicHomeContent();
  return <HomePage content={content} contact={contact} />;
}
