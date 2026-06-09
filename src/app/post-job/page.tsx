import { getDataStore } from "@/lib/data";
import PostJobForm from "./PostJobForm";

export const metadata = { title: "Post a job | Skill Trade" };

export default async function PostJobPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = await getDataStore().getCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Post your job</h1>
      <p className="mt-2 text-ink/70">
        Free, two minutes. Up to five local trades will get in touch.
      </p>
      <div className="mt-8">
        <PostJobForm categories={categories} initialCategory={category} />
      </div>
    </div>
  );
}
