export function ContributorsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-neutral-950 mb-2">Contributors</h1>
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <ul className="space-y-2">
          <li className="text-neutral-800">
            <span className="font-medium">Calvin Williamson</span>{" "}
            <a
              href="https://github.com/calvinw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              @calvinw
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
