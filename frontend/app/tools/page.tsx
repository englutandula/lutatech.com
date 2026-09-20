import { redirect } from 'next/navigation';

/**
 * The /tools/ catalog page has been removed.
 * All tool browsing now happens from /products/.
 */
export default function ToolsPage() {
  redirect('/products/');
}
