import { createFileRoute, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getMarkdownContent } from "@/lib/markdown-pages";

export const Route = createFileRoute("/(public)/$slug")({
  loader: ({ params }) => {
    const content = getMarkdownContent("pages", params.slug);
    if (!content) throw notFound();
    return { content };
  },
  component: MarkdownPage,
});

function MarkdownPage() {
  const { content } = Route.useLoaderData();

  return (
    <div className="container max-w-3xl py-12">
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    </div>
  );
}
