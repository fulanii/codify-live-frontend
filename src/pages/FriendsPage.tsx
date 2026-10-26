import { FriendSearch } from '../components/FriendSearch';

export function FriendsPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
      <p className="mt-2 text-sm text-ink-muted">Search for someone by username to add them.</p>

      <section className="mt-8 flex justify-center">
        <FriendSearch />
      </section>
    </div>
  );
}
