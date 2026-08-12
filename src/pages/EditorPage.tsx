import { PagePlaceholder } from '../components/PagePlaceholder';

export function EditorPage(): JSX.Element {
  return (
    <PagePlaceholder
      title="Editor"
      description="Write and run code together in the browser, backed by a CRDT so concurrent edits converge."
      icon="code"
    />
  );
}
