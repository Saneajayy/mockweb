import JournalClient from '@/components/JournalClient';

export default function Home() {
  const authorA = process.env.AUTHOR_A_NAME || 'Me';
  const authorB = process.env.AUTHOR_B_NAME || 'You';

  return <JournalClient authorA={authorA} authorB={authorB} />;
}
