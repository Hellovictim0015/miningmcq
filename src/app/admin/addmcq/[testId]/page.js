import { redirect } from 'next/navigation';

// Old copy of the student test page that scored tests in the browser and
// posted the score to /api/submit. The real test page is /mcq/[testId],
// which is scored on the server.
export default async function LegacyAddMcqPage({ params }) {
  const { testId } = await params;
  redirect(`/mcq/${testId}`);
}
