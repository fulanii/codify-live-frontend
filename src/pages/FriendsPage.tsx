import { FriendRequests } from '../components/FriendRequests';
import { FriendSearch } from '../components/FriendSearch';
import { FriendsList } from '../components/FriendsList';

export function FriendsPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
      <p className="mt-2 text-sm text-ink-muted">Search for someone by username to add them.</p>

      <section className="mt-8 flex justify-center">
        <FriendSearch />
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">Your friends</h2>
        <div className="mt-4">
          <FriendsList />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">Friend requests</h2>
        <div className="mt-4">
          <FriendRequests />
        </div>
      </section>
    </div>
  );
}
