import { PagePlaceholder } from '../components/PagePlaceholder';

export function ChatPage(): JSX.Element {
  return (
    <PagePlaceholder
      title="Chat"
      description="Direct messages over a single multiplexed WebSocket, with presence and typing indicators."
      icon="chat"
    />
  );
}
